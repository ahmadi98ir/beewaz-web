import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.beewaz.ir' },
      { protocol: 'https', hostname: 'cdn.beewaz.ir' },
    ],
  },
  typedRoutes: false,
}

export default config
