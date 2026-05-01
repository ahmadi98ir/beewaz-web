'use client'

import { useEffect, useRef } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number        // میلی‌ثانیه
  threshold?: number    // 0 تا 1
  once?: boolean        // فقط یک بار اجرا شود
}

export function AnimateIn({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // تأخیر قابل تنظیم
          const timer = setTimeout(() => {
            el.classList.add('visible')
          }, delay)
          if (once) observer.unobserve(el)
          return () => clearTimeout(timer)
        } else if (!once) {
          el.classList.remove('visible')
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, threshold, once])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}

/** نسخه‌ای که کلاس reveal را مستقیم روی اولین child می‌زند */
export function AnimateInGroup({
  children,
  staggerMs = 80,
  className = '',
}: {
  children: React.ReactNode[]
  staggerMs?: number
  className?: string
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <AnimateIn key={i} delay={i * staggerMs}>
          {child}
        </AnimateIn>
      ))}
    </div>
  )
}
