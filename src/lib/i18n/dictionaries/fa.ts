export type Dictionary = {
  common: {
    siteName: string; loading: string; error: string; retry: string
    save: string; cancel: string; delete: string; edit: string
    confirm: string; search: string; filter: string; all: string
    yes: string; no: string; back: string; next: string
    previous: string; submit: string; close: string
  }
  nav: {
    home: string; shop: string; blog: string; about: string
    contact: string; cart: string; profile: string; login: string
    logout: string; dealers: string; knowledge: string
  }
  product: {
    addToCart: string; buyNow: string; outOfStock: string; price: string
    comparePrice: string; discount: string; sku: string; category: string
    description: string; specs: string; reviews: string; related: string
    inStock: string; freeShipping: string
  }
  cart: {
    title: string; empty: string; total: string; checkout: string
    continueShopping: string; quantity: string; remove: string
    shipping: string; freeShipping: string
  }
  checkout: {
    title: string; address: string; payment: string; orderSummary: string
    placeOrder: string; province: string; city: string; street: string
    alley: string; plate: string; unit: string; postalCode: string
  }
  auth: {
    phone: string; otp: string; sendOtp: string; verifyOtp: string
    loginTitle: string; otpSent: string
  }
  footer: {
    rights: string; privacy: string; terms: string
  }
}

const fa: Dictionary = {
  common: {
    siteName:     'بیواز',
    loading:      'در حال بارگذاری...',
    error:        'خطایی رخ داد',
    retry:        'تلاش مجدد',
    save:         'ذخیره',
    cancel:       'انصراف',
    delete:       'حذف',
    edit:         'ویرایش',
    confirm:      'تأیید',
    search:       'جستجو',
    filter:       'فیلتر',
    all:          'همه',
    yes:          'بله',
    no:           'خیر',
    back:         'بازگشت',
    next:         'بعدی',
    previous:     'قبلی',
    submit:       'ارسال',
    close:        'بستن',
  },
  nav: {
    home:         'خانه',
    shop:         'فروشگاه',
    blog:         'وبلاگ',
    about:        'درباره ما',
    contact:      'تماس با ما',
    cart:         'سبد خرید',
    profile:      'پروفایل',
    login:        'ورود',
    logout:       'خروج',
    dealers:      'نمایندگان',
    knowledge:    'راهنمای محصولات',
  },
  product: {
    addToCart:    'افزودن به سبد خرید',
    buyNow:       'خرید فوری',
    outOfStock:   'ناموجود',
    price:        'قیمت',
    comparePrice: 'قیمت قبل',
    discount:     'تخفیف',
    sku:          'کد محصول',
    category:     'دسته‌بندی',
    description:  'توضیحات',
    specs:        'مشخصات فنی',
    reviews:      'نظرات',
    related:      'محصولات مرتبط',
    inStock:      'موجود در انبار',
    freeShipping: 'ارسال رایگان',
  },
  cart: {
    title:        'سبد خرید',
    empty:        'سبد خرید شما خالی است',
    total:        'جمع کل',
    checkout:     'تکمیل خرید',
    continueShopping: 'ادامه خرید',
    quantity:     'تعداد',
    remove:       'حذف',
    shipping:     'هزینه ارسال',
    freeShipping: 'ارسال رایگان',
  },
  checkout: {
    title:        'تکمیل خرید',
    address:      'آدرس تحویل',
    payment:      'پرداخت',
    orderSummary: 'خلاصه سفارش',
    placeOrder:   'ثبت سفارش',
    province:     'استان',
    city:         'شهر',
    street:       'خیابان اصلی',
    alley:        'خیابان فرعی',
    plate:        'پلاک',
    unit:         'واحد',
    postalCode:   'کد پستی',
  },
  auth: {
    phone:        'شماره موبایل',
    otp:          'کد تأیید',
    sendOtp:      'ارسال کد',
    verifyOtp:    'تأیید کد',
    loginTitle:   'ورود به حساب کاربری',
    otpSent:      'کد تأیید ارسال شد',
  },
  footer: {
    rights:       'تمامی حقوق محفوظ است',
    privacy:      'حریم خصوصی',
    terms:        'شرایط استفاده',
  },
}

export default fa
