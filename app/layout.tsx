import "./globals.css";

export const metadata = {
  title: "Askadavetli",
  description: "Hayalindeki daveti birlikte tasarlayalım.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
