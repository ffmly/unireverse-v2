"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/language-context"
import { Sun, Moon, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimeSlot {
  id: string
  time: string
  period: "morning" | "afternoon"
  enabled: boolean
}

export default function AdminTimeSlots() {
  const { t, language } = useLanguage()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    time: "",
    period: "morning" as "morning" | "afternoon",
  })

  useEffect(() => {
    const fetchTimeSlots = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/time-slots")
        if (!response.ok) {
          throw new Error("Failed to fetch time slots")
        }
        const data = await response.json()
        setTimeSlots(data)
      } catch (error) {
        toast({
          title: language === "ar" ? "خطأ في تحميل أوقات الحجز" : "Error loading time slots",
          description:
            language === "ar"
              ? "حدث خطأ أثناء محاولة تحميل أوقات الحجز. يرجى المحاولة مرة أخرى."
              : "An error occurred while trying to load time slots. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimeSlots()
  }, [language])

  const handleToggleTimeSlot = async (timeSlotId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/time-slots/${timeSlotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      })

      if (!response.ok) {
        throw new Error("Failed to update time slot")
      }

      const updatedTimeSlots = timeSlots.map((slot) => (slot.id === timeSlotId ? { ...slot, enabled } : slot))

      setTimeSlots(updatedTimeSlots)

      toast({
        title: enabled
          ? language === "ar"
            ? "تم تفعيل وقت الحجز"
            : "Time Slot Enabled"
          : language === "ar"
            ? "تم تعطيل وقت الحجز"
            : "Time Slot Disabled",
        description: enabled
          ? language === "ar"
            ? "تم تفعيل وقت الحجز بنجاح"
            : "The time slot has been enabled successfully"
          : language === "ar"
            ? "تم تعطيل وقت الحجز بنجاح"
            : "The time slot has been disabled successfully",
      })
    } catch (error) {
      toast({
        title: language === "ar" ? "فشل تغيير حالة وقت الحجز" : "Failed to Change Time Slot Status",
        description:
          language === "ar"
            ? "حدث خطأ أثناء محاولة تغيير حالة وقت الحجز. يرجى المحاولة مرة أخرى."
            : "An error occurred while trying to change the time slot status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTimeSlot = async (timeSlotId: string) => {
    if (
      !confirm(
        language === "ar"
          ? "هل أنت متأكد من رغبتك في حذف وقت الحجز هذا؟"
          : "Are you sure you want to delete this time slot?",
      )
    )
      return

    try {
      const response = await fetch(`/api/time-slots/${timeSlotId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete time slot")
      }

      setTimeSlots(timeSlots.filter((slot) => slot.id !== timeSlotId))

      toast({
        title: language === "ar" ? "تم حذف وقت الحجز" : "Time Slot Deleted",
        description: language === "ar" ? "تم حذف وقت الحجز بنجاح" : "The time slot has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: language === "ar" ? "فشل حذف وقت الحجز" : "Failed to Delete Time Slot",
        description:
          language === "ar"
            ? "حدث خطأ أثناء محاولة حذف وقت الحجز. يرجى المحاولة مرة أخرى."
            : "An error occurred while trying to delete the time slot. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.time) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "يرجى إدخال وقت صحيح" : "Please enter a valid time",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/time-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add time slot")
      }

      const newTimeSlot = await response.json()
      setTimeSlots([...timeSlots, newTimeSlot])
      setIsAddDialogOpen(false)
      setFormData({ time: "", period: "morning" })

      toast({
        title: language === "ar" ? "تم إضافة وقت الحجز" : "Time Slot Added",
        description: language === "ar" ? "تم إضافة وقت الحجز بنجاح" : "The time slot has been added successfully",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      toast({
        title: language === "ar" ? "فشل إضافة وقت الحجز" : "Failed to Add Time Slot",
        description:
          language === "ar"
            ? `حدث خطأ أثناء محاولة إضافة وقت الحجز: ${errorMessage}`
            : `An error occurred while trying to add the time slot: ${errorMessage}`,
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
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("timeSlots.manage")}</h2>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {language === "ar" ? "إضافة وقت جديد" : "Add New Time Slot"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === "ar" ? "إضافة وقت حجز جديد" : "Add New Time Slot"}</DialogTitle>
              <DialogDescription>
                {language === "ar" ? "أدخل تفاصيل وقت الحجز الجديد." : "Enter the details of the new time slot."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTimeSlot}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="time">{language === "ar" ? "الوقت (24 ساعة)" : "Time (24-hour format)"}</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">{language === "ar" ? "الفترة" : "Period"}</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) => handleInputChange("period", value as "morning" | "afternoon")}
                  >
                    <SelectTrigger id="period">
                      <SelectValue placeholder={language === "ar" ? "اختر الفترة" : "Select period"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">{language === "ar" ? "الفترة الصباحية" : "Morning"}</SelectItem>
                      <SelectItem value="afternoon">{language === "ar" ? "فترة ما بعد الظهر" : "Afternoon"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{language === "ar" ? "إضافة" : "Add"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              {t("timeSlots.morning")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("timeSlots.time")}</TableHead>
                  <TableHead>{t("timeSlots.status")}</TableHead>
                  <TableHead className="w-[150px]">{t("timeSlots.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots
                  .filter((slot) => slot.period === "morning")
                  .map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">{slot.time}</TableCell>
                      <TableCell>
                        {slot.enabled ? (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          >
                            {t("stadiums.enabled")}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          >
                            {t("stadiums.disabled")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Switch
                            checked={slot.enabled}
                            onCheckedChange={(checked) => handleToggleTimeSlot(slot.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTimeSlot(slot.id)}
                            className="ml-2"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {timeSlots.filter((slot) => slot.period === "morning").length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      {language === "ar"
                        ? "لا توجد أوقات حجز صباحية. أضف وقتًا جديدًا."
                        : "No morning time slots. Add a new one."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              {t("timeSlots.afternoon")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("timeSlots.time")}</TableHead>
                  <TableHead>{t("timeSlots.status")}</TableHead>
                  <TableHead className="w-[150px]">{t("timeSlots.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots
                  .filter((slot) => slot.period === "afternoon")
                  .map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">{slot.time}</TableCell>
                      <TableCell>
                        {slot.enabled ? (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          >
                            {t("stadiums.enabled")}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          >
                            {t("stadiums.disabled")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Switch
                            checked={slot.enabled}
                            onCheckedChange={(checked) => handleToggleTimeSlot(slot.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTimeSlot(slot.id)}
                            className="ml-2"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {timeSlots.filter((slot) => slot.period === "afternoon").length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      {language === "ar"
                        ? "لا توجد أوقات حجز مسائية. أضف وقتًا جديدًا."
                        : "No afternoon time slots. Add a new one."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
