-- Category cover images (root / sub / brand)
alter table categories
  add column if not exists image_url text;
