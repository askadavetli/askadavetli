"use client";

export const dynamic = "force-dynamic";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const EVENT_TYPES = [
  { value: "soz", label: "Söz" },
  { value: "nisan", label: "Nişan" },
  { value: "kina", label: "Kına" },
  { value: "dugun", label: "Düğün" },
  { value: "diger", label: "Diğer" },
];

export default function DuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loadingState, setLoadingState] = useState<"loading" | "forbidden" | "ready">(
    "loading"
  );
  const [slug, setSlug] = useState("");

  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [eventType, setEventType] = useState("dugun");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/giris");
        return;
      }

      const { data } = await supabase
        .from("invitations")
        .select(
          "id, owner_id, slug, partner1_name, partner2_name, event_type, event_date, event_time, venue_name, venue_address, is_published"
        )
        .eq("id", id)
        .maybeSingle();

      if (!active) return;

      if (!data || data.owner_id !== session.user.id) {
        setLoadingState("forbidden");
        return;
      }

      setSlug(data.slug);
      setPartner1Name(data.partner1_name);
      setPartner2Name(data.partner2_name);
      setEventType(data.event_type);
      setEventDate(data.event_date ?? "");
      setEventTime(data.event_time ?? "");
      setVenueName(data.venue_name ?? "");
      setVenueAddress(data.venue_address ?? "");
      setIsPublished(data.is_published);
      setLoadingState("ready");
    }

    load();
    return () => {
      active = false;
    };
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        partner1_name: partner1Name,
        partner2_name: partner2Name,
        event_type: eventType,
        event_date: eventDate || null,
        event_time: eventTime || null,
        venue_name: venueName || null,
        venue_address: venueAddress || null,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/panel");
  }

  if (loadingState === "loading") {
    return (
      <main className="auth-page">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  if (loadingState === "forbidden") {
    return (
      <main className="invitation-page invitation-page--empty">
        <h1>Bu davetiyeyi düzenleyemezsin</h1>
        <p>Bu davetiye sana ait değil ya da bulunamadı.</p>
      </main>
    );
  }

  return (
    <main className="create-page">
      <div className="create-page__intro">
        <h1>Davetiyeni düzenle</h1>
        <p>Değişiklikler kaydettiğinde hemen yayına yansır.</p>
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        <div className="create-form__row">
          <div>
            <label htmlFor="partner1">İlk isim</label>
            <input
              id="partner1"
              type="text"
              value={partner1Name}
              onChange={(e) => setPartner1Name(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="partner2">İkinci isim</label>
            <input
              id="partner2"
              type="text"
              value={partner2Name}
              onChange={(e) => setPartner2Name(e.target.value)}
              required
            />
          </div>
        </div>

        <label htmlFor="eventType">Etkinlik türü</label>
        <select
          id="eventType"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          {EVENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <div className="create-form__row">
          <div>
            <label htmlFor="eventDate">Tarih</label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="eventTime">Saat</label>
            <input
              id="eventTime"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </div>
        </div>

        <label htmlFor="venueName">Mekan adı</label>
        <input
          id="venueName"
          type="text"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          placeholder="Örn. Çırağan Sarayı"
        />

        <label htmlFor="venueAddress">Mekan adresi</label>
        <input
          id="venueAddress"
          type="text"
          value={venueAddress}
          onChange={(e) => setVenueAddress(e.target.value)}
          placeholder="Misafirlerin haritada göreceği adres"
        />

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Davetiye yayında (kapatırsan misafirler linke giremez)
        </label>

        {error && <p className="auth-form__error">{error}</p>}

        <div className="create-form__actions">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? "Kaydediliyor..." : "Değişiklikleri kaydet"}
          </button>
          <a href={`/davetiye/${slug}`} className="text-link">
            Davetiyeyi görüntüle
          </a>
        </div>
      </form>
    </main>
  );
}
