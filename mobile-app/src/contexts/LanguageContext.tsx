import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Login/Register
    'login.title': 'Stadium Booking System',
    'login.subtitle': 'Book your favorite stadium',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Login',
    'login.loading': 'Logging in...',
    'login.error': 'Login failed. Please try again.',
    'login.noAccount': "Don't have an account?",
    'login.register': 'Register here',
    'register.title': 'Create Account',
    'register.subtitle': 'Join our stadium booking platform',
    'register.fullName': 'Full Name',
    'register.studentId': 'Student ID',
    'register.email': 'Email',
    'register.password': 'Password',
    'register.confirmPassword': 'Confirm Password',
    'register.submit': 'Register',
    'register.loading': 'Creating account...',
    'register.error': 'Registration failed. Please try again.',
    'register.haveAccount': 'Already have an account?',
    'register.login': 'Login here',
    'register.passwordMismatch': 'Passwords do not match',
    
    // Navigation
    'nav.home': 'Home',
    'nav.booking': 'Booking',
    'nav.reservations': 'My Reservations',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.users': 'Users',
    'nav.stadiums': 'Stadiums',
    'nav.reservations': 'Reservations',
    'nav.settings': 'Settings',
    
    // Booking
    'booking.title': 'Book a Stadium',
    'booking.subtitle': 'Welcome, {name}',
    'booking.chooseSport': 'Choose Sport',
    'booking.chooseDate': 'Choose Date',
    'booking.chooseTime': 'Choose Time',
    'booking.chooseStadium': 'Choose Stadium',
    'booking.bookNow': 'Book Now',
    'booking.booked': 'Booked',
    'booking.userProfile': 'Student ID: {id}',
    
    // Sports
    'sports.football': 'Football',
    'sports.basketball': 'Basketball',
    'sports.handball': 'Handball',
    
    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.users': 'Users Management',
    'admin.stadiums': 'Stadiums Management',
    'admin.reservations': 'Reservations Management',
    'admin.addUser': 'Add User',
    'admin.addStadium': 'Add Stadium',
    'admin.addReservation': 'Add Reservation',
    'admin.edit': 'Edit',
    'admin.delete': 'Delete',
    'admin.save': 'Save',
    'admin.cancel': 'Cancel',
    'admin.student': 'Student',
    'admin.stadium': 'Stadium',
    'admin.date': 'Date',
    'admin.time': 'Time',
    'admin.status': 'Status',
    'admin.actions': 'Actions',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.role': 'Role',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.confirmed': 'Confirmed',
    'common.pending': 'Pending',
    'common.cancelled': 'Cancelled',
    
    // Splash Screen
    'splash.tagline': 'Reserve your stadium with ease',
    'splash.loading': 'Loading...',
    
    // Network
    'network.title': 'No Internet Connection',
    'network.message': 'Please check your WiFi connection and try again.',
    'network.connected': 'Connected',
    'network.disconnected': 'Disconnected',
    'network.retry': 'Retry',
    
    // Server Error
    'server.title': 'Server Error',
    'server.message': 'There seems to be a problem with our servers. Please try again later.',
    'server.retry': 'Try Again',
    
    // Test
    'test.title': 'Test API Connection',
    'test.button': 'Test Connection',
    'test.success': 'API connection successful!',
    'test.failed': 'API connection failed:',
    'test.error': 'Error testing connection:',
  },
  ar: {
    // Login/Register
    'login.title': 'نظام حجز الملاعب',
    'login.subtitle': 'احجز ملعبك المفضل',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.submit': 'تسجيل الدخول',
    'login.loading': 'جاري تسجيل الدخول...',
    'login.error': 'فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.',
    'login.noAccount': 'ليس لديك حساب؟',
    'login.register': 'سجل هنا',
    'register.title': 'إنشاء حساب',
    'register.subtitle': 'انضم إلى منصة حجز الملاعب',
    'register.fullName': 'الاسم الكامل',
    'register.studentId': 'رقم الطالب',
    'register.email': 'البريد الإلكتروني',
    'register.password': 'كلمة المرور',
    'register.confirmPassword': 'تأكيد كلمة المرور',
    'register.submit': 'إنشاء الحساب',
    'register.loading': 'جاري إنشاء الحساب...',
    'register.error': 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.',
    'register.haveAccount': 'لديك حساب بالفعل؟',
    'register.login': 'سجل الدخول هنا',
    'register.passwordMismatch': 'كلمات المرور غير متطابقة',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.booking': 'الحجز',
    'nav.reservations': 'حجوزاتي',
    'nav.profile': 'الملف الشخصي',
    'nav.admin': 'الإدارة',
    'nav.users': 'المستخدمين',
    'nav.stadiums': 'الملاعب',
    'nav.reservations': 'الحجوزات',
    'nav.settings': 'الإعدادات',
    
    // Booking
    'booking.title': 'احجز ملعب',
    'booking.subtitle': 'مرحباً، {name}',
    'booking.chooseSport': 'اختر الرياضة',
    'booking.chooseDate': 'اختر التاريخ',
    'booking.chooseTime': 'اختر الوقت',
    'booking.chooseStadium': 'اختر الملعب',
    'booking.bookNow': 'احجز الآن',
    'booking.booked': 'محجوز',
    'booking.userProfile': 'رقم الطالب: {id}',
    
    // Sports
    'sports.football': 'كرة القدم',
    'sports.basketball': 'كرة السلة',
    'sports.handball': 'كرة اليد',
    
    // Admin
    'admin.dashboard': 'لوحة الإدارة',
    'admin.users': 'إدارة المستخدمين',
    'admin.stadiums': 'إدارة الملاعب',
    'admin.reservations': 'إدارة الحجوزات',
    'admin.addUser': 'إضافة مستخدم',
    'admin.addStadium': 'إضافة ملعب',
    'admin.addReservation': 'إضافة حجز',
    'admin.edit': 'تعديل',
    'admin.delete': 'حذف',
    'admin.save': 'حفظ',
    'admin.cancel': 'إلغاء',
    'admin.student': 'الطالب',
    'admin.stadium': 'الملعب',
    'admin.date': 'التاريخ',
    'admin.time': 'الوقت',
    'admin.status': 'الحالة',
    'admin.actions': 'الإجراءات',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.confirm': 'تأكيد',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.close': 'إغلاق',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.ok': 'موافق',
    'common.name': 'الاسم',
    'common.email': 'البريد الإلكتروني',
    'common.password': 'كلمة المرور',
    'common.role': 'الدور',
    'common.active': 'نشط',
    'common.inactive': 'غير نشط',
    'common.confirmed': 'مؤكد',
    'common.pending': 'في الانتظار',
    'common.cancelled': 'ملغي',
    
    // Splash Screen
    'splash.tagline': 'احجز ملعبك بسهولة',
    'splash.loading': 'جاري التحميل...',
    
    // Network
    'network.title': 'لا يوجد اتصال بالإنترنت',
    'network.message': 'يرجى التحقق من اتصال الواي فاي والمحاولة مرة أخرى.',
    'network.connected': 'متصل',
    'network.disconnected': 'غير متصل',
    'network.retry': 'إعادة المحاولة',
    
    // Server Error
    'server.title': 'خطأ في الخادم',
    'server.message': 'يبدو أن هناك مشكلة في خوادمنا. يرجى المحاولة لاحقاً.',
    'server.retry': 'حاول مرة أخرى',
    
    // Test
    'test.title': 'اختبار اتصال API',
    'test.button': 'اختبار الاتصال',
    'test.success': 'تم الاتصال بـ API بنجاح!',
    'test.failed': 'فشل الاتصال بـ API:',
    'test.error': 'خطأ في اختبار الاتصال:',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const handleSetLanguage = async (lang: 'en' | 'ar') => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguage(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // If translation not found, return a clean version of the key
    if (!value || value === key) {
      return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) || key;
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
