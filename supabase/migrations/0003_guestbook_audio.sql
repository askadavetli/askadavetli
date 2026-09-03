-- AşkaDavetli — anı defterine sesli mesaj desteği
--
-- Misafirler artık yazılı mesaj yerine (veya onunla birlikte) 15
-- saniyelik bir sesli mesaj bırakabilir. Ses dosyasının kendisi
-- 'media' storage bucket'ında tutulur, burada sadece yolu var.

alter table guestbook_messages
  alter column message drop not null;

alter table guestbook_messages
  add column if not exists audio_path text;

alter table guestbook_messages
  drop constraint if exists guestbook_messages_content_check;

alter table guestbook_messages
  add constraint guestbook_messages_content_check
  check (message is not null or audio_path is not null);
