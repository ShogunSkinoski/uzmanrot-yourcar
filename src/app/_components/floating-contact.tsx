"use client";

import { MessageCircle, Phone } from "lucide-react";
import { SITE } from "../_lib/site";

/**
 * Always-visible WhatsApp + Call quick actions, pinned bottom-right.
 * Local-service visitors overwhelmingly convert via WhatsApp/phone, so a
 * persistent one-tap target removes scroll-back friction between sections.
 */
export function FloatingContact() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3 sm:bottom-6 sm:right-6">
      <a
        href={SITE.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile yazın"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-black shadow-lg shadow-black/40 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href={`tel:${SITE.phoneE164}`}
        aria-label="Telefonla arayın"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-black/40 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}
