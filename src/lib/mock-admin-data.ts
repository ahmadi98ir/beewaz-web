// ── Mock داده برای پنل ادمین ─────────────────────────────────────────────────

export type AdminOrder = {
  id: string
  customerName: string
  phone: string
  city: string
  totalAmount: number
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  itemCount: number
  createdAt: string
}

export type AdminLead = {
  id: string
  fullName: string | null
  phone: string
  city: string | null
  inquiryType: string | null
  budget: string | null
  status: 'new' | 'contacted' | 'converted' | 'lost'
  assignedTo: string | null
  createdAt: string
  aiSummary: string | null
}

export const mockOrders: AdminOrder[] = [
  { id: 'ORD-1001', customerName: 'علی رضایی', phone: '09121234567', city: 'تهران', totalAmount: 2_850_000, status: 'delivered', itemCount: 3, createdAt: '2026-04-28T10:23:00Z' },
  { id: 'ORD-1002', customerName: 'سارا کریمی', phone: '09351234567', city: 'اصفهان', totalAmount: 3_800_000, status: 'shipped', itemCount: 1, createdAt: '2026-04-29T08:11:00Z' },
  { id: 'ORD-1003', customerName: 'محمد تهرانی', phone: '09901234567', city: 'شیراز', totalAmount: 680_000, status: 'processing', itemCount: 2, createdAt: '2026-04-30T14:05:00Z' },
  { id: 'ORD-1004', customerName: 'فاطمه موسوی', phone: '09151234567', city: 'تبریز', totalAmount: 4_500_000, status: 'paid', itemCount: 4, createdAt: '2026-04-30T16:42:00Z' },
  { id: 'ORD-1005', customerName: 'رضا احمدی', phone: '09361234567', city: 'کرج', totalAmount: 1_250_000, status: 'pending', itemCount: 2, createdAt: '2026-05-01T09:00:00Z' },
  { id: 'ORD-1006', customerName: 'نازنین صادقی', phone: '09181234567', city: 'تهران', totalAmount: 5_200_000, status: 'delivered', itemCount: 5, createdAt: '2026-04-27T11:30:00Z' },
  { id: 'ORD-1007', customerName: 'امیر حسینی', phone: '09221234567', city: 'مشهد', totalAmount: 920_000, status: 'cancelled', itemCount: 1, createdAt: '2026-04-26T13:15:00Z' },
  { id: 'ORD-1008', customerName: 'زهرا نجفی', phone: '09111234567', city: 'تهران', totalAmount: 3_150_000, status: 'processing', itemCount: 3, createdAt: '2026-05-01T11:00:00Z' },
]

export const mockLeads: AdminLead[] = [
  { id: 'LEAD-001', fullName: 'کامران ملکی', phone: '09121112222', city: 'تهران', inquiryType: 'خانه مسکونی', budget: 'متوسط', status: 'new', assignedTo: null, createdAt: '2026-05-01T10:00:00Z', aiSummary: 'خانه ۱۵۰ متری در شمال تهران. بودجه ۳ تا ۸ میلیون. نگران سرقت شبانه.' },
  { id: 'LEAD-002', fullName: 'مریم رحیمی', phone: '09351112222', city: 'اصفهان', inquiryType: 'مغازه/دفتر', budget: 'اقتصادی', status: 'contacted', assignedTo: 'علی م.', createdAt: '2026-04-30T15:30:00Z', aiSummary: 'مغازه طلافروشی ۸۰ متری. بودجه محدود. نیاز فوری.' },
  { id: 'LEAD-003', fullName: null, phone: '09901112222', city: 'کرج', inquiryType: 'پارکینگ', budget: 'اقتصادی', status: 'converted', assignedTo: 'سارا ک.', createdAt: '2026-04-29T09:00:00Z', aiSummary: 'پارکینگ ۲۰۰ متری. ۳ دوربین + یک دزدگیر مرکزی.' },
  { id: 'LEAD-004', fullName: 'حسن نظری', phone: '09151112222', city: 'تبریز', inquiryType: 'انبار/سوله', budget: 'حرفه‌ای', status: 'new', assignedTo: null, createdAt: '2026-05-01T11:30:00Z', aiSummary: 'سوله ۵۰۰ متری صنعتی. نیاز به سیستم تمام هوشمند.' },
  { id: 'LEAD-005', fullName: 'لیلا صمدی', phone: '09361112222', city: 'شیراز', inquiryType: 'خانه مسکونی', budget: 'متوسط', status: 'lost', assignedTo: 'علی م.', createdAt: '2026-04-28T14:00:00Z', aiSummary: 'آپارتمان ۱۱۰ متری. رقبا قیمت کمتر دادند.' },
  { id: 'LEAD-006', fullName: 'داود کشاورز', phone: '09181112222', city: 'تهران', inquiryType: 'مغازه/دفتر', budget: 'حرفه‌ای', status: 'contacted', assignedTo: 'سارا ک.', createdAt: '2026-04-30T16:00:00Z', aiSummary: 'دفتر اداری ۴ طبقه. نیاز به سیستم یکپارچه با اکسس کنترل.' },
  { id: 'LEAD-007', fullName: null, phone: '09221112222', city: 'مشهد', inquiryType: 'خانه مسکونی', budget: 'اقتصادی', status: 'new', assignedTo: null, createdAt: '2026-05-01T12:00:00Z', aiSummary: 'ویلای ۲۰۰ متری. بودجه تا ۳ میلیون تومان.' },
]

// آمار ماهانه برای چارت
export const monthlyStats = [
  { month: 'آبان', revenue: 48_500_000, orders: 18, leads: 32 },
  { month: 'آذر', revenue: 52_000_000, orders: 21, leads: 28 },
  { month: 'دی', revenue: 39_000_000, orders: 15, leads: 20 },
  { month: 'بهمن', revenue: 61_000_000, orders: 26, leads: 41 },
  { month: 'اسفند', revenue: 74_000_000, orders: 31, leads: 55 },
  { month: 'فروردین', revenue: 58_000_000, orders: 24, leads: 38 },
  { month: 'اردیبهشت', revenue: 83_000_000, orders: 34, leads: 62 },
]

export const kpiData = {
  totalRevenue: 83_000_000,
  revenueGrowth: +14.2,
  totalOrders: 34,
  ordersGrowth: +8.5,
  newLeads: 7,
  leadsGrowth: +22.1,
  pendingOrders: 3,
  conversionRate: 28.5,
}
