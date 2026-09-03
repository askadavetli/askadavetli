"use client";

export const dynamic = "force-dynamic";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Rsvp = {
  id: string;
  guest_name: string;
  status: "attending" | "not_attending";
  guest_count: number;
  created_at: string;
};

export default function DavetlilerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [state, setState] = useState<"loading" | "forbidden" | "ready">("loading");
  const [coupleName, setCoupleName] = useState("");
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);

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

      const { data: invitation } = await supabase
        .from("invitations")
        .select("id, owner_id, partner1_name, partner2_name")
        .eq("id", id)
        .maybeSingle();

      if (!active) return;

      if (!invitation || invitation.owner_id !== session.user.id) {
        setState("forbidden");
        return;
      }

      setCoupleName(`${invitation.partner1_name} & ${invitation.partner2_name}`);

      const { data: rsvpRows } = await supabase
        .from("rsvps")
        .select("id, guest_name, status, guest_count, created_at")
        .eq("invitation_id", id)
        .order("created_at", { ascending: false });

      if (active) {
        setRsvps(rsvpRows ?? []);
        setState("ready");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id, router]);

  if (state === "loading") {
    return (
      <main className="auth-page">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  if (state === "forbidden") {
    return (
      <main className="invitation-page invitation-page--empty">
        <h1>Bu listeyi görüntüleyemezsin</h1>
        <p>Bu davetiye sana ait değil ya da bulunamadı.</p>
      </main>
    );
  }

  const attending = rsvps.filter((r) => r.status === "attending");
  const notAttending = rsvps.filter((r) => r.status === "not_attending");
  const totalGuests = attending.reduce((sum, r) => sum + (r.guest_count ?? 0), 0);

  return (
    <main className="guestlist-page">
      <div className="guestlist-page__header">
        <h1>Davetli listesi</h1>
        <p>{coupleName}</p>
      </div>

      <div className="guestlist-summary">
        <div>
          <span className="guestlist-summary__number">{totalGuests}</span>
          <span>kişi geliyor</span>
        </div>
        <div>
          <span className="guestlist-summary__number">{attending.length}</span>
          <span>olumlu dönüş</span>
        </div>
        <div>
          <span className="guestlist-summary__number">{notAttending.length}</span>
          <span>gelemeyecek</span>
        </div>
      </div>

      {rsvps.length === 0 ? (
        <div className="panel-empty">
          <p>Henüz kimse dönüş yapmadı.</p>
        </div>
      ) : (
        <ul className="guestlist-list">
          {rsvps.map((r) => (
            <li key={r.id}>
              <span className="guestlist-list__name">{r.guest_name}</span>
              <span
                className={`guestlist-list__status guestlist-list__status--${r.status}`}
              >
                {r.status === "attending"
                  ? `Katılıyor · ${r.guest_count} kişi`
                  : "Katılamıyor"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
