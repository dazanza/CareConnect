/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Replit deployment
  output: 'standalone',
  
  // Optimize for Replit's environment
  experimental: {
    // Server actions are configured differently in newer Next.js
    serverActions: {
      enabled: true
    }
  },

  // Recommended for Replit deployments
  reactStrictMode: true,
  
  // Handle Replit's proxy setup
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  // Optimize image handling
  images: {
    domains: ['localhost', 'supabase.co'],
    unoptimized: process.env.NODE_ENV !== 'production'
  }
}

module.exports = nextConfig
