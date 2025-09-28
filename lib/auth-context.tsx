"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { auth, db } from "@/lib/firebase"

interface User {
  id: string
  username: string
  fullName: string
  studentId: string
  role: string
  email: string
  clubName?: string
  department?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  register: (email: string, password: string, fullName: string, studentId: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user profile data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              username: userData.username || '',
              fullName: userData.fullName || '',
              studentId: userData.studentId || '',
              role: userData.role || 'user',
              clubName: userData.clubName || '',
              department: userData.department || ''
            })
          } else {
            // If no user document exists, create a basic user object
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              username: firebaseUser.email?.split('@')[0] || '',
              fullName: '',
              studentId: '',
              role: 'user',
              clubName: '',
              department: ''
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      let email = username
      
      // If username doesn't contain @, we need to find the user's email from Firestore
      if (!username.includes('@')) {
        try {
          // Query Firestore to find user by username
          const usersRef = collection(db, 'users')
          const q = query(usersRef, where('username', '==', username))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            // Found user, get their email
            const userDoc = querySnapshot.docs[0]
            email = userDoc.data().email
          } else {
            // User not found, try the default domain
            email = `${username}@university.edu`
          }
        } catch (error) {
          console.error('Error finding user email:', error)
          // Fallback to default domain
          email = `${username}@university.edu`
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (email: string, password: string, fullName: string, studentId: string): Promise<boolean> => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid)
      await setDoc(userDocRef, {
        username: email.split('@')[0], // Use email prefix as username
        email: email,
        fullName: fullName,
        studentId: studentId,
        role: 'user', // Default role for new registrations
        clubName: '', // Empty for individual users
        department: '', // Empty for individual users
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
