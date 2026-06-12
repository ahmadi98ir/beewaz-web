'use client'

// Simple storefront receipt — no official tax/billing details
import type { InvoiceOrder, InvoiceSettings } from '@/app/admin/invoices/types'

function n(v: string | number | null | undefined) {
  const num = Number(v ?? 0)
  return Math.floor(num / 10).toLocaleString('fa-IR') + ' تومان'
}

function toFa(str: string | number | null | undefined) {
  return String(str ?? '').replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]!)
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fa-IR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export function StoreInvoice({
  order,
  settings,
}: {
  order: InvoiceOrder
  settings: InvoiceSettings
}) {
  const shopName = settings.invoice_company_name || 'بیواز'
  const total = Number(order.totalAmount ?? 0)
  const shipping = Number(order.shippingAmount ?? 0)
  const discount = Number(order.discountAmount ?? 0)
  const subtotal = total - shipping + discount

  return (
    <>
      {/* ─── Print styles ──────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #store-invoice, #store-invoice * { visibility: visible !important; }
          #store-invoice { position: fixed; inset: 0; background: white; z-index: 9999; padding: 24px; }
          @page { size: A5; margin: 1cm; }
        }
        @media screen {
          #store-invoice { display: none; }
        }
      `}</style>

      {/* ─── Screen preview card ───────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-surface-200 shadow-sm p-6 print:hidden" dir="rtl">
        <div className="text-center mb-6">
          <div className="text-2xl font-black text-surface-900 mb-1">{shopName}</div>
          <div className="text-sm text-surface-500">رسید فروشگاهی</div>
          <div className="text-xs text-surface-400 mt-1">
            تاریخ: {formatDate(order.paidAt ?? order.createdAt)}
          </div>
        </div>

        <hr className="border-surface-200 mb-5" />

        {/* Items */}
        <table className="w-full text-sm mb-5">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="text-right pb-2 text-surface-500 font-semibold">کالا</th>
              <th className="text-center pb-2 text-surface-500 font-semibold">تعداد</th>
              <th className="text-center pb-2 text-surface-500 font-semibold">قیمت واحد</th>
              <th className="text-left pb-2 text-surface-500 font-semibold">جمع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2.5 pr-0 font-semibold text-surface-900">
                  {item.productName}
                  {item.variantName && (
                    <span className="text-surface-400 font-normal text-xs mr-1">({item.variantName})</span>
                  )}
                </td>
                <td className="py-2.5 text-center text-surface-700">{toFa(item.quantity)}</td>
                <td className="py-2.5 text-center text-surface-600">{n(item.unitPrice)}</td>
                <td className="py-2.5 text-left font-bold text-surface-900">{n(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-surface-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-surface-600">
            <span>جمع کالاها</span>
            <span>{n(subtotal)}</span>
          </div>
          {shipping > 0 && (
            <div className="flex justify-between text-sm text-surface-600">
              <span>هزینه ارسال</span>
              <span>{n(shipping)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>تخفیف</span>
              <span>-{n(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-surface-900 text-base pt-2 border-t border-surface-200">
            <span>مبلغ قابل پرداخت</span>
            <span>{n(total)}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => window.print()}
            className="btn btn-primary px-6 py-2.5 text-sm"
          >
            🖨️ چاپ رسید
          </button>
        </div>
      </div>

      {/* ─── Printable receipt ────────────────────────────────────────── */}
      <div id="store-invoice" dir="rtl" style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '11pt', color: '#111', lineHeight: 1.6 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: '16pt', fontWeight: 'bold' }}>{shopName}</div>
          <div style={{ fontSize: '9pt', color: '#555' }}>رسید فروشگاهی</div>
          <div style={{ fontSize: '9pt', color: '#555', marginTop: 4 }}>
            تاریخ: {formatDate(order.paidAt ?? order.createdAt)}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '2px solid #222', marginBottom: 16 }} />

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#222', color: 'white' }}>
              {['شرح کالا', 'تعداد', 'قیمت واحد (تومان)', 'مبلغ کل (تومان)'].map((h, i) => (
                <th key={i} style={{ padding: '6px 10px', border: '1px solid #444', textAlign: 'center', fontSize: '9pt' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontSize: '9.5pt' }}>
                  {item.productName}
                  {item.variantName && <span style={{ color: '#666', fontSize: '8.5pt' }}> — {item.variantName}</span>}
                </td>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9pt' }}>{toFa(item.quantity)}</td>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9pt' }}>
                  {Math.floor(Number(item.unitPrice) / 10).toLocaleString('fa-IR')}
                </td>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9pt' }}>
                  {Math.floor(Number(item.totalPrice) / 10).toLocaleString('fa-IR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <tbody>
            <tr>
              <td style={{ width: '55%' }} />
              <td style={{ width: '45%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 10px', border: '1px solid #ddd', fontSize: '9.5pt' }}>جمع کالاها</td>
                      <td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9.5pt' }}>{Math.floor(subtotal / 10).toLocaleString('fa-IR')} تومان</td>
                    </tr>
                    {shipping > 0 && (
                      <tr>
                        <td style={{ padding: '4px 10px', border: '1px solid #ddd', fontSize: '9.5pt' }}>هزینه ارسال</td>
                        <td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9.5pt' }}>{Math.floor(shipping / 10).toLocaleString('fa-IR')} تومان</td>
                      </tr>
                    )}
                    {discount > 0 && (
                      <tr>
                        <td style={{ padding: '4px 10px', border: '1px solid #ddd', fontSize: '9.5pt' }}>تخفیف</td>
                        <td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9.5pt' }}>({Math.floor(discount / 10).toLocaleString('fa-IR')}) تومان</td>
                      </tr>
                    )}
                    <tr style={{ background: '#222', color: 'white', fontWeight: 'bold' }}>
                      <td style={{ padding: '6px 10px', border: '1px solid #444', fontSize: '10pt' }}>مبلغ قابل پرداخت</td>
                      <td style={{ padding: '6px 10px', border: '1px solid #444', textAlign: 'center', fontSize: '10pt' }}>
                        {Math.floor(total / 10).toLocaleString('fa-IR')} تومان
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {settings.invoice_footer_text && (
          <div style={{ borderTop: '1px solid #ccc', paddingTop: 8, fontSize: '8.5pt', color: '#555', textAlign: 'center' }}>
            {settings.invoice_footer_text}
          </div>
        )}
      </div>
    </>
  )
}
