-- Add-only, transactional imports. Existing artwork records are never overwritten.
create unique index if not exists seraai_records_import_key on public.seraai_records ((data->>'importKey'))
where kind='artwork' and data->>'importKey' is not null;
create or replace function public.seraai_import(rows jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare d jsonb; k text; v jsonb; new_id bigint; inserted integer:=0; skipped integer:=0;
begin
 if jsonb_typeof(rows) is distinct from 'array' then raise exception 'Import rows must be an array'; end if;
 if jsonb_array_length(rows)<1 or jsonb_array_length(rows)>1000 then raise exception 'Import between 1 and 1,000 artworks'; end if;
 perform pg_advisory_xact_lock(79001602);
 for d in select value from jsonb_array_elements(rows) loop
  if jsonb_typeof(d) is distinct from 'object' then raise exception 'Invalid artwork row'; end if;
  if coalesce(trim(d->>'title'),'')='' or coalesce(trim(d->>'importKey'),'')='' then raise exception 'Title and import key are required'; end if;
  foreach k in array array['title','artist','legacyInventoryId','legacyWebNumber','webId','webCode','surface','medium','originalSize','status','location','notes','importKey','importSource','importSheet'] loop
   if d ? k and (jsonb_typeof(d->k)<>'string' or length(d->>k)>case when k='notes' then 5000 when k='importKey' then 600 else 2000 end) then raise exception 'Invalid %',k; end if;
  end loop;
  if coalesce(d->>'status','') not in ('','Available','Reserved','Sold') then raise exception 'Invalid availability'; end if;
  foreach k in array array['width','height','price'] loop
   if d ? k then
    if jsonb_typeof(d->k)<>'number' then raise exception 'Invalid %',k; end if;
    if (d->>k)::numeric<0 or (k<>'price' and ((d->>k)::numeric=0 or (d->>k)::numeric>1000000)) or (k='price' and (d->>k)::numeric>1000000000000000) then raise exception 'Invalid %',k; end if;
   end if;
  end loop;
  if jsonb_typeof(d->'importRow') is distinct from 'number' then raise exception 'Invalid source row'; end if;
  if (d->>'importRow')::numeric<1 or (d->>'importRow')::numeric<>trunc((d->>'importRow')::numeric) then raise exception 'Invalid source row'; end if;
  select jsonb_object_agg(key,value) into d from jsonb_each(d) where key=any(array['title','artist','legacyInventoryId','legacyWebNumber','webId','webCode','surface','medium','originalSize','width','height','price','status','location','notes','importKey','importSource','importSheet','importRow']);
  new_id:=null;
  insert into public.seraai_records(kind,data) values('artwork',d)
  on conflict ((data->>'importKey')) where kind='artwork' and data->>'importKey' is not null do nothing returning id into new_id;
  if new_id is null then skipped:=skipped+1; else inserted:=inserted+1; end if;
 end loop;
 return jsonb_build_object('ok',true,'imported',inserted,'skipped',skipped);
end $$;
revoke all on function public.seraai_import(jsonb) from public,anon,authenticated;
grant execute on function public.seraai_import(jsonb) to service_role;
