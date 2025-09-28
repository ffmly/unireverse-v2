"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import BookingCalendar from "@/components/booking-calendar"
import UserReservations from "@/components/user-reservations"
import FriendlyMatches from "@/components/friendly-matches"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ThemeToggle from "@/components/theme-toggle"
import LanguageToggle from "@/components/language-toggle"
import Notifications from "@/components/notifications"

export default function BookingPage() {
  const { user, isLoading, logout } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <main dir={language === "ar" ? "rtl" : "ltr"} className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t("booking.welcome")} {user.fullName}
          </h1>
          <p className="text-muted-foreground">
            {t("booking.userProfile")} - {user.studentId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Notifications />
          <LanguageToggle />
          <ThemeToggle />
          <Button variant="outline" onClick={logout}>
            {t("booking.logout")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="book">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="book">{t("booking.tab.book")}</TabsTrigger>
          <TabsTrigger value="reservations">{t("booking.tab.reservations")}</TabsTrigger>
          <TabsTrigger value="friendlyMatches">{t("booking.tab.friendlyMatches")}</TabsTrigger>
        </TabsList>

        <TabsContent value="book">
          <BookingCalendar userId={user.id} />
        </TabsContent>

        <TabsContent value="reservations">
          <UserReservations userId={user.id} />
        </TabsContent>

        <TabsContent value="friendlyMatches">
          <FriendlyMatches />
        </TabsContent>
      </Tabs>
    </main>
  )
}
