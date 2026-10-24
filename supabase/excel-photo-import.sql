-- Attach one imported photograph only when the artwork still has none.
create or replace function public.seraai_attach_excel_photo(photo jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare art public.seraai_records%rowtype; existing uuid;
begin
 select * into art from public.seraai_records where id=(photo->>'artwork_id')::bigint and kind='artwork' for update;
 if not found then raise exception 'Artwork not found'; end if;
 if art.data->>'archived'='true' then raise exception 'Restore this artwork before importing photos'; end if;
 select id into existing from public.seraai_media where artwork_id=art.id order by created,id limit 1;
 if found then return jsonb_build_object('ok',true,'id',existing,'skipped',true); end if;
 if photo->>'mime' not in ('image/jpeg','image/png','image/webp') or (photo->>'size')::bigint<1 or (photo->>'size')::bigint>4194304 or coalesce(photo->>'hash','') !~ '^[a-f0-9]{64}$' then raise exception 'Invalid imported photo'; end if;
 insert into public.seraai_media(id,artwork_id,name,mime,category,hash,size) values((photo->>'id')::uuid,art.id,photo->>'name',photo->>'mime','Front',photo->>'hash',(photo->>'size')::bigint);
 return jsonb_build_object('ok',true,'id',photo->>'id','skipped',false);
end $$;
revoke all on function public.seraai_attach_excel_photo(jsonb) from public,anon,authenticated;
grant execute on function public.seraai_attach_excel_photo(jsonb) to service_role;
