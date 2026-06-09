import type { ReactNode, CSSProperties } from 'react'

interface BentoCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
  style?: CSSProperties
}

export function BentoCard({ children, className = '', glowColor, style }: BentoCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden
        bg-white/[0.04] backdrop-blur-xl
        border border-white/[0.08]
        transition-all duration-300 ease-out
        hover:bg-white/[0.07] hover:border-white/[0.14]
        hover:scale-[1.01]
        group
        ${className}
      `}
      style={{
        boxShadow: glowColor
          ? `0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4), 0 0 40px ${glowColor}`
          : '0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)',
        ...style,
      }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
