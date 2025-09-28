"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { toast } from "@/components/ui/use-toast"
import { CalendarDays, Clock, MapPin, AlertCircle } from "lucide-react"
import { collection, query, where, getDocs, doc, getDoc, orderBy, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

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
        // Fetch bookings directly from Firestore with client-side authentication
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('user_id', '==', userId)
        )
        
        const bookingsSnapshot = await getDocs(bookingsQuery)
        const bookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Sort by date descending
        bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        // For each booking, get the stadium and time slot details
        const enrichedBookings = await Promise.all(
          bookings.map(async (booking: any) => {
            const [stadiumDoc, timeSlotDoc] = await Promise.all([
              getDoc(doc(db, 'stadiums', booking.stadium_id)),
              getDoc(doc(db, 'timeSlots', booking.time_slot_id))
            ])
            
            const stadium = stadiumDoc.exists() ? stadiumDoc.data() : null
            const timeSlot = timeSlotDoc.exists() ? timeSlotDoc.data() : null
            
            return {
              id: booking.id,
              sportId: stadium?.sport_id || 'unknown',
              sportName: getSportName(stadium?.sport_id),
              date: booking.date,
              time: timeSlot?.time || 'Unknown',
              fieldName: stadium?.name || 'Unknown Stadium',
            }
          })
        )

        setReservations(enrichedBookings)
      } catch (error) {
        console.error('Error fetching reservations:', error)
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

    if (userId) {
      fetchReservations()
    }
  }, [userId, language])

  const getSportName = (sportId: string) => {
    switch (sportId) {
      case 'basketball':
        return t("sports.basketball")
      case 'football':
        return t("sports.football")
      case 'handball':
        return t("sports.handball")
      default:
        return sportId
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      // Delete the reservation directly from Firestore
      await deleteDoc(doc(db, 'bookings', reservationId))

      // Remove the reservation from local state
      setReservations(prev => prev.filter(r => r.id !== reservationId))

      toast({
        title: language === "ar" ? "تم إلغاء الحجز" : "Reservation Cancelled",
        description: language === "ar" ? "تم إلغاء الحجز بنجاح" : "Reservation has been cancelled successfully",
      })
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      toast({
        title: language === "ar" ? "خطأ في إلغاء الحجز" : "Error cancelling reservation",
        description: language === "ar" ? "حدث خطأ أثناء إلغاء الحجز" : "An error occurred while cancelling the reservation",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("reservations.noReservations")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-2">{language === "ar" ? "جاري التحميل..." : "Loading..."}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (reservations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("reservations.noReservations")}</CardTitle>
          <CardDescription>{t("reservations.noReservationsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === "ar" ? "لا توجد حجوزات حالياً" : "No reservations found"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <Card key={reservation.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{reservation.sportName}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {reservation.fieldName}
                </CardDescription>
              </div>
              <Badge variant="secondary">{reservation.sportId}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(reservation.date).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {reservation.time}
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleCancelReservation(reservation.id)}
              >
                {t("reservations.cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
