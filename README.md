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
7. Optionally tune free-tier media limits in `.env.local` (see `.env.example`)
8. Run `npm run dev` → http://localhost:3000

Admin login: `/backend-portal-gateway-rk`

## Free-tier media limits

Defaults favor Supabase free Storage (1 GB). Override with `NEXT_PUBLIC_*` env vars:

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_IMAGE_MAX_EDGE` | `600` | Square WebP size (px) |
| `NEXT_PUBLIC_IMAGE_WEBP_QUALITY` | `0.65` | WebP quality (0.3–1) |
| `NEXT_PUBLIC_PRODUCT_MAX_IMAGES` | `2` | Max images per product |
| `NEXT_PUBLIC_DESCRIPTION_MAX_LENGTH` | `500` | Description char cap |
| `NEXT_PUBLIC_DEFECT_NOTES_MAX_LENGTH` | `300` | Defect notes char cap |

Restart the dev server after changing env vars.

## Demo mode (same app, different data source)

One application. Flip storage with an env flag:

| `NEXT_PUBLIC_DEMO_MODE` | Catalog data |
|-------------------------|--------------|
| `false` (default / prod) | Supabase |
| `true` | Local `fixtures/demo-catalog.json` |

Storefront and admin **reads** go through `lib/data.js`. In demo mode, catalog edits (inventory, connections, uploads) are blocked — no Supabase Storage/DB writes.

1. `npm run demo:generate` (refresh fixtures + `public/demo/demo_image.webp`)
2. Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`
3. Restart `npm run dev`

Set back to `false` for real production data.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run demo:generate
```
