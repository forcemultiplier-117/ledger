-- Budget app schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) after
-- creating a new project.

create extension if not exists "pgcrypto";

-- Entities: the "books" you're tracking (Primary Home, Rental Condo, Personal)
create table if not exists entities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Categories, self-referencing for sub-categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_category_id uuid references categories(id) on delete cascade,
  flow_type text not null check (flow_type in ('income', 'expense')),
  created_at timestamptz not null default now(),
  unique (name, parent_category_id, flow_type)
);

-- Line items: recurring income or expenses, entered once at their native frequency
create table if not exists line_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  entity_id uuid references entities(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  flow_type text not null check (flow_type in ('income', 'expense')),
  nature text not null check (nature in ('fixed', 'flexible')),
  base_amount numeric(12, 2) not null default 0,
  base_frequency text not null check (
    base_frequency in ('weekly', 'bi_weekly', 'monthly', 'bi_monthly', 'quarterly', 'semi_annual', 'annual', 'biennial')
  ),
  payment_method text,
  domain text,
  logo_url text,
  website text,
  last_paid_date date,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Incidentals: one-off, non-recurring items — a simple running log, no forecasting
create table if not exists incidentals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  entity_id uuid references entities(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  amount numeric(12, 2) not null default 0,
  occurred_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- Keep updated_at current on line_items
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists line_items_set_updated_at on line_items;
create trigger line_items_set_updated_at
  before update on line_items
  for each row execute function set_updated_at();

-- Row-level security — single user, gated behind Supabase auth
alter table entities enable row level security;
alter table categories enable row level security;
alter table line_items enable row level security;
alter table incidentals enable row level security;

create policy "Authenticated users can do everything on entities"
  on entities for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users can do everything on categories"
  on categories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users can do everything on line_items"
  on line_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users can do everything on incidentals"
  on incidentals for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Base table grants — RLS policies above only filter rows once access
-- exists; without these grants, every query fails with "permission denied"
-- regardless of the policies.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
-- Adds a managed payment methods table, replacing the free-text
-- payment_method field on line_items with a proper reference.
-- Safe to run once, after schema.sql and seed.sql.

create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  last4 text,
  kind text not null default 'credit_card' check (
    kind in ('credit_card', 'debit_card', 'bank_account', 'other')
  ),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table line_items add column if not exists payment_method_id uuid references payment_methods(id) on delete set null;

alter table payment_methods enable row level security;
create policy "Authenticated users can do everything on payment_methods"
  on payment_methods for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- New table needs its own grant — the earlier grants_fix.sql only covered
-- tables that existed at the time it ran.
grant select, insert, update, delete on payment_methods to authenticated;

-- Storage bucket for uploaded line-item logos
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "Authenticated can upload logos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'logos');

create policy "Authenticated can update logos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'logos');

create policy "Authenticated can delete logos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'logos');

create policy "Public can view logos"
  on storage.objects for select
  to public
  using (bucket_id = 'logos');
