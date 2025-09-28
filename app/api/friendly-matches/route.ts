import { NextResponse } from "next/server"
import { collection, getDocs, doc, getDoc, query, where, orderBy, addDoc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { validateData, friendlyMatchSchema, sanitizeObject } from "@/lib/validation"
import { createRateLimit } from "@/lib/rateLimiter"
import { withAuth } from "@/lib/authMiddleware"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Get friendly matches
    let matchesQuery
    if (userId) {
      matchesQuery = query(
        collection(db, 'friendlyMatches'), 
        where('hostId', '==', userId)
      )
    } else {
      matchesQuery = collection(db, 'friendlyMatches')
    }
    
    const matchesSnapshot = await getDocs(matchesQuery)
    const matches = matchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // If no matches exist, return empty array instead of error
    if (matches.length === 0) {
      console.log('📭 No friendly matches found - returning empty array');
      return NextResponse.json([])
    }
    
    // Sort by date descending on the client side
    matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // For each match, get the stadium and user details
    const enrichedMatches = await Promise.all(
      matches.map(async (match: any) => {
        const [stadiumDoc, hostDoc, guestDoc] = await Promise.all([
          getDoc(doc(db, 'stadiums', match.stadiumId)),
          getDoc(doc(db, 'users', match.hostId)),
          match.guestId ? getDoc(doc(db, 'users', match.guestId)) : Promise.resolve(null)
        ])
        
        const stadium = stadiumDoc.exists() ? stadiumDoc.data() : null
        const host = hostDoc.exists() ? hostDoc.data() : null
        const guest = guestDoc?.exists() ? guestDoc.data() : null
        
        return {
          ...match,
          stadium: stadium ? { 
            id: match.stadiumId, 
            name: stadium.name,
            capacity: stadium.capacity 
          } : null,
          host: host ? { 
            id: match.hostId,
            name: host.fullName || host.username,
            email: host.email
          } : null,
          guest: guest ? { 
            id: match.guestId,
            name: guest.fullName || guest.username,
            email: guest.email
          } : null,
          // Ensure backward compatibility for older matches
          maxPlayers: match.maxPlayers || 10,
          currentPlayers: match.currentPlayers || (match.players ? match.players.length : 1),
          skillLevel: match.skillLevel || 'any',
          isPublic: match.isPublic !== undefined ? match.isPublic : true
        }
      })
    )

    return NextResponse.json(enrichedMatches)
  } catch (error) {
    console.error("Error fetching friendly matches:", error)
    return NextResponse.json({ error: "Failed to fetch friendly matches" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate and sanitize input data
    const validation = validateData(friendlyMatchSchema)(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 })
    }

    const { 
      hostId, 
      stadiumId, 
      date, 
      time, 
      team1, 
      team2, 
      sportId, 
      maxPlayers, 
      currentPlayers,
      description,
      skillLevel,
      isPublic 
    } = sanitizeObject(validation.data)

    // Check if stadium exists and get its capacity
    const stadiumDoc = await getDoc(doc(db, 'stadiums', stadiumId))
    if (!stadiumDoc.exists()) {
      return NextResponse.json({ error: "Stadium not found" }, { status: 404 })
    }

    const stadium = stadiumDoc.data()
    
    // Validate max players doesn't exceed stadium capacity
    if (maxPlayers > stadium.capacity) {
      return NextResponse.json({ 
        error: `Maximum players (${maxPlayers}) cannot exceed stadium capacity (${stadium.capacity})` 
      }, { status: 400 })
    }

    // Check if stadium is available at that time (stadium-specific check)
    const existingBookingsQuery = query(
      collection(db, 'bookings'),
      where('stadium_id', '==', stadiumId),
      where('date', '==', date),
      where('time_slot_id', '==', time)
    )
    
    const existingBookingsSnapshot = await getDocs(existingBookingsQuery)
    if (existingBookingsSnapshot.docs.length > 0) {
      return NextResponse.json({ 
        error: `Stadium "${stadium.name}" is already booked at ${time} on ${date}` 
      }, { status: 400 })
    }

    // Check for conflicting friendly matches on the same stadium and time
    const existingMatchesQuery = query(
      collection(db, 'friendlyMatches'),
      where('stadiumId', '==', stadiumId),
      where('date', '==', date),
      where('time', '==', time),
      where('status', 'in', ['pending', 'confirmed'])
    )
    
    const existingMatchesSnapshot = await getDocs(existingMatchesQuery)
    if (existingMatchesSnapshot.docs.length > 0) {
      return NextResponse.json({ 
        error: `Stadium "${stadium.name}" already has a friendly match at ${time} on ${date}` 
      }, { status: 400 })
    }

    // Create new friendly match
    const matchData = {
      hostId,
      stadiumId,
      date,
      time,
      team1,
      team2: team2 || 'Open',
      sportId,
      maxPlayers,
      currentPlayers: currentPlayers || 1, // Host is the first player
      description: description || '',
      skillLevel: skillLevel || 'any',
      isPublic: isPublic !== undefined ? isPublic : true,
      status: 'pending',
      players: [hostId], // Array of player IDs
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(collection(db, 'friendlyMatches'), matchData)
    const data = {
      id: docRef.id,
      ...matchData,
      stadium: {
        id: stadiumId,
        name: stadium.name,
        capacity: stadium.capacity
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating friendly match:", error)
    return NextResponse.json({ error: "Failed to create friendly match" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { matchId, guestId, status, action } = await request.json()

    const matchRef = doc(db, 'friendlyMatches', matchId)
    const matchDoc = await getDoc(matchRef)
    
    if (!matchDoc.exists()) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    const matchData = matchDoc.data()
    const updateData: any = {
      updatedAt: serverTimestamp()
    }
    
    // Handle different actions
    if (action === 'join') {
      // Check if match is full
      if (matchData.currentPlayers >= matchData.maxPlayers) {
        return NextResponse.json({ 
          error: "Match is full. Cannot join." 
        }, { status: 400 })
      }
      
      // Check if user is already in the match
      if (matchData.players && matchData.players.includes(guestId)) {
        return NextResponse.json({ 
          error: "You are already in this match" 
        }, { status: 400 })
      }
      
      // Add player to match
      updateData.players = [...(matchData.players || []), guestId]
      updateData.currentPlayers = (matchData.currentPlayers || 1) + 1
      updateData.guestId = guestId
    } else if (action === 'leave') {
      // Remove player from match
      if (matchData.players && matchData.players.includes(guestId)) {
        updateData.players = matchData.players.filter((id: string) => id !== guestId)
        updateData.currentPlayers = Math.max(1, (matchData.currentPlayers || 1) - 1)
        
        // If host leaves, make the first remaining player the host
        if (matchData.hostId === guestId && updateData.players.length > 0) {
          updateData.hostId = updateData.players[0]
        }
      }
    } else if (guestId) {
      updateData.guestId = guestId
    }
    
    if (status) {
      updateData.status = status
    }
    
    await updateDoc(matchRef, updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating friendly match:", error)
    return NextResponse.json({ error: "Failed to update friendly match" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 })
    }

    await deleteDoc(doc(db, 'friendlyMatches', matchId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting friendly match:", error)
    return NextResponse.json({ error: "Failed to delete friendly match" }, { status: 500 })
  }
}
