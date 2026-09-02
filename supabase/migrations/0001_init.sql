-- AşkaDavetli — ilk şema
-- Ürün: dijital davetiye + etkinlik sonrası dijital anı platformu
--
-- Bu dosyayı Supabase Dashboard > SQL Editor içine yapıştırıp
-- "Run" ile çalıştırın. Tek seferlik bir kurulumdur.

-- ---------------------------------------------------------------
-- 1) profiles — auth.users ile birebir, kullanıcı adı/görünen ad için
-- ---------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Kullanıcı kendi profilini görebilir"
  on profiles for select
  using (auth.uid() = id);

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on profiles for update
  using (auth.uid() = id);

-- Yeni bir kullanıcı auth.users'a eklendiğinde otomatik profil satırı oluştur
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------
-- 2) invitations — asıl ürün: dijital davetiye
-- ---------------------------------------------------------------
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  slug text not null unique,

  partner1_name text not null,
  partner2_name text not null,
  event_type text not null default 'dugun'
    check (event_type in ('soz', 'nisan', 'kina', 'dugun', 'diger')),

  event_date date,
  event_time time,
  venue_name text,
  venue_address text,
  venue_lat double precision,
  venue_lng double precision,

  template text not null default 'klasik',
  cover_image_url text,
  music_url text,

  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitations_owner_id_idx on invitations (owner_id);

alter table invitations enable row level security;

create policy "Herkes yayınlanmış davetiyeyi görebilir"
  on invitations for select
  using (is_published = true);

create policy "Sahip kendi davetiyesini her zaman görebilir"
  on invitations for select
  using (auth.uid() = owner_id);

create policy "Sahip kendi davetiyesini oluşturabilir"
  on invitations for insert
  with check (auth.uid() = owner_id);

create policy "Sahip kendi davetiyesini güncelleyebilir"
  on invitations for update
  using (auth.uid() = owner_id);

create policy "Sahip kendi davetiyesini silebilir"
  on invitations for delete
  using (auth.uid() = owner_id);

-- ---------------------------------------------------------------
-- 3) rsvps — "Katılıyorum" bildirimi
-- ---------------------------------------------------------------
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations (id) on delete cascade,
  guest_name text not null,
  status text not null default 'attending'
    check (status in ('attending', 'not_attending')),
  guest_count int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists rsvps_invitation_id_idx on rsvps (invitation_id);

alter table rsvps enable row level security;

create policy "Yayınlanmış davetiyeye herkes RSVP gönderebilir"
  on rsvps for insert
  with check (
    exists (
      select 1 from invitations
      where invitations.id = invitation_id
        and invitations.is_published = true
    )
  );

create policy "Sahip kendi davetiyesinin RSVP'lerini görebilir"
  on rsvps for select
  using (
    exists (
      select 1 from invitations
      where invitations.id = invitation_id
        and invitations.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------
-- 4) guestbook_messages — dijital anı defteri
-- ---------------------------------------------------------------
create table if not exists guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations (id) on delete cascade,
  guest_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists guestbook_messages_invitation_id_idx
  on guestbook_messages (invitation_id);

alter table guestbook_messages enable row level security;

create policy "Yayınlanmış davetiyeye herkes mesaj bırakabilir"
  on guestbook_messages for insert
  with check (
    exists (
      select 1 from invitations
      where invitations.id = invitation_id
        and invitations.is_published = true
    )
  );

create policy "Yayınlanmış davetiyenin mesajlarını herkes görebilir"
  on guestbook_messages for select
  using (
    exists (
      select 1 from invitations
      where invitations.id = invitation_id
        and invitations.is_published = true
    )
  );

-- ---------------------------------------------------------------
-- 5) media — fotoğraf / video referansları
--    (dosyanın kendisi Supabase Storage'da tutulur, burada sadece yol/URL var)
-- ---------------------------------------------------------------
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations (id) on delete cascade,
  uploaded_by_name text,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists media_invitation_id_idx on media (invitation_id);

alter table media enable row level security;

create policy "Yayınlanmış davetiyeye herkes medya ekleyebilir"
  on media for insert
  with check (
    exists (
      select 1 from invitations
      where invitations.id = invitation_id
        and invitations.is_published = true
    )
  );

create policy "Yayınlanmış davetiyenin medyasını herkes görebilir"
  on media for select
  using (
    exists (
      select 1 from invitations
      where invitations.id = invitation_id
        and invitations.is_published = true
    )
  );
