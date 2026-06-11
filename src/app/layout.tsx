import type { Metadata } from "next";
import { Archivo_Black, Inter, Instrument_Serif } from "next/font/google";
import { SITE } from "./_lib/site";
import "./globals.css";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

const TITLE = "Uzman Rot Balans — Konya Rot Balans ve Lastik Oteli";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: TITLE,
    template: "%s · Uzman Rot Balans",
  },
  description: SITE.description,
  keywords: [
    "rot ayarı konya",
    "balans konya",
    "lastik oteli konya",
    "rot balans konya",
    "motorlu sanayi rot balans",
    "konya rot balans fiyat",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: SITE.name,
    url: SITE.url,
    title: TITLE,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE.description,
  },
};

// schema.org structured data for local search (Google Maps pack / rich results).
// NOTE: add `geo` (latitude/longitude) and a real `aggregateRating` once the
// shop's coordinates and Google reviews are available.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "@id": `${SITE.url}/#business`,
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  telephone: SITE.phoneE164,
  email: SITE.email,
  image: `${SITE.url}/opengraph-image`,
  priceRange: "₺₺",
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressCountry: SITE.address.country,
  },
  areaServed: { "@type": "City", name: "Konya" },
  openingHours: SITE.hoursSchema,
  makesOffer: ["Rot Ayarı", "Balans Ayarı", "Lastik Oteli", "Lastik & Jant"].map(
    (name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    }),
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`h-full ${display.variable} ${inter.variable} ${serif.variable}`}
      data-theme="uzmanrot"
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
