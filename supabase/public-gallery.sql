-- Additive: inventory and private storage policies are unchanged.
create table public.seraai_publications (
 artwork_id bigint primary key references public.seraai_records(id) on delete cascade,
 published boolean not null default false,
 description text not null default '' check(length(description)<=6000),
 featured boolean not null default false,
 updated timestamptz not null default now()
);
create table public.seraai_events (
 id uuid primary key default gen_random_uuid(), title text not null,
 description text not null default '', starts_at timestamptz not null,
 venue text not null, category text not null, published boolean not null default false
);
create table public.seraai_inquiries (
 id uuid primary key default gen_random_uuid(), name text not null,
 email text not null, phone text not null default '', message text not null,
 preferred_date date, artwork_id bigint references public.seraai_records(id) on delete set null,
 created timestamptz not null default now(), status text not null default 'new'
);
create table public.seraai_inquiry_limits (key text primary key, hits integer not null, expires timestamptz not null);
alter table public.seraai_publications enable row level security;
alter table public.seraai_events enable row level security;
alter table public.seraai_inquiries enable row level security;
alter table public.seraai_inquiry_limits enable row level security;
revoke all on public.seraai_publications,public.seraai_events,public.seraai_inquiries,public.seraai_inquiry_limits from public,anon,authenticated;
grant all on public.seraai_publications,public.seraai_events,public.seraai_inquiries,public.seraai_inquiry_limits to service_role;
create function public.seraai_inquiry_rate(k text) returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 delete from public.seraai_inquiry_limits where expires<now();
 insert into public.seraai_inquiry_limits(key,hits,expires) values(k,1,now()+interval '1 hour')
 on conflict(key) do update set hits=public.seraai_inquiry_limits.hits+1 returning hits into n;
 return n<=5;
end $$;
revoke all on function public.seraai_inquiry_rate(text) from public,anon,authenticated;
grant execute on function public.seraai_inquiry_rate(text) to service_role;
