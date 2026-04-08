alter table if exists products
  add column if not exists brand text,
  add column if not exists gender text,
  add column if not exists category text,
  add column if not exists badge text,
  add column if not exists is_featured boolean default false,
  add column if not exists gallery_urls text[];
