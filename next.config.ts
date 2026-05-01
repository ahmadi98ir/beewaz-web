import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.beewaz.ir',
      },
      {
        protocol: 'https',
        hostname: 'cdn.beewaz.ir',
      },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
}

export default config
