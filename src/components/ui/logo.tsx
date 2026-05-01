import Link from 'next/link'

type LogoProps = {
  variant?: 'default' | 'light'
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { shield: 28, text: 'text-xl' },
  md: { shield: 36, text: 'text-2xl' },
  lg: { shield: 48, text: 'text-3xl' },
}

export function BeewazLogo({ variant = 'default', size = 'md' }: LogoProps) {
  const { shield, text } = sizes[size]
  const textColor = variant === 'light' ? 'text-white' : 'text-surface-900'
  const redColor = variant === 'light' ? '#ef4444' : '#e61010'

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group select-none" aria-label="بیواز — صفحه اصلی">
      {/* Shield SVG آیکون */}
      <svg
        width={shield}
        height={shield}
        viewBox="0 0 40 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
      >
        {/* بدنه سپر */}
        <path
          d="M20 2L4 8v14c0 10 7 18 16 22 9-4 16-12 16-22V8L20 2z"
          fill={redColor}
        />
        {/* حرف B */}
        <path
          d="M14 13h7.5c2.5 0 4 1.2 4 3.2 0 1.3-.7 2.3-1.8 2.8 1.4.4 2.3 1.6 2.3 3 0 2.2-1.7 3.5-4.5 3.5H14V13zm3 2.5v3.5h3.8c1.2 0 1.9-.7 1.9-1.8s-.7-1.7-1.9-1.7H17zm0 6v4h4.3c1.3 0 2.1-.8 2.1-2s-.8-2-2.1-2H17z"
          fill="white"
        />
        {/* چک‌مارک پایین سپر */}
        <path
          d="M15 33l3 3 7-7"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* نام برند */}
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-tight ${text} ${textColor} transition-colors`}>
          BEEWAZ
        </span>
        <span className={`text-[10px] font-medium tracking-wide ${variant === 'light' ? 'text-white/70' : 'text-surface-700'}`}>
          سیستم دزدگیر
        </span>
      </div>
    </Link>
  )
}
