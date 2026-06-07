'use client'

import { useEffect, useRef } from 'react'

export function EnamadBadge() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = `<a referrerpolicy="origin" target="_blank" href="https://trustseal.enamad.ir/?id=733910&Code=1fDUu6rrYqBiYkpnIrcclfpuPGF2bvxs"><img referrerpolicy="origin" src="https://trustseal.enamad.ir/logo.aspx?id=733910&Code=1fDUu6rrYqBiYkpnIrcclfpuPGF2bvxs" alt="" style="cursor:pointer;height:96px;width:auto" code="1fDUu6rrYqBiYkpnIrcclfpuPGF2bvxs"></a>`
  }, [])

  return <div ref={ref} />
}
