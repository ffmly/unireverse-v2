import { NextResponse } from "next/server"
import { collection, getDocs, doc, getDoc, query, where, orderBy, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { validateData, bookingSchema, sanitizeObject } from "@/lib/validation"
import { createRateLimit } from "@/lib/rateLimiter"
import { withAuth } from "@/lib/authMiddleware"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    const stadium = searchParams.get('stadium')
    
    // Validate userId if provided
    if (userId && (typeof userId !== 'string' || userId.trim().length === 0)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }
    
    // Build query based on provided parameters
    let bookingsQuery
    const queryConditions = []
    
    if (userId) {
      queryConditions.push(where('user_id', '==', userId.trim()))
    }
    
    if (date) {
      queryConditions.push(where('date', '==', date))
    }
    
    if (stadium) {
      queryConditions.push(where('stadium_id', '==', stadium))
    }
    
    if (queryConditions.length > 0) {
      bookingsQuery = query(collection(db, 'bookings'), ...queryConditions)
    } else {
      bookingsQuery = collection(db, 'bookings')
    }
    
    const bookingsSnapshot = await getDocs(bookingsQuery)
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Sort by date descending on the client side
    if (userId) {
      bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
    
    // For each booking, get the stadium, time slot, and user details
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking: any) => {
        const [stadiumDoc, timeSlotDoc, userDoc] = await Promise.all([
          getDoc(doc(db, 'stadiums', booking.stadium_id)),
          getDoc(doc(db, 'timeSlots', booking.time_slot_id)),
          getDoc(doc(db, 'users', booking.user_id))
        ])
        
        const stadium = stadiumDoc.exists() ? stadiumDoc.data() : null
        const timeSlot = timeSlotDoc.exists() ? timeSlotDoc.data() : null
        const user = userDoc.exists() ? userDoc.data() : null
        
        return {
          ...booking,
          stadiums: stadium ? { name: stadium.name, sport_id: stadium.sport_id } : null,
          time_slots: timeSlot ? { time: timeSlot.time, period: timeSlot.period } : null,
          user: user ? { 
            username: user.username, 
            fullName: user.fullName,
            clubName: user.clubName,
            email: user.email,
            role: user.role,
            studentId: user.studentId
          } : null
        }
      })
    )

    return NextResponse.json(enrichedBookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate and sanitize input data
    const validation = validateData(bookingSchema)(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 })
    }

    const { userId, stadiumId, date, timeSlotId } = sanitizeObject(validation.data)

    // Check if booking already exists
    const existingBookingsQuery = query(
      collection(db, 'bookings'),
      where('stadium_id', '==', stadiumId),
      where('date', '==', date),
      where('time_slot_id', '==', timeSlotId)
    )
    
    const existingBookingsSnapshot = await getDocs(existingBookingsQuery)
    const existingBookings = existingBookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    if (existingBookings.length > 0) {
      return NextResponse.json({ error: "This time slot is already booked for this stadium" }, { status: 400 })
    }

    // Create new booking
    const bookingData = {
      user_id: userId,
      stadium_id: stadiumId,
      date,
      time_slot_id: timeSlotId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(collection(db, 'bookings'), bookingData)
    const data = {
      id: docRef.id,
      ...bookingData
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
