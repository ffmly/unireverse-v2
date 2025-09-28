import { NextResponse } from "next/server"
import { collection, getDocs, addDoc, serverTimestamp, query, where, getDocs as getDocsQuery } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { validateData, timeSlotSchema, sanitizeObject } from "@/lib/validation"
import { createRateLimit } from "@/lib/rateLimiter"
import { withAdminAuth } from "@/lib/authMiddleware"

export async function GET() {
  try {
    // Direct Firestore access without authentication for public data
    const timeSlotsSnapshot = await getDocs(collection(db, 'timeSlots'))
    const data = timeSlotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching time slots:", error)
    return NextResponse.json({ error: "Failed to fetch time slots" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate and sanitize input data
    const validation = validateData(timeSlotSchema)(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 })
    }

    const { time, duration, isActive } = sanitizeObject(validation.data)

    // Check if time slot already exists
    const existingQuery = query(
      collection(db, 'timeSlots'),
      where('time', '==', time)
    )
    const existingSlots = await getDocsQuery(existingQuery)

    if (!existingSlots.empty) {
      return NextResponse.json({ error: "Time slot already exists" }, { status: 400 })
    }

    // Create time slot in Firestore
    const timeSlotData = {
      time,
      duration,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'timeSlots'), timeSlotData)
    
    return NextResponse.json({
      id: docRef.id,
      ...timeSlotData
    })
  } catch (error) {
    console.error("Error creating time slot:", error)
    return NextResponse.json({ error: "Failed to create time slot" }, { status: 500 })
  }
}
