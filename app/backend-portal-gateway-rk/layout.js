import Script from 'next/script';

export default function AdminLoginLayout({ children }) {
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}
