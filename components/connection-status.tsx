"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw } from "lucide-react"

interface ConnectionStatusProps {
  onConnectionSuccess: () => void
}

export default function ConnectionStatus({ onConnectionSuccess }: ConnectionStatusProps) {
  const { t, language } = useLanguage()
  const [isOnline, setIsOnline] = useState(true)
  const [isChecking, setIsChecking] = useState(true)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      // Try to fetch a small resource to check connection
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch("/api/ping", {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        setIsOnline(true)
        onConnectionSuccess() // Immediately proceed if online
      } else {
        setIsOnline(false)
      }
    } catch (error) {
      setIsOnline(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()

    // Set up event listeners for online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      onConnectionSuccess() // Immediately proceed when connection is restored
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [onConnectionSuccess])

  // Only render the error screen when offline
  if (isOnline) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="flex flex-col items-center space-y-6">
        <WifiOff className="h-32 w-32 text-red-500" />
        <h1 className="text-3xl font-bold text-red-500">
          {language === "ar" ? "لا يوجد اتصال بالإنترنت" : "No Internet Connection"}
        </h1>
        <p className="text-lg text-muted-foreground">
          {language === "ar"
            ? "يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
            : "Please check your internet connection and try again."}
        </p>
        <Button onClick={checkConnection} disabled={isChecking} size="lg" className="mt-4">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {language === "ar" ? "جاري التحقق..." : "Checking..."}
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {language === "ar" ? "إعادة المحاولة" : "Try Again"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
