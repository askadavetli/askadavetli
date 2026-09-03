-- AşkaDavetli — Midnight/Royal Gold için birden fazla arka plan seçeneği
--
-- template zaten hangi genel temanın (klasik/midnight/royal-gold) seçili
-- olduğunu tutuyordu. background_image, o temanın kendi içindeki hangi
-- fotoğrafın seçildiğini tutar (örn. "midnight-2"). Boşsa o temanın
-- varsayılan (ilk) fotoğrafı kullanılır.

alter table invitations
  add column if not exists background_image text;
