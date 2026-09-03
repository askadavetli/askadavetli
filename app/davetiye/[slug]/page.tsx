"use client";

export const dynamic = "force-dynamic";

import { use, useEffect, useState } from "react";
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
    </main>
  );
}
