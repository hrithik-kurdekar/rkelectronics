# RK Electronics

Catalog storefront for refurbished electronics. Shoppers inquire via WhatsApp; admins manage inventory in a protected panel.

## Stack

- Next.js (App Router) + Tailwind CSS
- Supabase (Postgres, Auth, Storage)
- Cloudflare Turnstile (admin login captcha)

## Setup

1. Install Node.js 20+ and run `npm install`
2. Copy `.env.example` to `.env.local` and fill in values
3. In Supabase: create tables (`categories`, `products`, `connections`), a public storage bucket (`product-media`), and an admin user with `app_metadata.role = "admin"`
4. Add the Turnstile **secret** key in Supabase Auth captcha settings
5. Run `npm run dev` → http://localhost:3000

Admin login: `/backend-portal-gateway-rk`

## Scripts

```bash
npm run dev
npm run build
npm start
```
