"use client";

import { useEffect } from "react";
import Script from "next/script";
import { track } from "../_lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC;
const UMAMI_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

/** Map a link's href to a conversion event name (or null = don't track). */
function classify(href: string): string | null {
  const h = href.toLowerCase();
  if (h.includes("wa.me") || h.includes("whatsapp")) return "whatsapp_click";
  if (h.startsWith("tel:")) return "phone_click";
  if (h.startsWith("mailto:")) return "email_click";
  if (h.includes("/maps/") || h.includes("maps.google")) return "directions_click";
  if (h.includes("/customer")) return "plate_lookup_click";
  return null;
}

/**
 * Loads the configured analytics provider (GA4 and/or Umami) only when its env
 * vars are set, and installs ONE delegated click listener that auto-tracks
 * every conversion CTA on the site (WhatsApp, phone, email, directions, plate
 * lookup) — no per-link wiring required.
 */
export function Analytics() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      const event = classify(href);
      if (!event) return;
      const label = (
        anchor.textContent?.trim() ||
        anchor.getAttribute("aria-label") ||
        ""
      ).slice(0, 40);
      track(event, { href, label });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {UMAMI_SRC && UMAMI_ID && (
        <Script
          src={UMAMI_SRC}
          data-website-id={UMAMI_ID}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
