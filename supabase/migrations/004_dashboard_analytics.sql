-- Dashboard analytics: storefront traffic + keep-alive heartbeats

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  viewed_at timestamptz default now()
);

create index if not exists idx_page_views_viewed_at on page_views (viewed_at desc);
create index if not exists idx_page_views_path on page_views (path);

create table if not exists system_heartbeats (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'keep_alive',
  status text not null check (status in ('ok', 'error', 'skipped')),
  latency_ms int,
  message text,
  created_at timestamptz default now()
);

create index if not exists idx_system_heartbeats_created_at on system_heartbeats (created_at desc);

alter table page_views enable row level security;
alter table system_heartbeats enable row level security;

create policy "Public can insert page views"
  on page_views for insert
  with check (true);

create policy "Admin can read page views"
  on page_views for select
  using (public.is_admin());

create policy "Admin can read heartbeats"
  on system_heartbeats for select
  using (public.is_admin());
