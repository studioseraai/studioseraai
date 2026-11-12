create table public.seraai_homepage_content (
 id text primary key check (id = 'homepage'),
 hero_artwork_id bigint not null references public.seraai_records(id) on delete restrict,
 collection_artwork_ids bigint[] not null default '{}'::bigint[],
 updated timestamptz not null default now(),
 constraint seraai_homepage_collection_limit check (cardinality(collection_artwork_ids) <= 8)
);
alter table public.seraai_homepage_content enable row level security;
revoke all on public.seraai_homepage_content from public, anon, authenticated;
grant all on public.seraai_homepage_content to service_role;
