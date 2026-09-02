# Supabase kurulumu

## 1. Tabloları oluşturma

1. [supabase.com](https://supabase.com) üzerinden projenize girin.
2. Sol menüden **SQL Editor**'ü açın.
3. `migrations/0001_init.sql` dosyasının tüm içeriğini kopyalayıp editöre yapıştırın.
4. **Run** butonuna basın.

Bu işlem şu tabloları oluşturur:

- `profiles` — kullanıcı profili (giriş yapan çift)
- `invitations` — dijital davetiyenin kendisi (isimler, tarih, mekan, şablon)
- `rsvps` — misafirlerin "Katılıyorum" bildirimleri
- `guestbook_messages` — dijital anı defteri mesajları
- `media` — yüklenen fotoğraf/video referansları

Her tabloda Row Level Security (RLS) açık ve temel kurallar tanımlı:
sahip kendi davetiyesini yönetebilir, misafirler yalnızca **yayınlanmış**
(`is_published = true`) davetiyelere RSVP/mesaj/medya gönderebilir.

## 2. Storage bucket oluşturma (fotoğraf/video dosyaları için)

1. Sol menüden **Storage**'ı açın.
2. **New bucket** ile `media` adında bir bucket oluşturun.
3. MVP için bucket'ı **public** yapabilirsiniz (dosyalar link ile
   herkese açık görüntülenir — anı sayfasının doğası gereği zaten
   paylaşılacak içerikler). İleride istenirse imzalı URL'lere geçilebilir.

## 3. Yeniden çalıştırmayın

Bu migration `if not exists` / `create or replace` kullandığı için
tekrar çalıştırmak hata vermez, ama normalde her migration'ı yalnızca
bir kez çalıştırmanız yeterlidir. İleride yeni tablo/kolon eklerken
`0002_...sql` gibi yeni bir dosya olarak ekleyeceğiz.
