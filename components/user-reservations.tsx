"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Clock,
  ClubIcon as Football,
  MapPin,
  ShoppingBasketIcon as Basketball,
  Trash2,
  HandIcon,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/language-context"
import { Badge } from "@/components/ui/badge"

interface Reservation {
  id: string
  sportId: string
  sportName: string
  date: string
  time: string
  fieldName: string
}

interface UserReservationsProps {
  userId: string
}

export default function UserReservations({ userId }: UserReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t, language } = useLanguage()

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setReservations([
          {
            id: "1",
            sportId: "basketball",
            sportName: "كرة السلة",
            date: "2025-04-24",
            time: "08:00",
            fieldName: "ملعب كرة السلة 1",
          },
          {
            id: "2",
            sportId: "football",
            sportName: "كرة القدم",
            date: "2025-04-26",
            time: "14:00",
            fieldName: "ملعب كرة القدم الرئيسي",
          },
        ])
      } catch (error) {
        toast({
          title: language === "ar" ? "خطأ في تحميل الحجوزات" : "Error loading reservations",
          description:
            language === "ar"
              ? "حدث خطأ أثناء محاولة تحميل الحجوزات. يرجى المحاولة مرة أخرى."
              : "An error occurred while trying to load reservations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [userId, language])

  const handleCancelReservation = async (reservationId: string) => {
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setReservations(reservations.filter((r) => r.id !== reservationId))

      toast({
        title: language === "ar" ? "تم إلغاء الحجز" : "Reservation Cancelled",
        description: language === "ar" ? "تم إلغاء الحجز بنجاح" : "The reservation has been cancelled successfully",
      })
    } catch (error) {
      toast({
        title: language === "ar" ? "فشل إلغاء الحجز" : "Cancellation Failed",
        description:
          language === "ar"
            ? "حدث خطأ أثناء محاولة إلغاء الحجز. يرجى المحاولة مرة أخرى."
            : "An error occurred while trying to cancel the reservation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getSportIcon = (sportId: string) => {
    switch (sportId) {
      case "basketball":
        return <Basketball className="h-5 w-5 text-orange-500" />
      case "handball":
        return <HandIcon className="h-5 w-5 text-purple-500" />
      case "football":
        return <Football className="h-5 w-5 text-blue-500" />
      default:
        return <Basketball className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (reservations.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-xl font-medium">{t("reservations.noReservations")}</h3>
        <p className="text-muted-foreground">{t("reservations.noReservationsDesc")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <Card key={reservation.id} className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-transparent h-2" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              {getSportIcon(reservation.sportId)}
              {t(`sports.${reservation.sportId}`)}
              <Badge variant="outline" className="ml-auto">
                {reservation.time === "08:00" ? t("booking.morning") : t("booking.afternoon")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(reservation.date), "EEEE d MMMM yyyy", {
                    locale: language === "ar" ? ar : undefined,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{reservation.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{reservation.fieldName}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" className="w-full" onClick={() => handleCancelReservation(reservation.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t("reservations.cancel")}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
