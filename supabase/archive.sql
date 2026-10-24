-- Reversible artwork archiving, with audit history and protection against stale edits.
create or replace function public.seraai_action(b jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare d jsonb; oldrow public.seraai_records%rowtype; new_id bigint; v_now timestamptz:=now(); m jsonb; v_ids bigint[]; v_archived boolean; v_changed integer:=0;
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
   d:=(d-'archived'-'archivedAt'-'restoredAt')||jsonb_build_object('archived',coalesce(oldrow.data->'archived','false'::jsonb),'archivedAt',oldrow.data->'archivedAt','restoredAt',oldrow.data->'restoredAt');
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
  if oldrow.data->>'archived'='true' then raise exception 'Restore artwork before recording a movement'; end if;
  if coalesce(trim(b->>'to'),'')='' or b->>'to'=oldrow.data->>'location' then raise exception 'Choose a different destination'; end if;
  if coalesce(trim(b->>'receiver'),'')='' then raise exception 'Receiver is required'; end if;
  m:=jsonb_build_object('artworkId',oldrow.id,'title',oldrow.data->>'title','type',b->>'type','from',oldrow.data->>'location','to',b->>'to','receiver',b->>'receiver','effective',coalesce(b->>'effective',v_now::text),'expectedReturn',coalesce(b->>'expectedReturn',''),'notes',coalesce(b->>'notes',''));
  insert into public.seraai_records(kind,data) values('movement',m) returning id into new_id;
  update public.seraai_records set data=jsonb_set(data,'{location}',b->'to') where id=oldrow.id;
  return jsonb_build_object('ok',true,'id',new_id);
 elsif b->>'action'='archive' then
  if jsonb_typeof(b->'ids') is distinct from 'array' or jsonb_typeof(b->'archived') is distinct from 'boolean' then raise exception 'Invalid archive request'; end if;
  if jsonb_array_length(b->'ids')<1 or jsonb_array_length(b->'ids')>1000 then raise exception 'Choose 1 to 1,000 artworks'; end if;
  if exists(select 1 from jsonb_array_elements(b->'ids') x where jsonb_typeof(x)<>'number' or x::text !~ '^[1-9][0-9]*$' or x::text::numeric>9007199254740991) then raise exception 'Invalid artwork IDs'; end if;
  select array_agg(value::text::bigint order by value::text::bigint) into v_ids from jsonb_array_elements(b->'ids');
  if (select count(distinct id) from unnest(v_ids) id)<>cardinality(v_ids) then raise exception 'Duplicate artwork IDs'; end if;
  if (select count(*) from public.seraai_records where id=any(v_ids) and kind='artwork')<>cardinality(v_ids) then raise exception 'Artwork not found; refresh and retry'; end if;
  v_archived:=(b->>'archived')::boolean;
  for oldrow in select * from public.seraai_records where id=any(v_ids) and kind='artwork' order by id for update loop
   if coalesce((oldrow.data->>'archived')::boolean,false)=v_archived then continue; end if;
   d:=oldrow.data||jsonb_build_object('archived',v_archived,case when v_archived then 'archivedAt' else 'restoredAt' end,v_now);
   update public.seraai_records set data=d where id=oldrow.id;
   insert into public.seraai_records(kind,data) values('audit',jsonb_build_object('recordId',oldrow.id,'action',case when v_archived then 'archive' else 'restore' end,'before',oldrow.data,'after',d));
   v_changed:=v_changed+1;
  end loop;
  return jsonb_build_object('ok',true,'changed',v_changed,'skipped',cardinality(v_ids)-v_changed);
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
