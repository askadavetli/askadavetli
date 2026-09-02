import { createClient } from "@supabase/supabase-js";

function normalizeUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

const supabaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

// Yapılandırma eksik/bozuksa tarayıcı konsoluna uyarı basıyoruz ama
// build'i veya sunucu tarafı prerender'ı kırmıyoruz.
if (typeof window !== "undefined" && (!supabaseUrl || !supabaseKey)) {
  console.error(
    "Supabase ortam değişkenleri eksik veya hatalı: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-anon-key"
);
