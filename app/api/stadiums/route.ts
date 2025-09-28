import { NextResponse } from "next/server"
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { validateData, stadiumSchema, sanitizeObject } from "@/lib/validation"
import { createRateLimit } from "@/lib/rateLimiter"
import { withAdminAuth } from "@/lib/authMiddleware"

export async function GET() {
  try {
    // Direct Firestore access without authentication for public data
    const stadiumsSnapshot = await getDocs(collection(db, 'stadiums'))
    const data = stadiumsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching stadiums:", error)
    return NextResponse.json({ error: "Failed to fetch stadiums" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate and sanitize input data
    const validation = validateData(stadiumSchema)(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 })
    }

    const { name, location, capacity, facilities } = sanitizeObject(validation.data)

    // Create stadium in Firestore
    const stadiumData = {
      name,
      location,
      capacity,
      facilities: facilities || [],
      enabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'stadiums'), stadiumData)
    
    return NextResponse.json({
      id: docRef.id,
      ...stadiumData
    })
  } catch (error) {
    console.error("Error creating stadium:", error)
    return NextResponse.json({ error: "Failed to create stadium" }, { status: 500 })
  }
}
