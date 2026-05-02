import Link from 'next/link'
import Image from 'next/image'

type LogoProps = {
  variant?: 'default' | 'light'
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { height: 36, width: 120 },
  md: { height: 48, width: 160 },
  lg: { height: 64, width: 210 },
}

export function BeewazLogo({ variant = 'default', size = 'md' }: LogoProps) {
  const { height, width } = sizes[size]

  return (
    <Link
      href="/"
      className="inline-flex items-center group select-none"
      aria-label="بیواز — صفحه اصلی"
    >
      <Image
        src="/images/logo.png"
        alt="بیواز الکترونیک"
        width={width}
        height={height}
        priority
        className={[
          'object-contain transition-transform duration-200 group-hover:scale-105',
          variant === 'light' ? 'brightness-0 invert' : '',
        ].join(' ')}
        style={{ height, width: 'auto' }}
      />
    </Link>
  )
}
