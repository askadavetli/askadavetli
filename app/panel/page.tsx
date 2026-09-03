"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import QRCode from "qrcode";
import { supabase } from "../../lib/supabase";

type MediaPreview = {
  id: string;
  media_type: "image" | "video";
  publicUrl: string;
};

type MediaFull = MediaPreview & {
  uploaded_by_name: string | null;
};

type InvitationRow = {
  id: string;
  slug: string;
  partner1_name: string;
  partner2_name: string;
  event_date: string | null;
  is_published: boolean;
  attendingGuestCount: number;
  mediaCount: number;
  mediaPreview: MediaPreview[];
};

export default function PanelPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [mediaSearchOpen, setMediaSearchOpen] = useState<Record<string, boolean>>({});
  const [mediaSearchQuery, setMediaSearchQuery] = useState<Record<string, string>>({});
  const [fullMedia, setFullMedia] = useState<Record<string, MediaFull[]>>({});
  const [fullMediaLoading, setFullMediaLoading] = useState<Record<string, boolean>>(
    {}
  );

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

      if (!active) return;
      setUser(session.user);

      const { data: invitationRows } = await supabase
        .from("invitations")
        .select("id, slug, partner1_name, partner2_name, event_date, is_published")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!invitationRows) {
        setLoading(false);
        return;
      }

      const withCounts: InvitationRow[] = await Promise.all(
        invitationRows.map(async (inv) => {
          const { data: rsvpRows } = await supabase
            .from("rsvps")
            .select("guest_count")
            .eq("invitation_id", inv.id)
            .eq("status", "attending");

          const attendingGuestCount = (rsvpRows ?? []).reduce(
            (sum, row) => sum + (row.guest_count ?? 0),
            0
          );

          const { count: mediaCount } = await supabase
            .from("media")
            .select("id", { count: "exact", head: true })
            .eq("invitation_id", inv.id);

          const { data: mediaRows } = await supabase
            .from("media")
            .select("id, storage_path, media_type")
            .eq("invitation_id", inv.id)
            .order("created_at", { ascending: false })
            .limit(4);

          const mediaPreview: MediaPreview[] = (mediaRows ?? []).map((row) => ({
            id: row.id,
            media_type: row.media_type,
            publicUrl: supabase.storage.from("media").getPublicUrl(row.storage_path)
              .data.publicUrl,
          }));

          return {
            ...inv,
            attendingGuestCount,
            mediaCount: mediaCount ?? 0,
            mediaPreview,
          };
        })
      );

      if (active) {
        setInvitations(withCounts);
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function toggleQr(invId: string, slug: string) {
    if (qrCodes[invId]) {
      setQrCodes((prev) => {
        const next = { ...prev };
        delete next[invId];
        return next;
      });
      return;
    }

    const url = `${window.location.origin}/davetiye/${slug}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 320, margin: 1 });
    setQrCodes((prev) => ({ ...prev, [invId]: dataUrl }));
  }

  async function toggleMediaSearch(invId: string) {
    const isOpen = mediaSearchOpen[invId];

    if (isOpen) {
      setMediaSearchOpen((prev) => ({ ...prev, [invId]: false }));
      return;
    }

    setMediaSearchOpen((prev) => ({ ...prev, [invId]: true }));

    if (!fullMedia[invId]) {
      setFullMediaLoading((prev) => ({ ...prev, [invId]: true }));

      const { data } = await supabase
        .from("media")
        .select("id, storage_path, media_type, uploaded_by_name")
        .eq("invitation_id", invId)
        .order("created_at", { ascending: false });

      const items: MediaFull[] = (data ?? []).map((row) => ({
        id: row.id,
        media_type: row.media_type,
        uploaded_by_name: row.uploaded_by_name,
        publicUrl: supabase.storage.from("media").getPublicUrl(row.storage_path)
          .data.publicUrl,
      }));

      setFullMedia((prev) => ({ ...prev, [invId]: items }));
      setFullMediaLoading((prev) => ({ ...prev, [invId]: false }));
    }
  }

  if (loading) {
    return (
      <main className="panel-page">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  return (
    <main className="panel-page">
      <div className="panel-page__header">
        <div>
          <h1>Merhaba{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}</h1>
          <p>Davetiyelerini buradan yönet.</p>
        </div>
        <button className="btn btn--ghost" onClick={handleSignOut}>
          Çıkış yap
        </button>
      </div>

      {invitations.length === 0 ? (
        <div className="panel-empty">
          <p>Henüz bir davetiyen yok.</p>
          <a href="/olustur" className="btn btn--primary">
            Davetiyeni oluştur
          </a>
        </div>
      ) : (
        <ul className="panel-list">
          {invitations.map((inv) => (
            <li key={inv.id}>
              <div className="panel-list__row">
                <div>
                  <h3>
                    {inv.partner1_name} & {inv.partner2_name}
                  </h3>
                  <p>
                    {inv.event_date ?? "Tarih henüz eklenmedi"} ·{" "}
                    {inv.is_published ? "Yayında" : "Taslak"}
                  </p>
                </div>
                <div className="panel-list__meta">
                  <span>{inv.attendingGuestCount} kişi katılıyor</span>
                  <button
                    type="button"
                    className="text-link panel-qr-toggle"
                    onClick={() => toggleQr(inv.id, inv.slug)}
                  >
                    {qrCodes[inv.id] ? "QR kodu gizle" : "QR kodu göster"}
                  </button>
                  <a href={`/davetliler/${inv.id}`} className="text-link">
                    Davetli listesi
                  </a>
                  <button
                    type="button"
                    className="text-link panel-qr-toggle"
                    onClick={() => toggleMediaSearch(inv.id)}
                  >
                    {mediaSearchOpen[inv.id] ? "Aramayı kapat" : "Anılarda ara"}
                  </button>
                  <a href={`/duzenle/${inv.id}`} className="text-link">
                    Düzenle
                  </a>
                  <a href={`/davetiye/${inv.slug}`} className="text-link">
                    Görüntüle
                  </a>
                </div>
              </div>

              {qrCodes[inv.id] && (
                <div className="panel-qr">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodes[inv.id]} alt="Davetiye QR kodu" />
                  <p>
                    Masalara veya girişe koy — misafirler telefonla okutunca
                    doğrudan katılım / fotoğraf / anı defteri menüsüne düşer.
                  </p>
                  <a
                    href={qrCodes[inv.id]}
                    download={`askadavetli-qr-${inv.slug}.png`}
                    className="btn btn--ghost"
                  >
                    QR kodu indir
                  </a>
                </div>
              )}

              {mediaSearchOpen[inv.id] && (
                <div className="panel-media-search">
                  <input
                    type="text"
                    placeholder="Yükleyen kişiye göre ara..."
                    value={mediaSearchQuery[inv.id] ?? ""}
                    onChange={(e) =>
                      setMediaSearchQuery((prev) => ({
                        ...prev,
                        [inv.id]: e.target.value,
                      }))
                    }
                  />

                  {fullMediaLoading[inv.id] ? (
                    <p>Yükleniyor...</p>
                  ) : (
                    (() => {
                      const query = (mediaSearchQuery[inv.id] ?? "").trim().toLowerCase();
                      const items = fullMedia[inv.id] ?? [];
                      const filtered = query
                        ? items.filter((item) =>
                            (item.uploaded_by_name ?? "").toLowerCase().includes(query)
                          )
                        : items;

                      if (filtered.length === 0) {
                        return <p>Eşleşen kayıt yok.</p>;
                      }

                      return (
                        <div className="panel-media-search__grid">
                          {filtered.map((item) => (
                            <div key={item.id} className="panel-media-search__item">
                              {item.media_type === "video" ? (
                                <video src={item.publicUrl} muted />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.publicUrl} alt="" />
                              )}
                              {item.uploaded_by_name && (
                                <span>{item.uploaded_by_name}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {inv.mediaPreview.length > 0 && (
                <div className="panel-media-preview">
                  {inv.mediaPreview.map((item) =>
                    item.media_type === "video" ? (
                      <video key={item.id} src={item.publicUrl} muted />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={item.id} src={item.publicUrl} alt="" />
                    )
                  )}
                  {inv.mediaCount > inv.mediaPreview.length && (
                    <a
                      href={`/davetiye/${inv.slug}`}
                      className="panel-media-preview__more"
                    >
                      +{inv.mediaCount - inv.mediaPreview.length}
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
