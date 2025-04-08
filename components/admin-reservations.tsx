"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
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

  // Mock data for dropdowns
  const clubs = [
    { id: "1", name: "نادي أثلتيك يونايتد" },
    { id: "2", name: "نجوم كرة القدم" },
    { id: "3", name: "نادي التنس" },
  ]

  const sports = [
    { id: "tennis", name: "التنس" },
    { id: "handball", name: "كرة اليد" },
    { id: "football", name: "كرة القدم" },
  ]

  const times = ["15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]

  const fields = {
    tennis: ["ملعب التنس 1", "ملعب التنس 2"],
    handball: ["ملعب كرة اليد 1", "ملعب كرة اليد 2"],
    football: ["ملعب كرة القدم الرئيسي", "ملعب كرة القدم الفرعي"],
  }

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
            clubId: "1",
            clubName: "نادي أثلتيك يونايتد",
            sportId: "tennis",
            sportName: "التنس",
            date: "2025-04-24",
            time: "16:00",
            fieldName: "ملعب التنس 1",
          },
          {
            id: "2",
            clubId: "2",
            clubName: "نجوم كرة القدم",
            sportId: "football",
            sportName: "كرة القدم",
            date: "2025-04-26",
            time: "17:00",
            fieldName: "ملعب كرة القدم الرئيسي",
          },
          {
            id: "3",
            clubId: "3",
            clubName: "نادي التنس",
            sportId: "handball",
            sportName: "كرة اليد",
            date: "2025-04-25",
            time: "19:00",
            fieldName: "ملعب كرة اليد 1",
          },
        ])
      } catch (error) {
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
  }, [])

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddReservation = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const club = clubs.find((c) => c.id === formData.clubId)
      const sport = sports.find((s) => s.id === formData.sportId)

      if (!club || !sport) return

      const newReservation: Reservation = {
        id: Date.now().toString(),
        clubId: formData.clubId,
        clubName: club.name,
        sportId: formData.sportId,
        sportName: sport.name,
        date: formData.date,
        time: formData.time,
        fieldName: formData.fieldName,
      }

      setReservations([...reservations, newReservation])
      setIsAddDialogOpen(false)
      setFormData({ clubId: "", sportId: "", date: "", time: "", fieldName: "" })

      toast({
        title: "تم إضافة الحجز",
        description: "تم إضافة الحجز بنجاح",
      })
    } catch (error) {
      toast({
        title: "فشل إضافة الحجز",
        description: "حدث خطأ أثناء محاولة إضافة الحجز. يرجى المحاولة مرة أخرى.",
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
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const club = clubs.find((c) => c.id === formData.clubId)
      const sport = sports.find((s) => s.id === formData.sportId)

      if (!club || !sport) return

      const updatedReservations = reservations.map((reservation) =>
        reservation.id === selectedReservation.id
          ? {
              ...reservation,
              clubId: formData.clubId,
              clubName: club.name,
              sportId: formData.sportId,
              sportName: sport.name,
              date: formData.date,
              time: formData.time,
              fieldName: formData.fieldName,
            }
          : reservation,
      )

      setReservations(updatedReservations)
      setIsEditDialogOpen(false)
      setSelectedReservation(null)

      toast({
        title: "تم تحديث الحجز",
        description: "تم تحديث بيانات الحجز بنجاح",
      })
    } catch (error) {
      toast({
        title: "فشل تحديث الحجز",
        description: "حدث خطأ أثناء محاولة تحديث الحجز. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReservation = async (reservationId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الحجز؟")) return

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setReservations(reservations.filter((reservation) => reservation.id !== reservationId))

      toast({
        title: "تم حذف الحجز",
        description: "تم حذف الحجز بنجاح",
      })
    } catch (error) {
      toast({
        title: "فشل حذف الحجز",
        description: "حدث خطأ أثناء محاولة حذف الحجز. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
                        <SelectItem key={time} value={time}>
                          {time}
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
                      {formData.sportId &&
                        fields[formData.sportId as keyof typeof fields]?.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
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
                <TableHead>النادي</TableHead>
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
                <label className="text-sm font-medium">النادي</label>
                <Select value={formData.clubId} onValueChange={(value) => handleSelectChange("clubId", value)} required>
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
                      <SelectItem key={time} value={time}>
                        {time}
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
                    {formData.sportId &&
                      fields[formData.sportId as keyof typeof fields]?.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
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
