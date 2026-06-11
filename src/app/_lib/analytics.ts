// Provider-agnostic analytics. `track()` fires a custom event to whichever
// provider is configured (GA4 and/or Umami). It's a no-op when none is set, so
// it's always safe to call and ships zero tracking until you opt in via env.

type AnalyticsProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    umami?: { track?: (event: string, props?: AnalyticsProps) => void };
    dataLayer?: unknown[];
  }
}

export function track(event: string, props?: AnalyticsProps) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, props);
    window.umami?.track?.(event, props);
  } catch {
    // Analytics must never break the UI.
  }
}
