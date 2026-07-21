// app/layout.js
import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'RK Electronics | Premium Refurbished Store',
  description: 'Discover premium grade authentic electronic systems, components, and media equipment.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white">
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}