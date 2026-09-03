"use client";

export const dynamic = "force-dynamic";

import { use, useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Invitation = {
  id: string;
  partner1_name: string;
  partner2_name: string;
  event_type: string;
  event_date: string | null;
  event_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
};

type GuestbookMessage = {
  id: string;
  guest_name: string;
  message: string | null;
  audio_path: string | null;
  created_at: string;
};

type MediaItem = {
  id: string;
  storage_path: string;
  media_type: "image" | "video";
  publicUrl: string;
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  soz: "Söz",
  nisan: "Nişan",
  kina: "Kına",
  dugun: "Düğün",
  diger: "Davet",
};

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DavetiyePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "not_attending" | null>(
    null
  );
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [messageSubmitting, setMessageSubmitting] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const RECORD_SECONDS = 15;
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(RECORD_SECONDS);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioSubmitting, setAudioSubmitting] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase
        .from("invitations")
        .select(
          "id, partner1_name, partner2_name, event_type, event_date, event_time, venue_name, venue_address"
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!active) return;

      if (!data) {
        setNotFound(true);
      } else {
        setInvitation(data);

        const { data: messageRows } = await supabase
          .from("guestbook_messages")
          .select("id, guest_name, message, audio_path, created_at")
          .eq("invitation_id", data.id)
          .order("created_at", { ascending: true });

        if (active && messageRows) {
          setMessages(messageRows);
        }

        const { data: mediaRows } = await supabase
          .from("media")
          .select("id, storage_path, media_type")
          .eq("invitation_id", data.id)
          .order("created_at", { ascending: true });

        if (active && mediaRows) {
          const withUrls = mediaRows.map((row) => ({
            ...row,
            publicUrl: supabase.storage.from("media").getPublicUrl(row.storage_path)
              .data.publicUrl,
          }));
          setMedia(withUrls);
        }
      }
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [slug]);

  async function submitRsvp(status: "attending" | "not_attending") {
    if (!invitation || !guestName.trim()) {
      setRsvpError("Lütfen adını yaz.");
      return;
    }

    setRsvpStatus(status);
    setRsvpSubmitting(true);
    setRsvpError(null);

    const { error } = await supabase.from("rsvps").insert({
      invitation_id: invitation.id,
      guest_name: guestName.trim(),
      status,
      guest_count: status === "attending" ? guestCount : 0,
    });

    setRsvpSubmitting(false);

    if (error) {
      setRsvpError(error.message);
      return;
    }

    setRsvpDone(true);
  }

  async function submitMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!invitation || !guestName.trim() || !messageText.trim()) {
      setMessageError("Lütfen adını ve mesajını yaz.");
      return;
    }

    setMessageSubmitting(true);
    setMessageError(null);

    const { data, error } = await supabase
      .from("guestbook_messages")
      .insert({
        invitation_id: invitation.id,
        guest_name: guestName.trim(),
        message: messageText.trim(),
      })
      .select("id, guest_name, message, audio_path, created_at")
      .single();

    setMessageSubmitting(false);

    if (error) {
      setMessageError(error.message);
      return;
    }

    if (data) {
      setMessages((prev) => [...prev, data]);
    }
    setMessageText("");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file || !invitation) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setUploadError("Sadece fotoğraf veya video yükleyebilirsin.");
      return;
    }

    const maxSizeMb = isVideo ? 100 : 15;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setUploadError(`Dosya çok büyük (maksimum ${maxSizeMb} MB).`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    const ext = file.name.split(".").pop() ?? "dat";
    const path = `${invitation.id}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("media")
      .upload(path, file);

    if (uploadErr) {
      setUploading(false);
      setUploadError(uploadErr.message);
      return;
    }

    const { data: mediaRow, error: insertErr } = await supabase
      .from("media")
      .insert({
        invitation_id: invitation.id,
        uploaded_by_name: guestName.trim() || null,
        storage_path: path,
        media_type: isVideo ? "video" : "image",
      })
      .select("id, storage_path, media_type")
      .single();

    setUploading(false);

    if (insertErr) {
      setUploadError(insertErr.message);
      return;
    }

    if (mediaRow) {
      const publicUrl = supabase.storage.from("media").getPublicUrl(
        mediaRow.storage_path
      ).data.publicUrl;
      setMedia((prev) => [...prev, { ...mediaRow, publicUrl }]);
    }
  }

  async function startRecording() {
    setAudioError(null);

    if (!guestName.trim()) {
      setAudioError("Kayda başlamadan önce adını yaz.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordSecondsLeft(RECORD_SECONDS);

      timerRef.current = setInterval(() => {
        setRecordSecondsLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setAudioError("Mikrofon erişimi reddedildi ya da kullanılamıyor.");
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  function discardRecording() {
    setAudioBlob(null);
    setRecordSecondsLeft(RECORD_SECONDS);
  }

  async function submitAudioMessage() {
    if (!invitation || !audioBlob || !guestName.trim()) return;

    setAudioSubmitting(true);
    setAudioError(null);

    const path = `${invitation.id}/audio/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.webm`;

    const { error: uploadErr } = await supabase.storage
      .from("media")
      .upload(path, audioBlob);

    if (uploadErr) {
      setAudioSubmitting(false);
      setAudioError(uploadErr.message);
      return;
    }

    const { data, error: insertErr } = await supabase
      .from("guestbook_messages")
      .insert({
        invitation_id: invitation.id,
        guest_name: guestName.trim(),
        message: null,
        audio_path: path,
      })
      .select("id, guest_name, message, audio_path, created_at")
      .single();

    setAudioSubmitting(false);

    if (insertErr) {
      setAudioError(insertErr.message);
      return;
    }

    if (data) {
      setMessages((prev) => [...prev, data]);
    }
    setAudioBlob(null);
    setRecordSecondsLeft(RECORD_SECONDS);
  }

  if (loading) {
    return (
      <main className="invitation-page">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  if (notFound || !invitation) {
    return (
      <main className="invitation-page invitation-page--empty">
        <h1>Davetiye bulunamadı</h1>
        <p>Bu bağlantı geçersiz olabilir ya da davetiye kaldırılmış olabilir.</p>
      </main>
    );
  }

  const formattedDate = formatDate(invitation.event_date);
  const mapQuery = invitation.venue_address || invitation.venue_name;

  return (
    <main className="invitation-page">
      <section className="invitation-hero">
        <span className="invitation-hero__label">
          {EVENT_TYPE_LABELS[invitation.event_type] ?? "Davet"}
        </span>
        <h1>
          {invitation.partner1_name}
          <br />
          &amp; {invitation.partner2_name}
        </h1>

        <div className="invitation-hero__details">
          {formattedDate && <span>{formattedDate}</span>}
          {invitation.event_time && <span>{invitation.event_time.slice(0, 5)}</span>}
          {invitation.venue_name && <span>{invitation.venue_name}</span>}
        </div>
      </section>

      {mapQuery && (
        <section className="invitation-map">
          <iframe
            title="Mekan konumu"
            src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
            loading="lazy"
            allowFullScreen
          />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Haritada aç
          </a>
        </section>
      )}

      <section className="invitation-rsvp">
        {rsvpDone ? (
          <p className="invitation-rsvp__thanks">
            {rsvpStatus === "attending"
              ? "Katılımın için teşekkürler! Seni orada görmek için sabırsızlanıyoruz."
              : "Bildirimin için teşekkürler."}
          </p>
        ) : (
          <>
            <h2>Katılıyor musun?</h2>

            <label htmlFor="guestName">Adın</label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Adın Soyadın"
            />

            <label htmlFor="guestCount">Kaç kişi geleceksiniz?</label>
            <input
              id="guestCount"
              type="number"
              min={1}
              max={10}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
            />

            {rsvpError && <p className="auth-form__error">{rsvpError}</p>}

            <div className="invitation-rsvp__actions">
              <button
                type="button"
                className="btn btn--primary"
                disabled={rsvpSubmitting}
                onClick={() => submitRsvp("attending")}
              >
                Katılıyorum
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                disabled={rsvpSubmitting}
                onClick={() => submitRsvp("not_attending")}
              >
                Katılamıyorum
              </button>
            </div>
          </>
        )}
      </section>

      <section className="invitation-media">
        <h2>Fotoğraflar &amp; videolar</h2>
        <p className="invitation-media__intro">
          Etkinlikten kareler ekle, bu sayfa yıllar sonra da anı albümünüz
          olarak kalsın.
        </p>

        <label htmlFor="mediaUpload" className="btn btn--ghost media-upload-btn">
          {uploading ? "Yükleniyor..." : "Fotoğraf / video ekle"}
        </label>
        <input
          id="mediaUpload"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          disabled={uploading}
          hidden
        />

        {uploadError && <p className="auth-form__error">{uploadError}</p>}

        {media.length > 0 && (
          <div className="media-grid">
            {media.map((item) =>
              item.media_type === "video" ? (
                <video key={item.id} src={item.publicUrl} controls />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={item.id} src={item.publicUrl} alt="" />
              )
            )}
          </div>
        )}
      </section>

      <section className="invitation-guestbook">
        <h2>Anı defteri</h2>
        <p className="invitation-guestbook__intro">
          Bir mesaj bırak, çift yıllar sonra tekrar okusun.
        </p>

        <form className="guestbook-form" onSubmit={submitMessage}>
          <label htmlFor="guestNameMessage">Adın</label>
          <input
            id="guestNameMessage"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Adın Soyadın"
          />

          <label htmlFor="messageText">Mesajın</label>
          <textarea
            id="messageText"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Sizlere en mutlu günlerinizi diliyorum..."
            rows={3}
          />

          {messageError && <p className="auth-form__error">{messageError}</p>}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={messageSubmitting}
          >
            {messageSubmitting ? "Gönderiliyor..." : "Mesaj bırak"}
          </button>
        </form>

        <div className="voice-note">
          <p className="voice-note__label">
            ya da 15 saniyelik sesli bir not bırak
          </p>

          {audioError && <p className="auth-form__error">{audioError}</p>}

          {!audioBlob ? (
            <button
              type="button"
              className={`btn ${isRecording ? "btn--primary" : "btn--ghost"}`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording
                ? `Durdur (${recordSecondsLeft} sn)`
                : "Sesli mesaj kaydet"}
            </button>
          ) : (
            <div className="voice-note__preview">
              <audio src={URL.createObjectURL(audioBlob)} controls />
              <div className="voice-note__preview-actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={audioSubmitting}
                  onClick={submitAudioMessage}
                >
                  {audioSubmitting ? "Gönderiliyor..." : "Gönder"}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={audioSubmitting}
                  onClick={discardRecording}
                >
                  Tekrar kaydet
                </button>
              </div>
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <ul className="guestbook-list">
            {messages.map((msg) => (
              <li key={msg.id}>
                {msg.message && (
                  <p className="guestbook-list__message">{msg.message}</p>
                )}
                {msg.audio_path && (
                  <audio
                    className="guestbook-list__audio"
                    src={
                      supabase.storage.from("media").getPublicUrl(msg.audio_path)
                        .data.publicUrl
                    }
                    controls
                  />
                )}
                <span className="guestbook-list__author">— {msg.guest_name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
