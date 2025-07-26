import type { NextConfig } from 'next'

// Force Vercel redeploy - API URL updated to localtunnel
const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
  },
  async redirects() {
    return [
      {
        source: '/dashboard/map',
        destination: '/',
        permanent: false,
      },
      {
        source: '/dashboard/map/',
        destination: '/',
        permanent: false,
      },
      {
        source: '/terrains',
        destination: '/',
        permanent: false,
      },
      {
        source: '/terrains/',
        destination: '/',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
      {
        source: '/dashboard/',
        destination: '/',
        permanent: false,
      },
      // Redirections pour toutes les routes non trouvées
      {
        source: '/:path*',
        destination: '/',
        permanent: false,
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?!.*\\.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$).*',
          },
        ],
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://kalel-sa-match-api.loca.lt/api',
  },
  // Force redeploy comment
  poweredByHeader: false,
}

export default nextConfig
