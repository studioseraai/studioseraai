-- Additive: artwork inventory and existing auth/storage remain unchanged.
create table if not exists public.seraai_wall_layouts (
 id uuid primary key default gen_random_uuid(),
 title text not null check (length(title)<=100),
 data jsonb not null check (jsonb_typeof(data)='object' and data->>'version'='2' and octet_length(data::text)<=1000000),
 updated timestamptz not null default now()
);
alter table public.seraai_wall_layouts enable row level security;
revoke all on public.seraai_wall_layouts from public, anon, authenticated;
grant select,insert,update,delete on public.seraai_wall_layouts to service_role;
