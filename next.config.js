/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development
  reactStrictMode: true,

  // Configure image domains
  images: {
    domains: ['localhost', 'supabase.co'],
    unoptimized: process.env.NODE_ENV !== 'production'
  }
}

module.exports = nextConfig
