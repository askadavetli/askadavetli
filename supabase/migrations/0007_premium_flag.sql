-- AşkaDavetli — premium durumu (geçici, manuel yönetim)
--
-- Gerçek ödeme sistemi henüz kurulmadığı için bu alanı şimdilik
-- Supabase Table Editor'den elle true/false yaparak test edeceğiz.
-- İleride ödeme entegrasyonu geldiğinde bu alan otomatik güncellenecek.

alter table invitations
  add column if not exists is_premium boolean not null default false;
