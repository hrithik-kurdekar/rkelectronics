import './globals.css';
import { getSiteUrl } from '@/lib/site-url';

const siteUrl = getSiteUrl();

export const metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  title: 'RK Electronics | Premium Refurbished Store',
  description: 'Discover premium grade authentic electronic systems, components, and media equipment.',
  openGraph: {
    title: 'RK Electronics | Premium Refurbished Store',
    description: 'Discover premium grade authentic electronic systems, components, and media equipment.',
    ...(siteUrl ? { url: siteUrl.origin } : {}),
    siteName: 'RK Electronics',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white">
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
