"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, Search } from "lucide-react";
import { createTireOperation } from "./actions";
import {
  SEASON_LABEL,
  STATUS_LABEL,
  formatLocation,
  type TireOperationType,
  type TireSeason,
  type TireStatus,
} from "@/lib/tires";

type SetSummary = {
  id: number;
  vehicleId: number;
  season: TireSeason;
  brand: string | null;
  modelName: string | null;
  sizeText: string | null;
  status: TireStatus;
  zoneCode: string | null;
  rowCode: string | null;
  slotCode: string | null;
};

type VehicleFound = {
  id: number;
  plate: string;
  make: string | null;
  model: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  km: number | null;
};

const SEASON_BADGE: Record<TireSeason, { bg: string; color: string }> = {
  summer: { bg: "#fef9c3", color: "#854d0e" },
  winter: { bg: "#dbeafe", color: "#1e40af" },
  all_season: { bg: "#f3e8ff", color: "#6b21a8" },
};

function setLabel(s: SetSummary) {
  const tire = [s.brand, s.modelName].filter(Boolean).join(" ");
  const size = s.sizeText ?? "";
  return [SEASON_LABEL[s.season], tire, size].filter(Boolean).join(" · ");
}

export default function NewTireOperationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [plateInput, setPlateInput] = useState("");
  const [vehicle, setVehicle] = useState<VehicleFound | null>(null);
  const [plateNotFound, setPlateNotFound] = useState(false);
  const [searching, setSearching] = useState(false);

  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0, 16));
  const [kmAtService, setKmAtService] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [operationType, setOperationType] = useState<TireOperationType>("seasonal_change");

  // Step 2
  const [allSets, setAllSets] = useState<SetSummary[]>([]);
  const [loadingSets, setLoadingSets] = useState(false);
  const [removedTireSetId, setRemovedTireSetId] = useState<number | null>(null);
  const [installedTireSetId, setInstalledTireSetId] = useState<number | null>(null);
  const [removedToZone, setRemovedToZone] = useState("");
  const [removedToRow, setRemovedToRow] = useState("");
  const [removedToSlot, setRemovedToSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handlePlateSearch() {
    const plate = plateInput.toUpperCase().replace(/\s/g, "");
    if (!plate) return;
    setSearching(true);
    setVehicle(null);
    setPlateNotFound(false);

    const res = await fetch(`/api/plate?plate=${encodeURIComponent(plate)}`);
    setSearching(false);

    if (res.ok) {
      const data = await res.json();
      setVehicle({ id: data.vehicle.id, ...data.vehicle });
    } else {
      setPlateNotFound(true);
    }
  }

  // Step 2'ye geçtiğimizde aracın setlerini çek
  useEffect(() => {
    if (step !== 2 || !vehicle) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoadingSets(true);
    });
    fetch(`/api/admin/tire-sets?vehicleId=${vehicle.id}`)
      .then((r) => r.json())
      .then((data: SetSummary[]) => {
        if (!cancelled) setAllSets(data);
      })
      .catch(() => {
        if (!cancelled) setAllSets([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSets(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, vehicle]);

  const onVehicleSets = useMemo(() => allSets.filter((s) => s.status === "on_vehicle"), [allSets]);
  const inStorageSets = useMemo(() => allSets.filter((s) => s.status === "in_storage"), [allSets]);

  const needsRemoved = operationType === "seasonal_change" || operationType === "store";
  const needsInstalled =
    operationType === "seasonal_change" ||
    operationType === "retrieve" ||
    operationType === "new_install";
  const needsLocation = needsRemoved;

  const canSave = (() => {
    if (needsRemoved && !removedTireSetId) return false;
    if (needsInstalled && !installedTireSetId) return false;
    return !!vehicle;
  })();

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    const result = await createTireOperation({
      plate: vehicle!.plate,
      operationType,
      serviceDate,
      kmAtService: kmAtService || null,
      orderNo: orderNo || null,
      notes: notes || null,
      removedTireSetId: needsRemoved ? removedTireSetId : null,
      installedTireSetId: needsInstalled ? installedTireSetId : null,
      removedToZone: needsLocation ? (removedToZone || null) : null,
      removedToRow: needsLocation ? (removedToRow || null) : null,
      removedToSlot: needsLocation ? (removedToSlot || null) : null,
    });
    setSaving(false);
    if (result.ok) {
      router.push(`/admin/tire-operations/${result.id}`);
    } else {
      setSaveError(result.error);
    }
  }

  const canGoToStep2 = !!vehicle && !!serviceDate;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-800">Yeni Lastik İşlemi</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {["Araç & İşlem", "Setler"].map((label, i) => {
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
                  setVehicle(null);
                  setPlateNotFound(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePlateSearch()}
                placeholder="34ABC42"
                maxLength={10}
                className="flex-1 text-center text-xl font-black tracking-widest uppercase border-2 rounded-xl py-3 px-4 outline-none transition-colors font-mono"
                style={{
                  borderColor: vehicle ? "#86efac" : plateNotFound ? "#dc2626" : "#e5e7eb",
                }}
                autoFocus
              />
              <button
                onClick={handlePlateSearch}
                disabled={!plateInput || searching}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-white disabled:opacity-50 shrink-0"
                style={{ background: "#f97316" }}
              >
                <Search size={18} /> {searching ? "Aranıyor" : "Ara"}
              </button>
            </div>

            {vehicle && (
              <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <span className="text-green-600 font-bold text-xs">✓</span>
                <span className="text-green-700 text-xs font-semibold">
                  {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Araç bulundu"}
                  {vehicle.ownerName && ` · ${vehicle.ownerName}`}
                </span>
              </div>
            )}
            {plateNotFound && (
              <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <p className="text-red-700 text-xs font-semibold">Bu plakaya ait araç bulunamadı.</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              İşlem Tipi *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["seasonal_change", "Sezon Değişimi"],
                  ["store", "Depoya Teslim"],
                  ["retrieve", "Depodan Teslim Alma"],
                  ["new_install", "Yeni Lastik Takma"],
                ] as const
              ).map(([value, label]) => {
                const active = operationType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setOperationType(value)}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Servis Tarihi *
              </label>
              <input
                type="datetime-local"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">KM</label>
              <input
                type="number"
                value={kmAtService}
                onChange={(e) => setKmAtService(e.target.value)}
                placeholder="150000"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Sipariş No
              </label>
              <input
                type="text"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder="L-2026-001"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </div>
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
        <div className="flex flex-col gap-4">
          {loadingSets && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center text-gray-400 text-sm">
              Setler yükleniyor...
            </div>
          )}

          {/* Sökülen set */}
          {needsRemoved && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3">
                Sökülen Set <span className="text-red-500">(araçtan)</span>
              </h3>
              <SetPicker
                sets={onVehicleSets}
                selectedId={removedTireSetId}
                onSelect={setRemovedTireSetId}
                emptyText="Bu araçta takılı set yok. Önce 'Yeni Set' ile araçta olarak ekleyin."
              />
            </div>
          )}

          {/* Konum */}
          {needsLocation && removedTireSetId !== null && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3">Sökülenin Yerleştirileceği Konum</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Bölge</label>
                  <input
                    type="text"
                    value={removedToZone}
                    onChange={(e) => setRemovedToZone(e.target.value)}
                    placeholder="A"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 text-center font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Sıra</label>
                  <input
                    type="text"
                    value={removedToRow}
                    onChange={(e) => setRemovedToRow(e.target.value)}
                    placeholder="12"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 text-center font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Slot</label>
                  <input
                    type="text"
                    value={removedToSlot}
                    onChange={(e) => setRemovedToSlot(e.target.value)}
                    placeholder="3"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 text-center font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Takılan set */}
          {needsInstalled && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3">
                Takılan Set <span className="text-green-600">(depodan/yeni)</span>
              </h3>
              <SetPicker
                sets={inStorageSets}
                selectedId={installedTireSetId}
                onSelect={setInstalledTireSetId}
                emptyText="Bu araç için depoda set yok. Önce 'Yeni Set' ile depoda olarak ekleyin."
              />
            </div>
          )}

          {/* Notlar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Notlar
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Açıklama..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
            />
          </div>

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
              disabled={saving || !canSave}
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

function SetPicker({
  sets,
  selectedId,
  onSelect,
  emptyText,
}: {
  sets: SetSummary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  emptyText: string;
}) {
  if (sets.length === 0) {
    return <p className="text-xs text-gray-400 italic">{emptyText}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {sets.map((s) => {
        const active = selectedId === s.id;
        const seasonStyle = SEASON_BADGE[s.season];
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className="text-left rounded-xl px-3 py-2.5 border-2 transition-all"
            style={{
              borderColor: active ? "#f97316" : "#e5e7eb",
              background: active ? "#fff7ed" : "#fff",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-800">{setLabel(s)}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {STATUS_LABEL[s.status]}
                  {s.status === "in_storage" &&
                    ` · ${formatLocation(s.zoneCode, s.rowCode, s.slotCode)}`}
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: seasonStyle.bg, color: seasonStyle.color }}
              >
                {SEASON_LABEL[s.season]}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
