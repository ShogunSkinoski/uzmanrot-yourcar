"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { updateTireSet, deleteTireSet } from "../actions";
import type { TireSeason, TireStatus } from "@/lib/tires";

type Props = {
  set: {
    id: number;
    season: TireSeason;
    brand: string | null;
    modelName: string | null;
    sizeText: string | null;
    status: TireStatus;
    zoneCode: string | null;
    rowCode: string | null;
    slotCode: string | null;
    installedKm: number | null;
    removedKm: number | null;
    notes: string | null;
  };
};

export default function EditTireSet({ set }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [season, setSeason] = useState<TireSeason>(set.season);
  const [brand, setBrand] = useState(set.brand ?? "");
  const [modelName, setModelName] = useState(set.modelName ?? "");
  const [sizeText, setSizeText] = useState(set.sizeText ?? "");
  const [status, setStatus] = useState<TireStatus>(set.status);
  const [zoneCode, setZoneCode] = useState(set.zoneCode ?? "");
  const [rowCode, setRowCode] = useState(set.rowCode ?? "");
  const [slotCode, setSlotCode] = useState(set.slotCode ?? "");
  const [installedKm, setInstalledKm] = useState(set.installedKm != null ? String(set.installedKm) : "");
  const [removedKm, setRemovedKm] = useState(set.removedKm != null ? String(set.removedKm) : "");
  const [notes, setNotes] = useState(set.notes ?? "");

  function handleSave() {
    setError("");
    startTransition(async () => {
      const result = await updateTireSet(set.id, {
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
      });
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete() {
    if (!confirm("Bu seti ve bağlı lastikleri silmek istediğinizden emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteTireSet(set.id);
      if (result.ok) {
        router.push("/admin/tires");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex gap-2 mb-5">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white"
        style={{ background: "#f97316" }}
      >
        <Pencil size={14} /> Düzenle
      </button>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 size={14} /> Sil
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-gray-100 p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-gray-700 text-sm mb-4">Set Düzenle</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Sezon
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
                        className="px-3 py-2 rounded-xl text-sm font-bold border-2 transition-colors"
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

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Marka
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Model
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Ebat
                  </label>
                  <input
                    type="text"
                    value={sizeText}
                    onChange={(e) => setSizeText(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Durum
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
                        className="px-3 py-2 rounded-xl text-sm font-bold border-2 transition-colors"
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
                      placeholder="—"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase">Sökülme KM</span>
                    <input
                      type="number"
                      value={removedKm}
                      onChange={(e) => setRemovedKm(e.target.value)}
                      placeholder="—"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

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

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Notlar
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 rounded-lg py-2 px-3">{error}</div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={pending}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "#f97316" }}
                >
                  {pending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
