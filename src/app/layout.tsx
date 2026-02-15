import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'LatamCreativa - Comunidad Creativa de Latinoamérica',
    template: '%s | LatamCreativa',
  },
  description:
    'Plataforma para creativos latinoamericanos. Comparte tu portafolio, conecta con otros artistas y encuentra oportunidades.',
  keywords: [
    'portafolio',
    'creativos',
    'diseño',
    'arte',
    'latinoamérica',
    'comunidad',
    'artistas',
    '3D',
    'ilustración',
    'animación',
  ],
  authors: [{ name: 'LatamCreativa' }],
  creator: 'LatamCreativa',
  publisher: 'LatamCreativa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://latamcreativa.com'
  ),
  openGraph: {
    type: 'website',
    locale: 'es_LA',
    url: '/',
    siteName: 'LatamCreativa',
    title: 'LatamCreativa - Comunidad Creativa de Latinoamérica',
    description:
      'Plataforma para creativos latinoamericanos. Comparte tu portafolio, conecta con otros artistas.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LatamCreativa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LatamCreativa',
    description: 'Comunidad Creativa de Latinoamérica',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0c0a09',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className="bg-dark-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
