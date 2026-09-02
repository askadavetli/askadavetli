"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

type InvitationRow = {
  id: string;
  slug: string;
  partner1_name: string;
  partner2_name: string;
  event_date: string | null;
  is_published: boolean;
  attendingGuestCount: number;
};

export default function PanelPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);

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

          return { ...inv, attendingGuestCount };
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
                <a href={`/davetiye/${inv.slug}`} className="text-link">
                  Görüntüle
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
