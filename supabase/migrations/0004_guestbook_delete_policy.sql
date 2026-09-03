-- AşkaDavetli — davetiye sahibi anı defteri mesajlarını silebilsin
--
-- Şu ana kadar guestbook_messages için hiç "delete" politikası yoktu,
-- yani kimse (sahip dahil) bir mesajı silemiyordu. Bu, sahibin
-- istemediği bir mesajı (yazılı ya da sesli) kaldırabilmesini sağlar.

drop policy if exists "Sahip kendi davetiyesinin mesajlarını silebilir" on guestbook_messages;
create policy "Sahip kendi davetiyesinin mesajlarını silebilir"
  on guestbook_messages for delete
  using (
    exists (
      select 1 from invitations
      where invitations.id = invitation_id
        and invitations.owner_id = auth.uid()
    )
  );
