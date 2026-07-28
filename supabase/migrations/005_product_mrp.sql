-- Optional MRP (maximum retail price) for discount display on storefront.

alter table products
  add column if not exists mrp numeric;
