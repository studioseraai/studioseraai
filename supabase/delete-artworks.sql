-- Permanent deletion removes artwork/media rows. Minimal audit and movement history remain.
-- Original files are queued in private audit records until object storage confirms removal.
create or replace function public.seraai_delete_artworks(ids jsonb, confirmation text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare v_ids bigint[]; oldrow public.seraai_records%rowtype; photos jsonb; changed integer:=0;
begin
 if confirmation is distinct from 'DELETE' then raise exception 'Type DELETE to confirm permanent removal'; end if;
 if jsonb_typeof(ids) is distinct from 'array' then raise exception 'Invalid artwork IDs'; end if;
 if jsonb_array_length(ids)<1 or jsonb_array_length(ids)>1000 then raise exception 'Choose 1 to 1,000 artworks'; end if;
 if exists(select 1 from jsonb_array_elements(ids) x where jsonb_typeof(x)<>'number' or x::text !~ '^[1-9][0-9]*$' or x::text::numeric>9007199254740991) then raise exception 'Invalid artwork IDs'; end if;
 select array_agg(value::text::bigint order by value::text::bigint) into v_ids from jsonb_array_elements(ids);
 if (select count(distinct id) from unnest(v_ids) id)<>cardinality(v_ids) then raise exception 'Duplicate artwork IDs'; end if;
 perform pg_advisory_xact_lock(79001603);
 if exists(select 1 from unnest(v_ids) as requested(artwork_id) where not exists(select 1 from public.seraai_records r where r.id=requested.artwork_id and r.kind='artwork') and not exists(select 1 from public.seraai_records a where a.kind='audit' and a.data->>'action'='delete' and a.data->>'recordId'=requested.artwork_id::text)) then raise exception 'Artwork not found; refresh and retry'; end if;
 for oldrow in select * from public.seraai_records where id=any(v_ids) and kind='artwork' order by id for update loop
  select coalesce(jsonb_agg(id::text),'[]'::jsonb) into photos from public.seraai_media where artwork_id=oldrow.id;
  insert into public.seraai_records(kind,data) values('audit',jsonb_build_object('action','delete','recordId',oldrow.id,'title',oldrow.data->>'title','artist',oldrow.data->>'artist','deletedAt',now(),'photoCount',jsonb_array_length(photos),'pendingPhotoIds',photos));
  delete from public.seraai_media where artwork_id=oldrow.id;
  delete from public.seraai_records where id=oldrow.id;
  changed:=changed+1;
 end loop;
 return jsonb_build_object('ok',true,'changed',changed,'skipped',cardinality(v_ids)-changed);
end $$;
create or replace function public.seraai_photo_cleanup(completed jsonb default '[]'::jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare jobs jsonb; pending integer;
begin
 if jsonb_typeof(completed) is distinct from 'array' then raise exception 'Invalid completed jobs'; end if;
 update public.seraai_records set data=jsonb_set(data,'{pendingPhotoIds}','[]'::jsonb)
 where kind='audit' and data->>'action'='delete' and id in(select value::text::bigint from jsonb_array_elements(completed));
 select count(*) into pending from public.seraai_records where kind='audit' and data->>'action'='delete' and jsonb_array_length(data->'pendingPhotoIds')>0;
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'photoIds',data->'pendingPhotoIds')),'[]'::jsonb) into jobs from (select id,data from public.seraai_records where kind='audit' and data->>'action'='delete' and jsonb_array_length(data->'pendingPhotoIds')>0 order by id limit 100) q;
 return jsonb_build_object('pending',pending,'jobs',jobs);
end $$;
revoke all on function public.seraai_delete_artworks(jsonb,text),public.seraai_photo_cleanup(jsonb) from public,anon,authenticated;
grant execute on function public.seraai_delete_artworks(jsonb,text),public.seraai_photo_cleanup(jsonb) to service_role;
