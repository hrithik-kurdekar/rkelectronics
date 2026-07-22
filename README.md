# RK Electronics

Catalog storefront for refurbished electronics. Shoppers inquire via WhatsApp; admins manage inventory in a protected panel.

## Stack

- Next.js (App Router) + Tailwind CSS
- Supabase (Postgres, Auth, Storage) with RLS
- Cloudflare Turnstile (admin login captcha)

## Setup

1. Install Node.js 20+ and run `npm install`
2. Copy `.env.example` to `.env.local` and fill in values
3. In Supabase SQL Editor, run migrations in order:
   - `supabase/migrations/001_schema.sql` (skip if tables already exist)
   - `supabase/migrations/002_rls.sql`
4. Create a **public** storage bucket named `product-media`
5. Create an admin user and set role:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email = 'YOUR_EMAIL@example.com';
```

6. Add Turnstile **secret** in Supabase Auth captcha settings
7. Run `npm run dev` → http://localhost:3000

Admin login: `/backend-portal-gateway-rk`

## Scripts

```bash
npm run dev
npm run build
npm start
```
