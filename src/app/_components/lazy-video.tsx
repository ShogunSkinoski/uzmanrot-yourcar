"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

// useSyncExternalStore subscribe whose value never changes after mount.
const subscribeNoop = () => () => {};

/**
 * Decorative background video that:
 *  - only mounts/plays once near the viewport (IntersectionObserver), so the
 *    page doesn't fetch/decode the same clip 4x on load,
 *  - shows the poster image (no autoplay) for users who prefer reduced motion,
 *  - is aria-hidden, since it carries no information.
 * Pass `eager` for above-the-fold videos (the hero) to skip the observer.
 */
export function LazyVideo({
  src,
  poster,
  className,
  eager = false,
}: {
  src: string;
  poster: string;
  className?: string;
  eager?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(eager);
  const reduceMotion = useReducedMotion();

  // Hydration-safe client flag: server + first client render both return false
  // (so both emit the poster <img> — no <video>/<img> tag swap during hydration
  // for reduced-motion users), then true after hydration. No setState-in-effect.
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (eager) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) {
      video.pause();
    } else {
      void video.play().catch(() => {});
    }
  }, [reduceMotion, inView]);

  const showVideo = hydrated && inView && !reduceMotion;

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      {showVideo ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          preload={eager ? "auto" : "none"}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="h-full w-full object-cover" />
      )}
    </div>
  );
}
