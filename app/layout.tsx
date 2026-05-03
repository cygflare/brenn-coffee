import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { getCurrentUser } from '@/lib/auth';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Brenn Coffee';
const DEFAULT_DESCRIPTION =
  'Small-batch specialty coffee, roasted slow and shipped fresh. Single-origin beans from independent farms in Ethiopia, Colombia, and Guatemala.';

export const metadata: Metadata = {
  title: {
    default: 'Brenn Coffee — Slow burn. Bright finish.',
    template: '%s · Brenn Coffee',
  },
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  keywords: [
    'specialty coffee',
    'single-origin coffee',
    'UK coffee roaster',
    'fresh roasted coffee',
    'subscription coffee',
    'small-batch coffee',
    'direct trade coffee',
  ],
  authors: [{ name: 'Brenn Coffee' }],
  creator: 'Brenn Coffee',
  publisher: 'Brenn Coffee',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Brenn Coffee — Slow burn. Bright finish.',
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brenn Coffee — Slow burn. Bright finish.',
    description: 'Small-batch specialty coffee, roasted slow and shipped fresh.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  slogan: 'Slow burn. Bright finish.',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/shop?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body className="bg-ink-900 text-bone-200 min-h-screen flex flex-col">
        <ThemeProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
          <Header user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </ThemeProvider>
      </body>
    </html>
  );
}
