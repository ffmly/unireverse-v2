"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Plus, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Club {
  id: string
  username: string
  clubName: string
  department: string
}

export default function AdminClubs() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    clubName: "",
    department: "",
  })

  useEffect(() => {
    const fetchClubs = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setClubs([
          {
            id: "1",
            username: "athletic_united",
            clubName: "نادي أثلتيك يونايتد",
            department: "قسم الرياضة",
          },
          {
            id: "2",
            username: "soccer_stars",
            clubName: "نجوم كرة القدم",
            department: "كلية التربية البدنية",
          },
          {
            id: "3",
            username: "tennis_club",
            clubName: "نادي التنس",
            department: "قسم الرياضة",
          },
        ])
      } catch (error) {
        toast({
          title: "خطأ في تحميل النوادي",
          description: "حدث خطأ أثناء محاولة تحميل النوادي. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchClubs()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddClub = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newClub: Club = {
        id: Date.now().toString(),
        username: formData.username,
        clubName: formData.clubName,
        department: formData.department,
      }

      setClubs([...clubs, newClub])
      setIsAddDialogOpen(false)
      setFormData({ username: "", password: "", clubName: "", department: "" })

      toast({
        title: "تم إضافة النادي",
        description: "تم إضافة النادي بنجاح",
      })
    } catch (error) {
      toast({
        title: "فشل إضافة النادي",
        description: "حدث خطأ أثناء محاولة إضافة النادي. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  const handleEditClub = (club: Club) => {
    setSelectedClub(club)
    setFormData({
      username: club.username,
      password: "", // Password is not displayed for security
      clubName: club.clubName,
      department: club.department,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateClub = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClub) return

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedClubs = clubs.map((club) =>
        club.id === selectedClub.id
          ? {
              ...club,
              username: formData.username,
              clubName: formData.clubName,
              department: formData.department,
            }
          : club,
      )

      setClubs(updatedClubs)
      setIsEditDialogOpen(false)
      setSelectedClub(null)

      toast({
        title: "تم تحديث النادي",
        description: "تم تحديث بيانات النادي بنجاح",
      })
    } catch (error) {
      toast({
        title: "فشل تحديث النادي",
        description: "حدث خطأ أثناء محاولة تحديث النادي. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClub = async (clubId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا النادي؟")) return

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setClubs(clubs.filter((club) => club.id !== clubId))

      toast({
        title: "تم حذف النادي",
        description: "تم حذف النادي بنجاح",
      })
    } catch (error) {
      toast({
        title: "فشل حذف النادي",
        description: "حدث خطأ أثناء محاولة حذف النادي. يرجى المحاولة مرة أخرى.",
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
        <h2 className="text-xl font-semibold">إدارة النوادي</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              إضافة نادي جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة نادي جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات النادي الجديد. سيتمكن النادي من تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClub}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="clubName">اسم النادي</Label>
                  <Input
                    id="clubName"
                    name="clubName"
                    value={formData.clubName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">القسم / الكلية</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">إضافة النادي</Button>
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
                <TableHead>اسم النادي</TableHead>
                <TableHead>القسم / الكلية</TableHead>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead className="w-[100px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell className="font-medium">{club.clubName}</TableCell>
                  <TableCell>{club.department}</TableCell>
                  <TableCell>{club.username}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClub(club)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClub(club.id)}>
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
            <DialogTitle>تعديل بيانات النادي</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات النادي. اترك حقل كلمة المرور فارغًا إذا كنت لا ترغب في تغييرها.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateClub}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-clubName">اسم النادي</Label>
                <Input
                  id="edit-clubName"
                  name="clubName"
                  value={formData.clubName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">القسم / الكلية</Label>
                <Input
                  id="edit-department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-username">اسم المستخدم</Label>
                <Input
                  id="edit-username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">كلمة المرور (اتركها فارغة للاحتفاظ بالحالية)</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
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
