"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminClubs from "@/components/admin-clubs"
import AdminReservations from "@/components/admin-reservations"
import AdminAutoAssign from "@/components/admin-auto-assign"
import AdminStadiums from "@/components/admin-stadiums"
import AdminTimeSlots from "@/components/admin-time-slots"
import ThemeToggle from "@/components/theme-toggle"
import LanguageToggle from "@/components/language-toggle"
import Notifications from "@/components/notifications"

export default function AdminDashboard() {
  const { user, isLoading, logout } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "admin") {
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
          <h1 className="text-2xl font-bold">{t("admin.dashboard")}</h1>
          <p className="text-muted-foreground">{t("admin.manageDashboard")}</p>
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

      <Tabs defaultValue="clubs">
        <TabsList className="mb-6 grid w-full grid-cols-5">
          <TabsTrigger value="clubs">{t("admin.tab.clubs")}</TabsTrigger>
          <TabsTrigger value="reservations">{t("admin.tab.reservations")}</TabsTrigger>
          <TabsTrigger value="stadiums">{t("admin.tab.stadiums")}</TabsTrigger>
          <TabsTrigger value="timeSlots">{t("admin.tab.timeSlots")}</TabsTrigger>
          <TabsTrigger value="auto-assign">{t("admin.tab.autoAssign")}</TabsTrigger>
        </TabsList>

        <TabsContent value="clubs">
          <AdminClubs />
        </TabsContent>

        <TabsContent value="reservations">
          <AdminReservations />
        </TabsContent>

        <TabsContent value="stadiums">
          <AdminStadiums />
        </TabsContent>

        <TabsContent value="timeSlots">
          <AdminTimeSlots />
        </TabsContent>

        <TabsContent value="auto-assign">
          <AdminAutoAssign />
        </TabsContent>
      </Tabs>
    </main>
  )
}
