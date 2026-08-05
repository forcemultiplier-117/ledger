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
    base_frequency in ('weekly', 'bi_weekly', 'monthly', 'bi_monthly', 'quarterly', 'semi_annual', 'annual')
  ),
  payment_method text,
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
