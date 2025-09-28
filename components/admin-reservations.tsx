"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Plus, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { collection, query, getDocs, doc, getDoc, where, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

interface Reservation {
  id: string
  clubId: string
  clubName: string
  sportId: string
  sportName: string
  date: string
  time: string
  fieldName: string
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t, language } = useLanguage()
  const { user } = useAuth()

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    clubId: "",
    sportId: "",
    date: "",
    time: "",
    fieldName: "",
  })

  // Real data for dropdowns
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([])
  const [sports] = useState([
    { id: "basketball", name: t("sports.basketball") },
    { id: "handball", name: t("sports.handball") },
    { id: "football", name: t("sports.football") },
  ])
  const [times, setTimes] = useState<{ id: string; time: string }[]>([])
  const [fields, setFields] = useState<{ id: string; name: string }[]>([])

  // Fetch clubs and time slots
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users using API
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          const clubUsers = usersData
            .filter((user: any) => user.role !== 'admin')
            .map((user: any) => ({
              id: user.id,
              name: user.fullName || user.username || `User ${user.id.substring(0, 8)}`
            }))
          setClubs(clubUsers)
        }

        // Fetch time slots using API
        const timeSlotsResponse = await fetch('/api/time-slots')
        if (timeSlotsResponse.ok) {
          const timeSlotsData = await timeSlotsResponse.json()
          setTimes(timeSlotsData.map((slot: any) => ({
            id: slot.id,
            time: slot.time
          })))
        }

        // Fetch stadiums using API
        const stadiumsResponse = await fetch('/api/stadiums')
        if (stadiumsResponse.ok) {
          const stadiumsData = await stadiumsResponse.json()
          setFields(stadiumsData.map((stadium: any) => ({
            id: stadium.id,
            name: stadium.name
          })))
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user || user.role !== 'admin') {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // Fetch all bookings using the API route
        const response = await fetch('/api/bookings')
        if (!response.ok) {
          throw new Error("Failed to fetch reservations")
        }

        const data = await response.json()
        
        // Transform data to match component format
        const transformedReservations = data.map((booking: any) => ({
          id: booking.id,
          clubId: booking.user_id,
          clubName: booking.user?.fullName || booking.user?.username || `User ${booking.user_id.substring(0, 8)}`,
          sportId: booking.stadiums?.sport_id || 'unknown',
          sportName: getSportName(booking.stadiums?.sport_id),
          date: booking.date,
          time: booking.time_slots?.time || 'Unknown',
          fieldName: booking.stadiums?.name || 'Unknown Stadium',
        }))

        setReservations(transformedReservations)
      } catch (error) {
        console.error('Error fetching reservations:', error)
        toast({
          title: "خطأ في تحميل الحجوزات",
          description: "حدث خطأ أثناء محاولة تحميل الحجوزات. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [user])

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddReservation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clubId || !formData.sportId || !formData.date || !formData.time || !formData.fieldName) {
      toast({
        title: language === "ar" ? "خطأ في الإدخال" : "Input Error",
        description: language === "ar" 
          ? "يرجى ملء جميع الحقول المطلوبة" 
          : "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      // Create reservation in Firebase through our API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.clubId,
          stadiumId: formData.fieldName,
          date: formData.date,
          timeSlotId: formData.time,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create reservation')
      }

      const newReservationData = await response.json()
      
      // Find club and field names for display
      const club = clubs.find((c) => c.id === formData.clubId)
      const field = fields.find((f) => f.id === formData.fieldName)
      const timeSlot = times.find((t) => t.id === formData.time)
      
      // Add to local state
      const newReservation: Reservation = {
        id: newReservationData.id,
        clubId: formData.clubId,
        clubName: club?.name || 'Unknown Club',
        sportId: formData.sportId,
        sportName: getSportName(formData.sportId),
        date: formData.date,
        time: timeSlot?.time || 'Unknown',
        fieldName: field?.name || 'Unknown Stadium',
      }

      setReservations([...reservations, newReservation])
      setIsAddDialogOpen(false)
      setFormData({ clubId: "", sportId: "", date: "", time: "", fieldName: "" })

      toast({
        title: language === "ar" ? "تم إضافة الحجز" : "Reservation Added",
        description: language === "ar" ? "تم إضافة الحجز بنجاح" : "The reservation has been added successfully",
      })
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast({
        title: language === "ar" ? "فشل إضافة الحجز" : "Failed to Add Reservation",
        description: language === "ar"
          ? "حدث خطأ أثناء محاولة إضافة الحجز. يرجى المحاولة مرة أخرى."
          : "An error occurred while trying to add the reservation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setFormData({
      clubId: reservation.clubId,
      sportId: reservation.sportId,
      date: reservation.date,
      time: reservation.time,
      fieldName: reservation.fieldName,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateReservation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedReservation) return

    try {
      // Update reservation in Firebase through our API
      const response = await fetch(`/api/bookings/${selectedReservation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.clubId,
          stadiumId: formData.fieldName,
          date: formData.date,
          timeSlotId: formData.time,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update reservation')
      }

      const club = clubs.find((c) => c.id === formData.clubId)
      const field = fields.find((f) => f.id === formData.fieldName)
      const timeSlot = times.find((t) => t.id === formData.time)

      const updatedReservations = reservations.map((reservation) =>
        reservation.id === selectedReservation.id
          ? {
              ...reservation,
              clubId: formData.clubId,
              clubName: club?.name || 'Unknown Club',
              sportId: formData.sportId,
              sportName: getSportName(formData.sportId),
              date: formData.date,
              time: timeSlot?.time || 'Unknown',
              fieldName: field?.name || 'Unknown Stadium',
            }
          : reservation,
      )

      setReservations(updatedReservations)
      setIsEditDialogOpen(false)
      setSelectedReservation(null)

      toast({
        title: language === "ar" ? "تم تحديث الحجز" : "Reservation Updated",
        description: language === "ar" ? "تم تحديث بيانات الحجز بنجاح" : "The reservation has been updated successfully",
      })
    } catch (error) {
      console.error('Error updating reservation:', error)
      toast({
        title: language === "ar" ? "فشل تحديث الحجز" : "Failed to Update Reservation",
        description: language === "ar"
          ? "حدث خطأ أثناء محاولة تحديث الحجز. يرجى المحاولة مرة أخرى."
          : "An error occurred while trying to update the reservation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReservation = async (reservationId: string) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من رغبتك في حذف هذا الحجز؟" : "Are you sure you want to delete this reservation?")) return

    try {
      // Delete reservation from Firebase through our API
      const response = await fetch(`/api/bookings/${reservationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete reservation')
      }

      setReservations(reservations.filter((reservation) => reservation.id !== reservationId))

      toast({
        title: language === "ar" ? "تم حذف الحجز" : "Reservation Deleted",
        description: language === "ar" ? "تم حذف الحجز بنجاح" : "The reservation has been deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting reservation:', error)
      toast({
        title: language === "ar" ? "فشل حذف الحجز" : "Failed to Delete Reservation",
        description: language === "ar"
          ? "حدث خطأ أثناء محاولة حذف الحجز. يرجى المحاولة مرة أخرى."
          : "An error occurred while trying to delete the reservation. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-2">Loading reservations...</span>
      </div>
    )
  }

  if (reservations.length === 0) {
    return (
      <div>
        <div className="mb-6 flex justify-between">
          <h2 className="text-xl font-semibold">إدارة الحجوزات</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                إضافة حجز جديد
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة حجز جديد</DialogTitle>
                <DialogDescription>أدخل بيانات الحجز الجديد.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddReservation}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الطالب</label>
                    <Select
                      value={formData.clubId}
                      onValueChange={(value) => handleSelectChange("clubId", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الطالب" />
                      </SelectTrigger>
                      <SelectContent>
                        {clubs.map((club) => (
                          <SelectItem key={club.id} value={club.id}>
                            {club.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الرياضة</label>
                    <Select
                      value={formData.sportId}
                      onValueChange={(value) => handleSelectChange("sportId", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الرياضة" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">التاريخ</label>
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.date}
                      onChange={(e) => handleSelectChange("date", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الوقت</label>
                    <Select value={formData.time} onValueChange={(value) => handleSelectChange("time", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الوقت" />
                      </SelectTrigger>
                      <SelectContent>
                        {times.map((time) => (
                          <SelectItem key={time.id} value={time.id}>
                            {time.time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الملعب</label>
                    <Select
                      value={formData.fieldName}
                      onValueChange={(value) => handleSelectChange("fieldName", value)}
                      required
                      disabled={!formData.sportId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الملعب" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">إضافة الحجز</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-6xl">📅</div>
              <h3 className="text-xl font-semibold">لا توجد حجوزات</h3>
              <p className="text-muted-foreground">لم يتم إنشاء أي حجوزات بعد. يمكنك إضافة حجز جديد باستخدام الزر أعلاه.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h2 className="text-xl font-semibold">إدارة الحجوزات</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              إضافة حجز جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة حجز جديد</DialogTitle>
              <DialogDescription>أدخل بيانات الحجز الجديد.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddReservation}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">النادي</label>
                  <Select
                    value={formData.clubId}
                    onValueChange={(value) => handleSelectChange("clubId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النادي" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الرياضة</label>
                  <Select
                    value={formData.sportId}
                    onValueChange={(value) => handleSelectChange("sportId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الرياضة" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">التاريخ</label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.date}
                    onChange={(e) => handleSelectChange("date", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الوقت</label>
                  <Select value={formData.time} onValueChange={(value) => handleSelectChange("time", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الوقت" />
                    </SelectTrigger>
                    <SelectContent>
                      {times.map((time) => (
                        <SelectItem key={time.id} value={time.id}>
                          {time.time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الملعب</label>
                  <Select
                    value={formData.fieldName}
                    onValueChange={(value) => handleSelectChange("fieldName", value)}
                    required
                    disabled={!formData.sportId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الملعب" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">إضافة الحجز</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الطالب</TableHead>
                <TableHead>الرياضة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوقت</TableHead>
                <TableHead>الملعب</TableHead>
                <TableHead className="w-[100px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.clubName}</TableCell>
                  <TableCell>{reservation.sportName}</TableCell>
                  <TableCell>{format(new Date(reservation.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{reservation.time}</TableCell>
                  <TableCell>{reservation.fieldName}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditReservation(reservation)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteReservation(reservation.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الحجز</DialogTitle>
            <DialogDescription>قم بتعديل بيانات الحجز.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateReservation}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الطالب</label>
                <Select value={formData.clubId} onValueChange={(value) => handleSelectChange("clubId", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطالب" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الرياضة</label>
                <Select
                  value={formData.sportId}
                  onValueChange={(value) => handleSelectChange("sportId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الرياضة" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">التاريخ</label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.date}
                  onChange={(e) => handleSelectChange("date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الوقت</label>
                <Select value={formData.time} onValueChange={(value) => handleSelectChange("time", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الوقت" />
                  </SelectTrigger>
                  <SelectContent>
                    {times.map((time) => (
                      <SelectItem key={time.id} value={time.id}>
                        {time.time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الملعب</label>
                <Select
                  value={formData.fieldName}
                  onValueChange={(value) => handleSelectChange("fieldName", value)}
                  required
                  disabled={!formData.sportId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الملعب" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">حفظ التغييرات</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
