'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatPrice, toFaDigits } from '@/lib/utils'

interface OrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: string
  totalPrice: string
}

interface Order {
  id: string
  totalAmount: string
  shippingAmount: string
  discountAmount: string
  taxAmount: string
  officialInvoice: boolean
  invoiceNumber: number | string | null
  billingSnapshot: {
    customerType?: 'individual' | 'legal'
    nationalId?: string
    companyName?: string
    companyNationalId?: string
    economicCode?: string
    registrationNumber?: string
  } | null
  shippingAddress: { fullName?: string; phone?: string; province?: string; city?: string; street?: string; postalCode?: string } | null
  createdAt: string
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [seller, setSeller] = useState<{ name: string; taxCode: string; economicCode: string }>({ name: 'بیواز', taxCode: '', economicCode: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/orders/${id}`).then((r) => r.json()),
      fetch('/api/shop/seller-info').then((r) => r.json()).catch(() => ({})),
    ]).then(([data, sellerData]) => {
      setOrder(data.order ?? null)
      setItems(data.items ?? [])
      if (sellerData?.name) setSeller(sellerData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-12 text-center text-surface-400">در حال بارگذاری...</div>
  if (!order) return <div className="p-12 text-center text-surface-400">سفارش یافت نشد.</div>
  if (!order.officialInvoice) {
    return <div className="p-12 text-center text-surface-500">برای این سفارش فاکتور رسمی صادر نشده است.</div>
  }

  const b = order.billingSnapshot
  const subtotalBeforeTax = Number(order.totalAmount) - Number(order.taxAmount)
  const dateFa = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(order.createdAt))

  return (
    <div className="min-h-screen bg-surface-50 py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-surface-200 p-8 shadow-sm print:shadow-none print:border-0">
        {/* سربرگ */}
        <div className="flex items-start justify-between border-b-2 border-surface-900 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-surface-900">فاکتور فروش رسمی</h1>
            <p className="text-sm text-surface-500 mt-1">شماره فاکتور: {order.invoiceNumber ? toFaDigits(String(order.invoiceNumber)) : '—'}</p>
            <p className="text-sm text-surface-500">تاریخ: {dateFa}</p>
          </div>
          <div className="text-left text-sm">
            <p className="font-bold text-surface-800">{seller.name}</p>
            {seller.taxCode && <p className="text-surface-500">کد مالیاتی: {toFaDigits(seller.taxCode)}</p>}
            {seller.economicCode && <p className="text-surface-500">کد اقتصادی: {toFaDigits(seller.economicCode)}</p>}
          </div>
        </div>

        {/* اطلاعات خریدار */}
        <div className="mb-6 bg-surface-50 rounded-xl p-4 text-sm">
          <h2 className="font-bold text-surface-700 mb-2">مشخصات خریدار</h2>
          {b?.customerType === 'legal' ? (
            <div className="grid grid-cols-2 gap-1 text-surface-600">
              <span>نام شرکت: {b.companyName}</span>
              <span>شناسه ملی: {toFaDigits(b.companyNationalId ?? '—')}</span>
              {b.economicCode && <span>کد اقتصادی: {toFaDigits(b.economicCode)}</span>}
              {b.registrationNumber && <span>شماره ثبت: {toFaDigits(b.registrationNumber)}</span>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 text-surface-600">
              <span>نام: {order.shippingAddress?.fullName ?? '—'}</span>
              <span>کد ملی: {toFaDigits(b?.nationalId ?? '—')}</span>
            </div>
          )}
          <div className="mt-2 text-surface-500 text-xs">
            {[order.shippingAddress?.province, order.shippingAddress?.city, order.shippingAddress?.street].filter(Boolean).join('، ')}
            {order.shippingAddress?.postalCode && ` — کد پستی: ${toFaDigits(order.shippingAddress.postalCode)}`}
          </div>
        </div>

        {/* جدول اقلام */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-surface-200 text-surface-500 text-xs">
              <th className="text-start py-2">ردیف</th>
              <th className="text-start py-2">شرح کالا</th>
              <th className="text-center py-2">تعداد</th>
              <th className="text-end py-2">قیمت واحد</th>
              <th className="text-end py-2">مبلغ کل</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id} className="border-b border-surface-100">
                <td className="py-2 text-surface-600">{toFaDigits(i + 1)}</td>
                <td className="py-2 text-surface-800 font-semibold">{it.productName}</td>
                <td className="py-2 text-center text-surface-600">{toFaDigits(it.quantity)}</td>
                <td className="py-2 text-end text-surface-600">{formatPrice(it.unitPrice)}</td>
                <td className="py-2 text-end text-surface-800">{formatPrice(it.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* جمع‌بندی */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between text-surface-600">
              <span>جمع کل (پیش از مالیات)</span>
              <span>{formatPrice(subtotalBeforeTax - Number(order.shippingAmount) + Number(order.discountAmount))}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>تخفیف</span>
                <span>− {formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-surface-600">
              <span>هزینه ارسال</span>
              <span>{Number(order.shippingAmount) === 0 ? 'رایگان' : formatPrice(order.shippingAmount)}</span>
            </div>
            <div className="flex justify-between text-surface-600">
              <span>مالیات بر ارزش افزوده</span>
              <span>{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-black text-surface-900 border-t-2 border-surface-900 pt-2 text-base">
              <span>مبلغ قابل پرداخت</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* دکمه چاپ */}
        <div className="mt-8 text-center print:hidden">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700"
          >
            چاپ فاکتور
          </button>
        </div>
      </div>
    </div>
  )
}
