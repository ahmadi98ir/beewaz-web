import type { Dictionary } from './fa'

const ar: Dictionary = {
  common: {
    siteName: 'بيواز', loading: 'جارٍ التحميل...', error: 'حدث خطأ', retry: 'إعادة المحاولة',
    save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل',
    confirm: 'تأكيد', search: 'بحث', filter: 'تصفية', all: 'الكل',
    yes: 'نعم', no: 'لا', back: 'رجوع', next: 'التالي',
    previous: 'السابق', submit: 'إرسال', close: 'إغلاق',
  },
  nav: {
    home: 'الرئيسية', shop: 'المتجر', blog: 'المدونة', about: 'من نحن',
    contact: 'اتصل بنا', cart: 'السلة', profile: 'الملف الشخصي', login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج', dealers: 'الموزعون', knowledge: 'دليل المنتج',
  },
  product: {
    addToCart: 'أضف إلى السلة', buyNow: 'اشتري الآن', outOfStock: 'نفد المخزون', price: 'السعر',
    comparePrice: 'السعر الأصلي', discount: 'خصم', sku: 'رقم المنتج', category: 'الفئة',
    description: 'الوصف', specs: 'المواصفات', reviews: 'التقييمات', related: 'منتجات مشابهة',
    inStock: 'متوفر', freeShipping: 'شحن مجاني',
  },
  cart: {
    title: 'سلة التسوق', empty: 'سلتك فارغة', total: 'المجموع', checkout: 'إتمام الشراء',
    continueShopping: 'مواصلة التسوق', quantity: 'الكمية', remove: 'إزالة',
    shipping: 'الشحن', freeShipping: 'شحن مجاني',
  },
  checkout: {
    title: 'إتمام الشراء', address: 'عنوان التوصيل', payment: 'الدفع', orderSummary: 'ملخص الطلب',
    placeOrder: 'تأكيد الطلب', province: 'المحافظة', city: 'المدينة', street: 'الشارع',
    alley: 'الزقاق', plate: 'رقم المبنى', unit: 'الشقة', postalCode: 'الرمز البريدي',
  },
  auth: {
    phone: 'رقم الهاتف', otp: 'رمز التحقق', sendOtp: 'إرسال الرمز', verifyOtp: 'تحقق',
    loginTitle: 'تسجيل الدخول', otpSent: 'تم إرسال رمز التحقق',
  },
  footer: {
    rights: 'جميع الحقوق محفوظة', privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام',
  },
}

export default ar
