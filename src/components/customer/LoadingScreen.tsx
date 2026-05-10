"use client";

import { useState, useEffect } from "react";

const WORDS = ["Uzman", "Rot", "Balans"];
const STEP_DURATION = 1000;

export default function LoadingScreen() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, []);

  const isBgOrange = step === 3;

  return (
    <div
      className="flex h-screen items-center justify-center transition-colors duration-700"
      style={{ background: isBgOrange ? "#f97316" : "#ffffff" }}
    >
      <div className="flex flex-col items-center gap-2 px-4 w-full">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 items-end">
          {WORDS.map((word, wi) => {
            const isActive = step === wi;
            return (
              <div key={wi} className="flex">
                {word.split("").map((char, ci) => (
                  <span
                    key={ci}
                    className="font-bold uppercase tracking-wide transition-all duration-300"
                    style={{
                      fontSize: "clamp(2rem, 10vw, 4.5rem)",
                      color: isActive
                        ? "#f97316"
                        : isBgOrange
                          ? "#fff"
                          : word === "Balans"
                            ? "#f97316"
                            : "#1f2937",
                      display: "inline-block",
                      transform: isActive ? "translateY(-8px)" : "translateY(0)",
                      transitionDelay: isActive
                        ? `${ci * 60}ms`
                        : `${(word.length - ci) * 30}ms`,
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span
            className="font-medium tracking-wide transition-colors duration-300"
            style={{
              fontSize: "clamp(0.7rem, 2.5vw, 0.875rem)",
              color: isBgOrange ? "#fff" : "#9ca3af",
            }}
          >
            Verileriniz yükleniyor
          </span>
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block rounded-full dot-bounce"
                style={{
                  width: "clamp(4px, 1.5vw, 6px)",
                  height: "clamp(4px, 1.5vw, 6px)",
                  backgroundColor: isBgOrange ? "#fff" : "#f97316",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
