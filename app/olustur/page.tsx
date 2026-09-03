"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { slugify, randomSuffix } from "../../lib/slugify";
import { searchYoutubeMusic, type YoutubeSearchResult } from "../../lib/youtube";
import TemplatePicker, { type TemplateId } from "../../components/TemplatePicker";

const EVENT_TYPES = [
  { value: "soz", label: "Söz" },
  { value: "nisan", label: "Nişan" },
  { value: "kina", label: "Kına" },
  { value: "dugun", label: "Düğün" },
  { value: "diger", label: "Diğer" },
];

export default function OlusturPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [eventType, setEventType] = useState("dugun");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [template, setTemplate] = useState<TemplateId>("klasik");
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicMode, setMusicMode] = useState<"upload" | "youtube">("upload");
  const [youtubeQuery, setYoutubeQuery] = useState("");
  const [youtubeResults, setYoutubeResults] = useState<YoutubeSearchResult[]>([]);
  const [youtubeSearching, setYoutubeSearching] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [selectedYoutube, setSelectedYoutube] = useState<YoutubeSearchResult | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/giris");
        return;
      }

      if (active) setCheckingSession(false);
    }

    checkAuth();
    return () => {
      active = false;
    };
  }, [router]);

  async function handleYoutubeSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!youtubeQuery.trim()) return;

    setYoutubeSearching(true);
    setYoutubeError(null);

    try {
      const results = await searchYoutubeMusic(youtubeQuery.trim());
      setYoutubeResults(results);
    } catch (err) {
      setYoutubeError(err instanceof Error ? err.message : "Arama başarısız oldu.");
    } finally {
      setYoutubeSearching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/giris");
      return;
    }

    const baseSlug = slugify(`${partner1Name}-${partner2Name}`) || "davetiye";
    const slug = `${baseSlug}-${randomSuffix()}`;

    const { data: inserted, error: insertError } = await supabase
      .from("invitations")
      .insert({
        owner_id: session.user.id,
        slug,
        partner1_name: partner1Name,
        partner2_name: partner2Name,
        event_type: eventType,
        event_date: eventDate || null,
        event_time: eventTime || null,
        venue_name: venueName || null,
        venue_address: venueAddress || null,
        template,
        is_published: true,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      setLoading(false);
      setError(insertError?.message ?? "Davetiye oluşturulamadı.");
      return;
    }

    if (musicMode === "youtube" && selectedYoutube) {
      await supabase
        .from("invitations")
        .update({ music_youtube_id: selectedYoutube.videoId })
        .eq("id", inserted.id);
    } else if (musicMode === "upload" && musicFile) {
      const ext = musicFile.name.split(".").pop() ?? "mp3";
      const path = `${inserted.id}/music/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("media")
        .upload(path, musicFile);

      if (!uploadErr) {
        const musicUrl = supabase.storage.from("media").getPublicUrl(path)
          .data.publicUrl;
        await supabase
          .from("invitations")
          .update({ music_url: musicUrl })
          .eq("id", inserted.id);
      }
    }

    setLoading(false);
    router.push(`/davetiye/${slug}`);
  }

  if (checkingSession) {
    return (
      <main className="auth-page">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  return (
    <main className="create-page">
      <div className="create-page__intro">
        <h1>Davetiyeni oluştur</h1>
        <p>
          Bilgileri doldur, davetiyen hemen hazır olsun. Sonradan panelinden
          düzenleyebilirsin.
        </p>
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        <label>Şablon seç</label>
        <TemplatePicker value={template} onChange={setTemplate} />

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

        <label htmlFor="musicFile">Müzik (opsiyonel)</label>
        <div className="music-mode-toggle">
          <button
            type="button"
            className={musicMode === "upload" ? "active" : ""}
            onClick={() => setMusicMode("upload")}
          >
            Kendi dosyanı yükle
          </button>
          <button
            type="button"
            className={musicMode === "youtube" ? "active" : ""}
            onClick={() => setMusicMode("youtube")}
          >
            YouTube&apos;dan seç
          </button>
        </div>

        {musicMode === "upload" ? (
          <input
            id="musicFile"
            type="file"
            accept="audio/*"
            onChange={(e) => setMusicFile(e.target.files?.[0] ?? null)}
          />
        ) : (
          <div className="youtube-search">
            <div className="youtube-search__bar">
              <input
                type="text"
                value={youtubeQuery}
                onChange={(e) => setYoutubeQuery(e.target.value)}
                placeholder="Şarkı adı veya sanatçı ara"
              />
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleYoutubeSearch}
                disabled={youtubeSearching}
              >
                {youtubeSearching ? "Aranıyor..." : "Ara"}
              </button>
            </div>

            {youtubeError && <p className="auth-form__error">{youtubeError}</p>}

            {selectedYoutube && (
              <p className="youtube-search__selected">
                Seçildi: <strong>{selectedYoutube.title}</strong>
              </p>
            )}

            {youtubeResults.length > 0 && (
              <ul className="youtube-results">
                {youtubeResults.map((r) => (
                  <li
                    key={r.videoId}
                    className={
                      selectedYoutube?.videoId === r.videoId ? "selected" : ""
                    }
                    onClick={() => setSelectedYoutube(r)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.thumbnailUrl} alt="" />
                    <div>
                      <p>{r.title}</p>
                      <span>{r.channelTitle}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {error && <p className="auth-form__error">{error}</p>}

        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Oluşturuluyor..." : "Davetiyeni oluştur"}
        </button>
      </form>
    </main>
  );
}
