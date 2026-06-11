"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type RevealWord = { text: string; accent?: boolean };

export type RevealParagraph = {
  words: RevealWord[];
  className?: string;
};

/** Split a string into words, flagging the ones whose exact token (punctuation
 *  included) appears in `accents`. Accent words render in the brand orange. */
export function toWords(text: string, accents: string[] = []): RevealWord[] {
  const accentSet = new Set(accents);
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => ({ text: token, accent: accentSet.has(token) }));
}

function Word({
  word,
  progress,
  range,
}: {
  word: RevealWord;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className={word.accent ? "text-orange-500" : "text-hero-subtitle"}
    >
      {word.text}{" "}
    </motion.span>
  );
}

/**
 * Renders one or more paragraphs whose words fade in one-by-one as the block
 * scrolls through the viewport (Mindloop-style reveal). All paragraphs share a
 * SINGLE scroll timeline with continuous word ordering, so paragraph 1 fully
 * reveals before paragraph 2 begins — they never animate simultaneously.
 */
export function ScrollRevealParagraphs({
  paragraphs,
}: {
  paragraphs: RevealParagraph[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.6"],
  });

  // Reduced-motion users get the full text immediately — no scroll-driven fade.
  if (reduceMotion) {
    return (
      <div ref={ref}>
        {paragraphs.map((paragraph, pi) => (
          <p key={pi} className={paragraph.className}>
            {paragraph.words.map((word, wi) => (
              <span
                key={wi}
                className={word.accent ? "text-orange-500" : "text-hero-subtitle"}
              >
                {word.text}{" "}
              </span>
            ))}
          </p>
        ))}
      </div>
    );
  }

  const lengths = paragraphs.map((p) => p.words.length);
  const total = lengths.reduce((sum, len) => sum + len, 0);

  // Starting global word index for each paragraph, so reveal is sequential.
  const starts = lengths.map((_, i) =>
    lengths.slice(0, i).reduce((sum, len) => sum + len, 0),
  );

  return (
    <div ref={ref}>
      {paragraphs.map((paragraph, pi) => (
        <p key={pi} className={paragraph.className}>
          {paragraph.words.map((word, wi) => {
            const globalIndex = starts[pi] + wi;
            const start = globalIndex / total;
            const end = start + 1 / total;
            return (
              <Word
                key={wi}
                word={word}
                progress={scrollYProgress}
                range={[start, end]}
              />
            );
          })}
        </p>
      ))}
    </div>
  );
}
