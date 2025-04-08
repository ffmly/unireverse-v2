"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  username: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Get user profile data
        const { data: userData } = await supabase
          .from("profiles")
          .select("username, role")
          .eq("id", session.user.id)
          .single()

        if (userData) {
          setUser({
            id: session.user.id,
            username: userData.username,
            role: userData.role,
          })
        }
      }

      setIsLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Get user profile data
        const { data: userData } = await supabase
          .from("profiles")
          .select("username, role")
          .eq("id", session.user.id)
          .single()

        if (userData) {
          setUser({
            id: session.user.id,
            username: userData.username,
            role: userData.role,
          })
        }
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (username: string, password: string) => {
    try {
      // First, get the user's email from the username
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username)
        .single()

      if (userError || !userData) {
        return false
      }

      // Sign in with email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      })

      return !error
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
