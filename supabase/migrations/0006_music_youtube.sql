-- AşkaDavetli — YouTube müzik seçimi
--
-- Çift, kendi dosyasını yüklemek yerine YouTube'dan bir şarkı arayıp
-- seçebilir. music_url (yüklenen dosya) ile music_youtube_id
-- (YouTube video id) birbirinden bağımsız, ikisi aynı anda dolu
-- olabilir ama arayüzde yalnızca biri kullanılır — öncelik
-- music_youtube_id'de.

alter table invitations
  add column if not exists music_youtube_id text;
