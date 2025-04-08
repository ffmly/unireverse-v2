"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "ar" | "en"

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionary
const translations: Record<string, Record<Language, string>> = {
  // Login page
  "login.title": {
    ar: "نظام حجز الملاعب الرياضية",
    en: "Sports Field Reservation System",
  },
  "login.form.title": {
    ar: "تسجيل الدخول",
    en: "Login",
  },
  "login.form.description": {
    ar: "قم بتسجيل الدخول للوصول إلى نظام حجز الملاعب",
    en: "Login to access the sports field reservation system",
  },
  "login.form.username": {
    ar: "اسم المستخدم",
    en: "Username",
  },
  "login.form.password": {
    ar: "كلمة المرور",
    en: "Password",
  },
  "login.form.submit": {
    ar: "تسجيل الدخول",
    en: "Login",
  },
  "login.form.loading": {
    ar: "جاري تسجيل الدخول...",
    en: "Logging in...",
  },
  "login.form.error": {
    ar: "اسم المستخدم أو كلمة المرور غير صحيحة",
    en: "Invalid username or password",
  },

  // Booking page
  "booking.welcome": {
    ar: "مرحباً،",
    en: "Welcome,",
  },
  "booking.logout": {
    ar: "تسجيل الخروج",
    en: "Logout",
  },
  "booking.tab.book": {
    ar: "حجز ملعب",
    en: "Book a Field",
  },
  "booking.tab.reservations": {
    ar: "حجوزاتي",
    en: "My Reservations",
  },
  "booking.tab.friendlyMatches": {
    ar: "مباريات ودية",
    en: "Friendly Matches",
  },
  "booking.chooseSport": {
    ar: "اختر الرياضة",
    en: "Choose Sport",
  },
  "booking.chooseDate": {
    ar: "اختر التاريخ",
    en: "Select Date",
  },
  "booking.timeSlots": {
    ar: "الأوقات المتاحة",
    en: "Available Time Slots",
  },
  "booking.bookNow": {
    ar: "احجز الآن",
    en: "Book Now",
  },
  "booking.booking": {
    ar: "جاري الحجز...",
    en: "Booking...",
  },
  "booking.morning": {
    ar: "صباحاً",
    en: "Morning",
  },
  "booking.afternoon": {
    ar: "مساءً",
    en: "Afternoon",
  },

  // Sports
  "sports.basketball": {
    ar: "كرة السلة",
    en: "Basketball",
  },
  "sports.handball": {
    ar: "كرة اليد",
    en: "Handball",
  },
  "sports.football": {
    ar: "كرة القدم",
    en: "Football",
  },

  // Reservations
  "reservations.noReservations": {
    ar: "لا توجد حجوزات",
    en: "No Reservations",
  },
  "reservations.noReservationsDesc": {
    ar: "لم تقم بحجز أي ملاعب بعد.",
    en: "You have not booked any fields yet.",
  },
  "reservations.cancel": {
    ar: "إلغاء الحجز",
    en: "Cancel Reservation",
  },

  // Admin
  "admin.dashboard": {
    ar: "لوحة تحكم المسؤول",
    en: "Admin Dashboard",
  },
  "admin.manageDashboard": {
    ar: "إدارة النوادي والحجوزات",
    en: "Manage Clubs and Reservations",
  },
  "admin.tab.clubs": {
    ar: "النوادي",
    en: "Clubs",
  },
  "admin.tab.reservations": {
    ar: "الحجوزات",
    en: "Reservations",
  },
  "admin.tab.autoAssign": {
    ar: "توزيع تلقائي",
    en: "Auto Assign",
  },
  "admin.tab.stadiums": {
    ar: "الملاعب",
    en: "Stadiums",
  },
  "admin.tab.timeSlots": {
    ar: "أوقات الحجز",
    en: "Time Slots",
  },
  "admin.tab.friendlyMatches": {
    ar: "المباريات الودية",
    en: "Friendly Matches",
  },

  // Stadiums
  "stadiums.manage": {
    ar: "إدارة الملاعب",
    en: "Manage Stadiums",
  },
  "stadiums.add": {
    ar: "إضافة ملعب جديد",
    en: "Add New Stadium",
  },
  "stadiums.name": {
    ar: "اسم الملعب",
    en: "Stadium Name",
  },
  "stadiums.sport": {
    ar: "الرياضة",
    en: "Sport",
  },
  "stadiums.status": {
    ar: "الحالة",
    en: "Status",
  },
  "stadiums.actions": {
    ar: "الإجراءات",
    en: "Actions",
  },
  "stadiums.enable": {
    ar: "تفعيل",
    en: "Enable",
  },
  "stadiums.disable": {
    ar: "تعطيل",
    en: "Disable",
  },
  "stadiums.enabled": {
    ar: "مفعل",
    en: "Enabled",
  },
  "stadiums.disabled": {
    ar: "معطل",
    en: "Disabled",
  },
  "stadiums.edit": {
    ar: "تعديل",
    en: "Edit",
  },
  "stadiums.delete": {
    ar: "حذف",
    en: "Delete",
  },

  // Time Slots
  "timeSlots.manage": {
    ar: "إدارة أوقات الحجز",
    en: "Manage Time Slots",
  },
  "timeSlots.morning": {
    ar: "الفترة الصباحية",
    en: "Morning Period",
  },
  "timeSlots.afternoon": {
    ar: "فترة ما بعد الظهر",
    en: "Afternoon Period",
  },
  "timeSlots.time": {
    ar: "الوقت",
    en: "Time",
  },
  "timeSlots.status": {
    ar: "الحالة",
    en: "Status",
  },
  "timeSlots.actions": {
    ar: "الإجراءات",
    en: "Actions",
  },

  // Friendly Matches
  "friendlyMatches.title": {
    ar: "المباريات الودية",
    en: "Friendly Matches",
  },
  "friendlyMatches.description": {
    ar: "ابحث عن نوادي أخرى للعب مباريات ودية",
    en: "Find other clubs to play friendly matches",
  },
  "friendlyMatches.create": {
    ar: "إنشاء مباراة ودية",
    en: "Create Friendly Match",
  },
  "friendlyMatches.noMatches": {
    ar: "لا توجد مباريات ودية",
    en: "No friendly matches available",
  },
  "friendlyMatches.noMatchesDesc": {
    ar: "لم يتم إنشاء أي مباريات ودية بعد.",
    en: "No friendly matches have been created yet.",
  },
  "friendlyMatches.date": {
    ar: "التاريخ",
    en: "Date",
  },
  "friendlyMatches.time": {
    ar: "الوقت",
    en: "Time",
  },
  "friendlyMatches.sport": {
    ar: "الرياضة",
    en: "Sport",
  },
  "friendlyMatches.host": {
    ar: "النادي المضيف",
    en: "Host Club",
  },
  "friendlyMatches.status": {
    ar: "الحالة",
    en: "Status",
  },
  "friendlyMatches.join": {
    ar: "انضمام",
    en: "Join",
  },
  "friendlyMatches.cancel": {
    ar: "إلغاء",
    en: "Cancel",
  },
  "friendlyMatches.open": {
    ar: "مفتوح",
    en: "Open",
  },
  "friendlyMatches.closed": {
    ar: "مغلق",
    en: "Closed",
  },
  "friendlyMatches.confirmed": {
    ar: "مؤكد",
    en: "Confirmed",
  },

  // Notifications
  "notifications.title": {
    ar: "الإشعارات",
    en: "Notifications",
  },
  "notifications.empty": {
    ar: "لا توجد إشعارات",
    en: "No notifications",
  },
  "notifications.markAllRead": {
    ar: "تعيين الكل كمقروء",
    en: "Mark all as read",
  },
  "notifications.reservation.upcoming": {
    ar: "لديك حجز قادم في",
    en: "You have an upcoming reservation at",
  },
  "notifications.stadium.available": {
    ar: "ملعب متاح الآن:",
    en: "Stadium now available:",
  },
  "notifications.friendlyMatch.new": {
    ar: "مباراة ودية جديدة متاحة",
    en: "New friendly match available",
  },
  "notifications.friendlyMatch.joined": {
    ar: "انضم نادي إلى مباراتك الودية",
    en: "A club joined your friendly match",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar")

  useEffect(() => {
    // Set the dir attribute on the html element
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = language
  }, [language])

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ar" ? "en" : "ar"))
  }

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation missing for key: ${key}`)
      return key
    }
    return translations[key][language] || key
  }

  return <LanguageContext.Provider value={{ language, toggleLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
