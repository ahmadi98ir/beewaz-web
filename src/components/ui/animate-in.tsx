'use client'

import { useEffect, useRef } from 'react'

type Direction = 'up' | 'left' | 'right' | 'scale'

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
  once?: boolean
  direction?: Direction
}

const directionClass: Record<Direction, string> = {
  up:    'reveal',
  left:  'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
}

export function AnimateIn({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
  once = true,
  direction = 'up',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const timer = setTimeout(() => el.classList.add('visible'), delay)
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
  }, [delay, threshold, once, direction])

  return (
    <div ref={ref} className={`${directionClass[direction]} ${className}`}>
      {children}
    </div>
  )
}

export function AnimateInGroup({
  children,
  staggerMs = 80,
  className = '',
  direction = 'up',
}: {
  children: React.ReactNode[]
  staggerMs?: number
  className?: string
  direction?: Direction
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <AnimateIn key={i} delay={i * staggerMs} direction={direction}>
          {child}
        </AnimateIn>
      ))}
    </div>
  )
}
