-- AşkaDavetli — RSVP'ye çocuk sayısı ekleme
--
-- guest_count zaten toplam kişi sayısını tutuyordu (misafir + varsa
-- +1/çocuk). child_count, bu toplamın kaçının çocuk olduğunu ayrıca
-- belirtmek için eklendi (yetişkin sayısı = guest_count - child_count).

alter table rsvps
  add column if not exists child_count int not null default 0;
