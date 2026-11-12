alter table public.seraai_homepage_content add column hero_artwork_ids bigint[] not null default '{}'::bigint[];
update public.seraai_homepage_content set hero_artwork_ids = case when hero_artwork_id is null then '{}'::bigint[] else array[hero_artwork_id] end where cardinality(hero_artwork_ids)=0;
alter table public.seraai_homepage_content add constraint seraai_homepage_hero_limit check (cardinality(hero_artwork_ids) <= 5);
alter table public.seraai_homepage_content drop constraint seraai_homepage_collection_limit;
alter table public.seraai_homepage_content add constraint seraai_homepage_collection_limit check (cardinality(collection_artwork_ids) <= 5);
