import type { Metadata } from "next";
import { Instrument_Serif, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "AşkaDavetli — Hayalindeki daveti birlikte tasarlayalım",
  description:
    "Söz, nişan, kına ve düğün organizasyonların için mekan ve hizmet sağlayıcıları keşfet, karşılaştır, teklif al.",
  openGraph: {
    title: "AşkaDavetli",
    description: "Hayalindeki daveti birlikte tasarlayalım.",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
