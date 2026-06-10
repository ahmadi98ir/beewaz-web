'use client'

import { useState } from 'react'
import Link from 'next/link'
import { InvoiceRequestModal } from './invoice-request-modal'

export function InvoiceButtons({ orderId }: { orderId: string }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex gap-3 mb-3">
        <Link
          href={`/orders/${orderId}/invoice`}
          className="btn btn-outline flex-1 text-sm py-2.5 flex items-center justify-center gap-2"
        >
          📄 دریافت فاکتور فروشگاهی
        </Link>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-outline flex-1 text-sm py-2.5 flex items-center justify-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          🏢 درخواست فاکتور رسمی
        </button>
      </div>

      {showModal && (
        <InvoiceRequestModal
          orderId={orderId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
