"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import ThemeToggle from "@/components/theme-toggle"
import LanguageToggle from "@/components/language-toggle"
import ConnectionStatus from "@/components/connection-status"

export default function Home() {
  const { user, isLoading } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  const [connectionChecked, setConnectionChecked] = useState(false)

  useEffect(() => {
    if (connectionChecked && user && !isLoading) {
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/booking")
      }
    }
  }, [user, isLoading, router, connectionChecked])

  if (!connectionChecked) {
    return <ConnectionStatus onConnectionSuccess={() => setConnectionChecked(true)} />
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <main
      dir={language === "ar" ? "rtl" : "ltr"}
      className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
    >
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">{t("login.title")}</h1>
        <LoginForm />
      </div>
    </main>
  )
}
