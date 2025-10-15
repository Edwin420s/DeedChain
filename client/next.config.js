/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ipfs.io', 'cloudflare-ipfs.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_DEED_NFT_ADDRESS: process.env.NEXT_PUBLIC_DEED_NFT_ADDRESS,
    NEXT_PUBLIC_LAND_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_LAND_REGISTRY_ADDRESS,
  },
}

module.exports = nextConfig
