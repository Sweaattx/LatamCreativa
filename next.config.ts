import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Habilitar React Strict Mode para detectar problemas
  reactStrictMode: true,

  // TypeScript - Verificación estricta habilitada (0 errores)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimizaciones de producción
  poweredByHeader: false,  // Oculta header X-Powered-By
  compress: true,          // Compresión gzip
  productionBrowserSourceMaps: false, // Deshabilita source maps en producción

  // Configuración de imágenes externas permitidas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
    // Optimización de imágenes - tamaños responsive
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    // Limitar tamaño máximo de imágenes optimizadas
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
  },

  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Configuración experimental para mejor rendimiento
  experimental: {
    // Optimizar imports de paquetes grandes (tree-shaking mejorado)
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@tiptap/react',
      '@supabase/supabase-js',
    ],
  },

  // Headers de seguridad y caché
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https: http:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.r2.dev https://*.r2.cloudflarestorage.com; frame-ancestors 'self';",
          },
        ],
      },
      // Cache para assets estáticos
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache para fuentes
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache para _next/static (JS, CSS)
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Logging en producción (deshabilitado para mejor rendimiento)
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;
