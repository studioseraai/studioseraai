alter table public.seraai_homepage_content alter column hero_artwork_id drop not null;
alter table public.seraai_homepage_content drop constraint seraai_homepage_content_hero_artwork_id_fkey;
alter table public.seraai_homepage_content add constraint seraai_homepage_content_hero_artwork_id_fkey foreign key (hero_artwork_id) references public.seraai_records(id) on delete set null;
