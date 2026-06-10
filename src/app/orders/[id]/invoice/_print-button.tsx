'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn btn-primary text-sm py-2.5 flex-1"
    >
      🖨 چاپ فاکتور
    </button>
  )
}
