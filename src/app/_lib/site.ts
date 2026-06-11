// Single source of truth for the shop's NAP (name/address/phone) and links.
// Imported by the landing page, layout (JSON-LD), sitemap, robots and the
// floating contact button so the contact details never drift out of sync.

const ADDRESS_QUERY = "Motorlu San. Emeviler Sk. No: 9/11 Konya";

export const SITE = {
  name: "Uzman Rot Balans",
  legalName: "Uzman Rot Balans",
  // Matches the project's existing env convention (NEXT_PUBLIC_APP_URL). Set
  // this to the canonical https origin in production — it's baked into
  // metadataBase, OpenGraph, JSON-LD, the sitemap and robots.txt.
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  description:
    "Konya Motorlu Sanayi'de rot ayarı, balans ve lastik oteli. Aracınızın ölçüm raporunu plakanızla online görüntüleyin.",
  phoneDisplay: "0505 001 08 16",
  phoneE164: "+905050010816",
  whatsapp: "https://wa.me/905050010816",
  email: "info@uzmanrotbalans.com",
  hours: "Pzt – Cmt · 08:30 – 19:00",
  hoursSchema: "Mo-Sa 08:30-19:00",
  address: {
    street: "Motorlu San. Emeviler Sk. No: 9/11",
    city: "Konya",
    country: "TR",
    full: ADDRESS_QUERY,
  },
  maps: {
    embed: `https://maps.google.com/maps?q=${encodeURIComponent(
      ADDRESS_QUERY,
    )}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      ADDRESS_QUERY,
    )}`,
  },
} as const;

export const NAV_LINKS = [
  { label: "Hizmetler", href: "#hizmetler" },
  { label: "Lastik Oteli", href: "#lastik-oteli" },
  { label: "Hakkımızda", href: "#misyon" },
  { label: "İletişim", href: "#iletisim" },
] as const;
