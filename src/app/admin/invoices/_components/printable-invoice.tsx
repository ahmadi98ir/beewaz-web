'use client'

import type { InvoiceSettings, InvoiceOrder } from '../actions'

function n(v: string | null | undefined) {
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

export function PrintableInvoice({
  order,
  settings,
}: {
  order: InvoiceOrder
  settings: InvoiceSettings
}) {
  const total       = Number(order.totalAmount ?? 0)
  const shipping    = Number(order.shippingAmount ?? 0)
  const discount    = Number(order.discountAmount ?? 0)
  const tax         = Number(order.taxAmount ?? 0)
  const subtotal    = total - shipping + discount - tax
  const buyerName   = order.billingSnapshot?.companyName
    ?? order.shippingAddress?.fullName
    ?? order.customerName
    ?? '—'
  const buyerNatId  = order.billingSnapshot?.nationalId ?? order.billingSnapshot?.companyNationalId ?? '—'
  const buyerAddr   = order.billingSnapshot?.legalAddress
    ?? (order.shippingAddress
      ? [order.shippingAddress.province, order.shippingAddress.city, order.shippingAddress.street,
         order.shippingAddress.alley, `پلاک ${order.shippingAddress.plaque ?? ''}`, `واحد ${order.shippingAddress.unit ?? ''}`]
        .filter(Boolean).join('، ')
      : '—')

  return (
    <>
      {/* ─── Print styles (only active in print mode) ─────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-invoice, #printable-invoice * { visibility: visible !important; }
          #printable-invoice { position: fixed; inset: 0; background: white; z-index: 9999; padding: 24px; }
          @page { size: A4; margin: 1.5cm; }
        }
        @media screen {
          #printable-invoice { display: none; }
        }
      `}</style>

      <div id="printable-invoice" dir="rtl" style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '11pt', color: '#111', lineHeight: 1.6 }}>
        {/* ── سربرگ ────────────────────────────────────────────────────────── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <tbody>
            <tr>
              <td style={{ width: '60%', verticalAlign: 'top' }}>
                <div style={{ fontSize: '16pt', fontWeight: 'bold', marginBottom: 4 }}>{settings.invoice_company_name || 'فروشگاه'}</div>
                <div style={{ fontSize: '9pt', color: '#555' }}>
                  {settings.invoice_address && <div>آدرس: {settings.invoice_address}</div>}
                  {settings.invoice_phone && <div>تلفن: {settings.invoice_phone}</div>}
                  {settings.invoice_postal_code && <div>کد پستی: {settings.invoice_postal_code}</div>}
                  {settings.invoice_national_id && <div>شناسه ملی: {settings.invoice_national_id}</div>}
                  {settings.invoice_economic_code && <div>کد اقتصادی: {settings.invoice_economic_code}</div>}
                  {settings.invoice_registration_no && <div>شماره ثبت: {settings.invoice_registration_no}</div>}
                </div>
              </td>
              <td style={{ textAlign: 'left', verticalAlign: 'top' }}>
                <div style={{ border: '2px solid #222', padding: '8px 16px', display: 'inline-block', textAlign: 'center' }}>
                  <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>فاکتور فروش رسمی</div>
                  <div style={{ fontSize: '9pt', marginTop: 4 }}>
                    شماره: <strong>{order.invoiceNumber ? toFa(order.invoiceNumber) : '—'}</strong>
                  </div>
                  <div style={{ fontSize: '9pt' }}>تاریخ: {formatDate(order.paidAt ?? order.createdAt)}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <hr style={{ border: 'none', borderTop: '2px solid #222', marginBottom: 16 }} />

        {/* ── اطلاعات خریدار و فروشنده ────────────────────────────────────── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, border: '1px solid #ccc' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '6px 12px', border: '1px solid #ccc', width: '50%', textAlign: 'right' }}>مشخصات فروشنده</th>
              <th style={{ padding: '6px 12px', border: '1px solid #ccc', width: '50%', textAlign: 'right' }}>مشخصات خریدار</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px 12px', border: '1px solid #ccc', verticalAlign: 'top', fontSize: '9.5pt' }}>
                <div><strong>نام:</strong> {settings.invoice_company_name || '—'}</div>
                <div><strong>شناسه ملی:</strong> {settings.invoice_national_id || '—'}</div>
                <div><strong>کد اقتصادی:</strong> {settings.invoice_economic_code || '—'}</div>
                <div><strong>شماره ثبت:</strong> {settings.invoice_registration_no || '—'}</div>
                <div><strong>آدرس:</strong> {settings.invoice_address || '—'}</div>
                <div><strong>تلفن:</strong> {settings.invoice_phone || '—'}</div>
              </td>
              <td style={{ padding: '8px 12px', border: '1px solid #ccc', verticalAlign: 'top', fontSize: '9.5pt' }}>
                <div><strong>نام:</strong> {buyerName}</div>
                <div><strong>شناسه ملی / کد ملی:</strong> {buyerNatId}</div>
                {order.billingSnapshot?.economicCode && (
                  <div><strong>کد اقتصادی:</strong> {order.billingSnapshot.economicCode}</div>
                )}
                <div><strong>تلفن:</strong> {order.shippingAddress?.phone ?? order.customerPhone}</div>
                <div><strong>آدرس تحویل:</strong> {buyerAddr}</div>
                {order.shippingAddress?.postalCode && (
                  <div><strong>کد پستی:</strong> {order.shippingAddress.postalCode}</div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── جدول کالاها ─────────────────────────────────────────────────── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#222', color: 'white' }}>
              {['ردیف', 'شرح کالا / خدمات', 'کد کالا (SKU)', 'تعداد', 'قیمت واحد (تومان)', 'مبلغ کل (تومان)'].map((h, i) => (
                <th key={i} style={{ padding: '6px 10px', border: '1px solid #444', textAlign: 'center', fontSize: '9pt' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9pt' }}>{toFa(i + 1)}</td>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontSize: '9.5pt' }}>
                  {item.productName}
                  {item.variantName && <span style={{ color: '#666', fontSize: '8.5pt' }}> — {item.variantName}</span>}
                </td>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9pt', direction: 'ltr' }}>{item.sku || '—'}</td>
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

        {/* ── جمع حساب ────────────────────────────────────────────────────── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <tbody>
            <tr>
              <td style={{ width: '60%' }} />
              <td style={{ width: '40%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                  <tbody>
                    {[
                      ['جمع کل کالاها', Math.floor(subtotal / 10).toLocaleString('fa-IR')],
                      ['هزینه ارسال', Math.floor(shipping / 10).toLocaleString('fa-IR')],
                      ['تخفیف', discount > 0 ? `(${Math.floor(discount / 10).toLocaleString('fa-IR')})` : '—'],
                      ['مالیات بر ارزش افزوده', tax > 0 ? Math.floor(tax / 10).toLocaleString('fa-IR') : '—'],
                    ].map(([label, val]) => (
                      <tr key={label}>
                        <td style={{ padding: '4px 10px', border: '1px solid #ddd', fontSize: '9.5pt' }}>{label}</td>
                        <td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '9.5pt' }}>{val} تومان</td>
                      </tr>
                    ))}
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

        {/* ── امضا ────────────────────────────────────────────────────────── */}
        <table style={{ width: '100%', marginBottom: 24 }}>
          <tbody>
            <tr>
              {['مهر و امضای فروشنده', 'مهر و امضای خریدار'].map((label) => (
                <td key={label} style={{ width: '50%', textAlign: 'center', paddingTop: 8 }}>
                  <div style={{ fontSize: '9.5pt', marginBottom: 40 }}>{label}</div>
                  <div style={{ borderTop: '1px solid #999', width: '60%', margin: '0 auto' }} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* ── پاورقی ──────────────────────────────────────────────────────── */}
        {settings.invoice_footer_text && (
          <div style={{ borderTop: '1px solid #ccc', paddingTop: 8, fontSize: '8.5pt', color: '#555', textAlign: 'center' }}>
            {settings.invoice_footer_text}
          </div>
        )}
      </div>
    </>
  )
}
