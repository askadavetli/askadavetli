-- AşkaDavetli — Storage politikaları
--
-- "media" bucket'ını public yapmak sadece OKUMA (public URL ile
-- görüntüleme) izni verir. Misafirlerin fotoğraf/video YÜKLEYEBİLMESİ
-- için ayrıca bir "insert" politikası gerekir. Bu dosyayı da
-- Supabase SQL Editor'de çalıştırın.

drop policy if exists "Public insert to media bucket" on storage.objects;
create policy "Public insert to media bucket"
  on storage.objects for insert
  to public
  with check (bucket_id = 'media');

drop policy if exists "Public select media bucket" on storage.objects;
create policy "Public select media bucket"
  on storage.objects for select
  to public
  using (bucket_id = 'media');
