import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore"
import { validateData, userSchema, sanitizeObject } from "@/lib/validation"
import { createRateLimit } from "@/lib/rateLimiter"
import { withAdminAuth } from "@/lib/authMiddleware"

export async function GET() {
  try {
    // Fetch users directly from Firestore
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate and sanitize input data
    const validation = validateData(userSchema)(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 })
    }

    const userData = sanitizeObject(validation.data)

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    )

    const firebaseUser = userCredential.user
    
    // Create user document in Firestore using Firebase Auth UID as document ID
    const userDocRef = doc(db, 'users', firebaseUser.uid)
    await setDoc(userDocRef, {
      username: userData.username,
      email: userData.email,
      role: userData.role || 'club',
      clubName: userData.clubName || '',
      department: userData.department || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // Return the created user with the Firebase UID
    return NextResponse.json({
      id: firebaseUser.uid,
      username: userData.username,
      email: userData.email,
      role: userData.role || 'club',
      clubName: userData.clubName || '',
      department: userData.department || ''
    })
  } catch (error: any) {
    console.error("Error creating user:", error)
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json({ 
        error: "Email already exists" 
      }, { status: 400 })
    }
    
    if (error.code === 'auth/weak-password') {
      return NextResponse.json({ 
        error: "Password is too weak" 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: "Failed to create user" 
    }, { status: 500 })
  }
} 