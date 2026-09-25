import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bestpackermovers.com'),
  title: {
    default: 'Best Packers and Movers | India\'s #1 Verified Moving Directory',
    template: '%s | BestPackerMovers.com'
  },
  description: 'Find verified, licensed, and IBA approved packers and movers across India. Compare authentic customer ratings, transparent rate cards, and get instant verified quotes.',
  keywords: [
    'packers and movers',
    'best packers and movers',
    'iba approved packers and movers',
    'house shifting services',
    'car transport service',
    'interstate moving charges',
    'relocation directory india'
  ],
  authors: [{ name: 'BestPackerMovers.com' }],
  creator: 'BestPackerMovers.com',
  publisher: 'National Logistics Network',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.bestpackermovers.com',
    siteName: 'BestPackerMovers.com',
    title: 'Best Packers and Movers | India\'s #1 Verified Moving Directory',
    description: 'PAN-India certified packers and movers aggregator. Compare ratings, transparent rate cards, and book IBA approved movers with zero hidden charges.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Packers and Movers | India\'s #1 Verified Moving Directory',
    description: 'Find verified packers and movers across all 28 Indian States & 8 UTs. Authentic reviews, pricing tables & free instant quotes.',
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
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a1128',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden antialiased selection:bg-amber-100 selection:text-amber-900">
        <Navbar />
        <main className="flex-1 w-full overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
