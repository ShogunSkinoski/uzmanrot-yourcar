"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerPage() {
  const router = useRouter();
  const [plate, setPlate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = plate.toUpperCase().replace(/\s/g, "");
    if (!normalized) return;

    setLoading(true);
    setError("");

    const res = await fetch(`/api/plate?plate=${encodeURIComponent(normalized)}`);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Bir hata oluştu");
      setLoading(false);
      return;
    }

    router.push(`/customer/report?plate=${encodeURIComponent(normalized)}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center gap-3 mb-3">
            {["Uzman", "Rot", "Balans"].map((word) => (
              <span
                key={word}
                className="font-black uppercase tracking-wide"
                style={{ fontSize: "clamp(1.4rem, 8vw, 2.2rem)", color: "#1f2937" }}
              >
                {word}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-400">MOTORLU SAN. EMEVİLER SK. NO: 9/11 KONYA</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: "#f97316" }}>
            0332 237 9226 / 0532 523 2903
          </p>
        </div>

        {/* Plate Input Card */}
        <div
          className="rounded-2xl border border-gray-100 p-8 shadow-sm"
          style={{ background: "#f8fafc" }}
        >
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6">
            Araç Plakası
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase().replace(/\s/g, ""))}
              placeholder="34 ABC 42"
              maxLength={10}
              autoFocus
              className="w-full text-center text-3xl font-black tracking-[0.25em] uppercase border-2 border-gray-200 rounded-xl py-4 px-4 outline-none transition-colors"
              style={{
                fontFamily: "ui-monospace, monospace",
                borderColor: plate ? "#f97316" : undefined,
                color: "#1f2937",
              }}
            />

            {error && (
              <div className="text-center text-sm font-medium text-red-500 bg-red-50 rounded-lg py-2 px-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!plate || loading}
              className="w-full py-4 rounded-xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "#f97316" }}
            >
              {loading ? "Aranıyor..." : "Raporumu Göster"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          Aracınıza ait son rot-balans ayar raporunu görüntüleyin
        </p>
      </div>
    </div>
  );
}
