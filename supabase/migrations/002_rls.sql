-- RLS: public read, admin-only write (requires app_metadata.role = 'admin')

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

alter table categories enable row level security;
alter table products enable row level security;
alter table connections enable row level security;

drop policy if exists "public read categories" on categories;
drop policy if exists "public read products" on products;
drop policy if exists "public read connections" on connections;
drop policy if exists "admin all categories" on categories;
drop policy if exists "admin all products" on products;
drop policy if exists "admin all connections" on connections;

create policy "public read categories"
  on categories for select
  using (true);

create policy "public read products"
  on products for select
  using (true);

create policy "public read connections"
  on connections for select
  using (is_active = true);

create policy "admin all categories"
  on categories for all
  using (is_admin())
  with check (is_admin());

create policy "admin all products"
  on products for all
  using (is_admin())
  with check (is_admin());

create policy "admin all connections"
  on connections for all
  using (is_admin())
  with check (is_admin());

-- Storage policies for product-media bucket (create bucket as public in dashboard first)
drop policy if exists "public read product images" on storage.objects;
drop policy if exists "admin upload product images" on storage.objects;
drop policy if exists "admin update product images" on storage.objects;
drop policy if exists "admin delete product images" on storage.objects;

create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-media');

create policy "admin upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-media' and public.is_admin());

create policy "admin update product images"
  on storage.objects for update
  using (bucket_id = 'product-media' and public.is_admin());

create policy "admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-media' and public.is_admin());
