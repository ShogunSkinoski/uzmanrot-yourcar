"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, Search } from "lucide-react";
import { createTireSet } from "../actions";
import type { TireSeason, TireStatus } from "@/lib/tires";

type VehicleFound = {
  plate: string;
  make: string | null;
  model: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  km: number | null;
};

export default function NewTireSetPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [plateInput, setPlateInput] = useState("");
  const [vehicleFound, setVehicleFound] = useState<VehicleFound | null>(null);
  const [plateNotFound, setPlateNotFound] = useState(false);
  const [searching, setSearching] = useState(false);

  // Step 2
  const [season, setSeason] = useState<TireSeason>("summer");
  const [brand, setBrand] = useState("");
  const [modelName, setModelName] = useState("");
  const [sizeText, setSizeText] = useState("");
  const [status, setStatus] = useState<TireStatus>("in_storage");
  const [zoneCode, setZoneCode] = useState("");
  const [rowCode, setRowCode] = useState("");
  const [slotCode, setSlotCode] = useState("");
  const [installedKm, setInstalledKm] = useState("");
  const [removedKm, setRemovedKm] = useState("");
  const [notes, setNotes] = useState("");
  const [createTires, setCreateTires] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handlePlateSearch() {
    const plate = plateInput.toUpperCase().replace(/\s/g, "");
    if (!plate) return;
    setSearching(true);
    setVehicleFound(null);
    setPlateNotFound(false);

    const res = await fetch(`/api/plate?plate=${encodeURIComponent(plate)}`);
    setSearching(false);

    if (res.ok) {
      const data = await res.json();
      setVehicleFound(data.vehicle);
    } else {
      setPlateNotFound(true);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    const result = await createTireSet({
      plate: plateInput.toUpperCase().replace(/\s/g, ""),
      season,
      brand: brand || null,
      modelName: modelName || null,
      sizeText: sizeText || null,
      status,
      zoneCode: zoneCode || null,
      rowCode: rowCode || null,
      slotCode: slotCode || null,
      installedKm: installedKm || null,
      removedKm: removedKm || null,
      notes: notes || null,
      createTires,
    });
    setSaving(false);
    if (result.ok) {
      router.push(`/admin/tires/${result.id}`);
    } else {
      setSaveError(result.error);
    }
  }

  const canGoToStep2 = !!vehicleFound;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-800">Yeni Lastik Seti</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {["Araç", "Set Bilgileri"].map((label, i) => {
          const s = i + 1;
          const active = step === s;
          const done = step > s;
          return (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: done ? "#16a34a" : active ? "#f97316" : "#e5e7eb",
                    color: done || active ? "#fff" : "#9ca3af",
                  }}
                >
                  {done ? <Check size={12} /> : s}
                </div>
                <span
                  className="text-xs font-semibold hidden sm:block"
                  style={{ color: active ? "#f97316" : "#9ca3af" }}
                >
                  {label}
                </span>
              </div>
              {s < 2 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Plaka *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={plateInput}
                onChange={(e) => {
                  setPlateInput(e.target.value.toUpperCase().replace(/\s/g, ""));
                  setVehicleFound(null);
                  setPlateNotFound(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePlateSearch()}
                placeholder="34ABC42"
                maxLength={10}
                className="flex-1 text-center text-xl font-black tracking-widest uppercase border-2 rounded-xl py-3 px-4 outline-none transition-colors font-mono"
                style={{
                  borderColor: vehicleFound ? "#86efac" : plateNotFound ? "#dc2626" : "#e5e7eb",
                }}
                autoFocus
              />
              <button
                onClick={handlePlateSearch}
                disabled={!plateInput || searching}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-white disabled:opacity-50 shrink-0"
                style={{ background: "#f97316" }}
              >
                <Search size={18} />
                {searching ? "Aranıyor" : "Ara"}
              </button>
            </div>

            {vehicleFound && (
              <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <span className="text-green-600 font-bold text-xs">✓</span>
                <span className="text-green-700 text-xs font-semibold">
                  {[vehicleFound.make, vehicleFound.model].filter(Boolean).join(" ") || "Araç bulundu"}
                  {vehicleFound.ownerName && ` · ${vehicleFound.ownerName}`}
                </span>
              </div>
            )}
            {plateNotFound && (
              <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <p className="text-red-700 text-xs font-semibold">
                  Bu plakaya ait araç bulunamadı. Önce Araçlar menüsünden ekleyin.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              disabled={!canGoToStep2}
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "#f97316" }}
            >
              İleri <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
          {/* Sezon */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Sezon *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["summer", "Yaz"],
                  ["winter", "Kış"],
                  ["all_season", "4 Mevsim"],
                ] as const
              ).map(([value, label]) => {
                const active = season === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSeason(value)}
                    className="px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors"
                    style={{
                      background: active ? "#f97316" : "#fff",
                      color: active ? "#fff" : "#6b7280",
                      borderColor: active ? "#f97316" : "#e5e7eb",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lastik bilgileri */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Marka</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Michelin"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Model</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Primacy 4"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ebat</label>
              <input
                type="text"
                value={sizeText}
                onChange={(e) => setSizeText(e.target.value)}
                placeholder="205/55 R16 91V"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Durum */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Durum *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["in_storage", "Depoda"],
                  ["on_vehicle", "Araçta"],
                ] as const
              ).map(([value, label]) => {
                const active = status === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(value)}
                    className="px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors"
                    style={{
                      background: active ? "#f97316" : "#fff",
                      color: active ? "#fff" : "#6b7280",
                      borderColor: active ? "#f97316" : "#e5e7eb",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Takım KM bilgisi */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Takıldığı / Söküldüğü KM
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Takılma KM</span>
                <input
                  type="number"
                  value={installedKm}
                  onChange={(e) => setInstalledKm(e.target.value)}
                  placeholder="örn 145000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Sökülme KM (varsa)</span>
                <input
                  type="number"
                  value={removedKm}
                  onChange={(e) => setRemovedKm(e.target.value)}
                  placeholder="örn 162000"
                  disabled={status === "on_vehicle"}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors font-mono disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Konum (yalnızca depoda) */}
          {status === "in_storage" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Konum (Bölge / Sıra / Slot)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={zoneCode}
                  onChange={(e) => setZoneCode(e.target.value)}
                  placeholder="Bölge"
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors text-center font-mono"
                />
                <input
                  type="text"
                  value={rowCode}
                  onChange={(e) => setRowCode(e.target.value)}
                  placeholder="Sıra"
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors text-center font-mono"
                />
                <input
                  type="text"
                  value={slotCode}
                  onChange={(e) => setSlotCode(e.target.value)}
                  placeholder="Slot"
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors text-center font-mono"
                />
              </div>
            </div>
          )}

          {/* Notlar */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notlar</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Hasar, özel istek vb."
              rows={2}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors resize-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={createTires}
              onChange={(e) => setCreateTires(e.target.checked)}
              className="w-4 h-4"
            />
            4 lastik kaydını otomatik oluştur (Ön Sol/Sağ, Arka Sol/Sağ)
          </label>

          {saveError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={16} /> Geri
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "#16a34a" }}
            >
              {saving ? "Kaydediliyor..." : (
                <>
                  <Check size={16} /> Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
