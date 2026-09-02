import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Yapılandırma eksikse tarayıcı konsoluna uyarı basıyoruz ama build'i
// veya sunucu tarafı render'ı kırmıyoruz — Next.js prerender aşamasında
// bu dosya import edildiğinde ortam değişkenleri her zaman mevcut olmayabilir.
if (typeof window !== "undefined" && (!supabaseUrl || !supabaseKey)) {
  console.error(
    "Supabase ortam değişkenleri eksik: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-anon-key"
);
