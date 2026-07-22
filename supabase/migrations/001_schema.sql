-- RK Electronics: schema (run once on a fresh project)

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('root', 'sub', 'brand')),
  parent_id uuid references categories(id) on delete cascade,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sku_code text unique,
  description text,
  price numeric default 0,
  condition text,
  defect_notes text,
  is_featured boolean default false,
  image_urls text[] default '{}',
  root_category_id uuid references categories(id),
  sub_category_id uuid references categories(id),
  brand_id uuid references categories(id),
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  type text not null,
  value text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_products_sku on products(sku_code);
create index if not exists idx_products_root on products(root_category_id);
create index if not exists idx_categories_type on categories(type);
