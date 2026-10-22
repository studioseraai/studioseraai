create table public.seraai_records (
 id bigint generated always as identity primary key,
 kind text not null check (kind in ('artwork','artist','movement','audit')),
 data jsonb not null default '{}'::jsonb,
 created timestamptz not null default now()
);
create index seraai_records_kind_id on public.seraai_records(kind,id desc);
create table public.seraai_media (
 id uuid primary key, artwork_id bigint not null references public.seraai_records(id),
 name text not null, mime text not null check(mime in ('image/png','image/jpeg','image/webp')),
 category text not null, hash text not null, size bigint not null check(size>0), created timestamptz not null default now()
);
create index seraai_media_artwork on public.seraai_media(artwork_id);
alter table public.seraai_records enable row level security;
alter table public.seraai_media enable row level security;
revoke all on public.seraai_records,public.seraai_media from anon,authenticated;
grant all on public.seraai_records,public.seraai_media to service_role;
grant usage,select on sequence public.seraai_records_id_seq to service_role;
create function public.seraai_action(b jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare d jsonb; oldrow public.seraai_records%rowtype; new_id bigint; v_now timestamptz:=now(); m jsonb;
begin
 if b->>'action'='save' then
  if b->>'kind' not in ('artwork','artist') then raise exception 'Invalid record type'; end if;
  d:=b->'data';
  if coalesce(trim(d->>'title'),'')='' then raise exception 'Title is required'; end if;
  if d->>'price' is not null and d->>'price'<>'' and (d->>'price')::numeric<0 then raise exception 'Invalid price'; end if;
  if b->>'id' is not null then
   select * into oldrow from public.seraai_records where id=(b->>'id')::bigint and kind=b->>'kind' for update;
   if not found then raise exception 'Record not found'; end if;
   d:=jsonb_set(d,'{location}',coalesce(oldrow.data->'location','null'::jsonb));
   update public.seraai_records set data=d where id=oldrow.id;
   insert into public.seraai_records(kind,data) values('audit',jsonb_build_object('recordId',oldrow.id,'before',oldrow.data,'after',d));
   new_id:=oldrow.id;
  else
   insert into public.seraai_records(kind,data) values(b->>'kind',d) returning id into new_id;
  end if;
  return jsonb_build_object('ok',true,'id',new_id);
 elsif b->>'action'='movement' then
  select * into oldrow from public.seraai_records where id=(b->>'artworkId')::bigint and kind='artwork' for update;
  if not found then raise exception 'Artwork not found'; end if;
  if coalesce(trim(b->>'to'),'')='' or b->>'to'=oldrow.data->>'location' then raise exception 'Choose a different destination'; end if;
  if coalesce(trim(b->>'receiver'),'')='' then raise exception 'Receiver is required'; end if;
  m:=jsonb_build_object('artworkId',oldrow.id,'title',oldrow.data->>'title','type',b->>'type','from',oldrow.data->>'location','to',b->>'to','receiver',b->>'receiver','effective',coalesce(b->>'effective',v_now::text),'expectedReturn',coalesce(b->>'expectedReturn',''),'notes',coalesce(b->>'notes',''));
  insert into public.seraai_records(kind,data) values('movement',m) returning id into new_id;
  update public.seraai_records set data=jsonb_set(data,'{location}',b->'to') where id=oldrow.id;
  return jsonb_build_object('ok',true,'id',new_id);
 elsif b->>'action'='seed' then
  perform pg_advisory_xact_lock(79001601);
  if exists(select 1 from public.seraai_records) then raise exception 'Demo is only available in an empty workspace'; end if;
  insert into public.seraai_records(kind,data) select 'artwork',value from jsonb_array_elements(b->'records');
  return jsonb_build_object('ok',true);
 end if;
 raise exception 'Unknown action';
end $$;
revoke all on function public.seraai_action(jsonb) from public,anon,authenticated;
grant execute on function public.seraai_action(jsonb) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('seraai-artworks','seraai-artworks',false,20971520,array['image/jpeg','image/png','image/webp']);
