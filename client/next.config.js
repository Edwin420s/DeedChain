/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_DEED_NFT_ADDRESS: process.env.NEXT_PUBLIC_DEED_NFT_ADDRESS,
    NEXT_PUBLIC_LAND_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_LAND_REGISTRY_ADDRESS,
    NEXT_PUBLIC_TOKENIZATION_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_TOKENIZATION_FACTORY_ADDRESS,
    NEXT_PUBLIC_TRANSFER_MANAGER_ADDRESS: process.env.NEXT_PUBLIC_TRANSFER_MANAGER_ADDRESS,
    NEXT_PUBLIC_WEB3_STORAGE_TOKEN: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },

  // Images configuration
  images: {
    domains: [
      'ipfs.io',
      'cloudflare-ipfs.com',
      'gateway.pinata.cloud',
      'deedchain.infura-ipfs.io'
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ]
  },

  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },

  // Compiler configuration
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig