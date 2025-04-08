"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Calendar, Clock, Wand2 } from "lucide-react"

export default function AdminAutoAssign() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    startTime: "15:00",
    endTime: "20:00",
    daysOfWeek: {
      sunday: true,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: false,
      saturday: false,
    },
  })

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (day: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: {
        ...prev.daysOfWeek,
        [day]: checked,
      },
    }))
  }

  const handleAutoAssign = async () => {
    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد تاريخ البداية والنهاية",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "تم التوزيع التلقائي",
        description: "تم توزيع الحجوزات بنجاح على النوادي",
      })
    } catch (error) {
      toast({
        title: "فشل التوزيع التلقائي",
        description: "حدث خطأ أثناء محاولة توزيع الحجوزات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">التوزيع التلقائي للحجوزات</h2>

      <Card>
        <CardHeader>
          <CardTitle>توزيع الحجوزات تلقائيًا</CardTitle>
          <CardDescription>
            قم بتوزيع الحجوزات تلقائيًا على النوادي بشكل عادل بناءً على عدد النوادي والأيام المتاحة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">الفترة الزمنية</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البداية</Label>
                <input
                  id="startDate"
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.startDate}
                  onChange={(e) => handleSelectChange("startDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ النهاية</Label>
                <input
                  id="endDate"
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.endDate}
                  onChange={(e) => handleSelectChange("endDate", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">أوقات الحجز</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>وقت البداية</Label>
                <Select value={formData.startTime} onValueChange={(value) => handleSelectChange("startTime", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر وقت البداية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15:00">15:00</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                    <SelectItem value="17:00">17:00</SelectItem>
                    <SelectItem value="18:00">18:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>وقت النهاية</Label>
                <Select value={formData.endTime} onValueChange={(value) => handleSelectChange("endTime", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر وقت النهاية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18:00">18:00</SelectItem>
                    <SelectItem value="19:00">19:00</SelectItem>
                    <SelectItem value="20:00">20:00</SelectItem>
                    <SelectItem value="21:00">21:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">أيام الأسبوع</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="sunday"
                  checked={formData.daysOfWeek.sunday}
                  onCheckedChange={(checked) => handleCheckboxChange("sunday", checked as boolean)}
                />
                <Label htmlFor="sunday">الأحد</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="monday"
                  checked={formData.daysOfWeek.monday}
                  onCheckedChange={(checked) => handleCheckboxChange("monday", checked as boolean)}
                />
                <Label htmlFor="monday">الإثنين</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="tuesday"
                  checked={formData.daysOfWeek.tuesday}
                  onCheckedChange={(checked) => handleCheckboxChange("tuesday", checked as boolean)}
                />
                <Label htmlFor="tuesday">الثلاثاء</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="wednesday"
                  checked={formData.daysOfWeek.wednesday}
                  onCheckedChange={(checked) => handleCheckboxChange("wednesday", checked as boolean)}
                />
                <Label htmlFor="wednesday">الأربعاء</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="thursday"
                  checked={formData.daysOfWeek.thursday}
                  onCheckedChange={(checked) => handleCheckboxChange("thursday", checked as boolean)}
                />
                <Label htmlFor="thursday">الخميس</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="friday"
                  checked={formData.daysOfWeek.friday}
                  onCheckedChange={(checked) => handleCheckboxChange("friday", checked as boolean)}
                />
                <Label htmlFor="friday">الجمعة</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="saturday"
                  checked={formData.daysOfWeek.saturday}
                  onCheckedChange={(checked) => handleCheckboxChange("saturday", checked as boolean)}
                />
                <Label htmlFor="saturday">السبت</Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleAutoAssign} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                جاري التوزيع...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                توزيع الحجوزات تلقائيًا
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
