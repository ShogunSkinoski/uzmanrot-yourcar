import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uzman Rot Balans",
  description: "Araç ayar raporu - Uzman Rot Balans Konya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full" data-theme="uzmanrot">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
