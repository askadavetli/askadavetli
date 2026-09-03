-- AşkaDavetli — davetiye sahibi fotoğraf/videoları silebilsin
--
-- İki ayrı silme izni gerekiyor:
-- 1) 'media' tablosundaki kayıt (hangi dosyanın hangi davetiyeye ait
--    olduğu bilgisi)
-- 2) storage.objects'teki gerçek dosyanın kendisi
--
-- Dosya yolları her zaman "{invitation_id}/..." ile başladığı için
-- (fotoğraf/video: "{id}/dosya", sesli mesaj: "{id}/audio/dosya"),
-- storage tarafında sahiplik kontrolünü yolun ilk parçasını
-- invitations.id ile karşılaştırarak yapıyoruz.

drop policy if exists "Sahip kendi davetiyesinin medyasını silebilir" on media;
create policy "Sahip kendi davetiyesinin medyasını silebilir"
  on media for delete
  using (
    exists (
      select 1 from invitations
      where invitations.id = invitation_id
        and invitations.owner_id = auth.uid()
    )
  );

drop policy if exists "Owner can delete their invitation's media objects" on storage.objects;
create policy "Owner can delete their invitation's media objects"
  on storage.objects for delete
  to public
  using (
    bucket_id = 'media'
    and exists (
      select 1 from invitations
      where invitations.owner_id = auth.uid()
        and invitations.id::text = split_part(storage.objects.name, '/', 1)
    )
  );
