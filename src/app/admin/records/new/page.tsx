"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, Search } from "lucide-react";
import { createRecord } from "./actions";

type VehicleFound = {
  plate: string; make: string | null; model: string | null;
  ownerName: string | null; ownerPhone: string | null; km: number | null;
};

type PrimaryData = Record<string, string>;
type ColorStatus = "red" | "yellow" | "green";
type ColorMap = Record<string, ColorStatus>;

const COLOR_STYLES: Record<ColorStatus, { border: string; bg: string; dot: string }> = {
  red:    { border: "#fca5a5", bg: "#fff5f5", dot: "#dc2626" },
  yellow: { border: "#fcd34d", bg: "#fffbeb", dot: "#f59e0b" },
  green:  { border: "#86efac", bg: "#f0fdf4", dot: "#16a34a" },
};

// ─── Reusable field components ───────────────────────────────────────────────

function ColorFieldInput({
  name, value, onChange, color, onColorChange, unit = "", placeholder,
}: {
  name: string; value: string; onChange: (name: string, v: string) => void;
  color: ColorStatus | undefined; onColorChange: (name: string, c: ColorStatus | undefined) => void;
  unit?: string; placeholder?: string;
}) {
  const style = color ? COLOR_STYLES[color] : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder ?? "0.00"}
          className="w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition-colors font-mono"
          style={{
            borderColor: style?.border ?? "#e5e7eb",
            background: style?.bg ?? "#fff",
          }}
        />
        {unit && <span className="text-xs text-gray-400 shrink-0">{unit}</span>}
      </div>
      <div className="flex items-center gap-1">
        {(["red", "yellow", "green"] as const).map((c) => {
          const active = color === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onColorChange(name, active ? undefined : c)}
              className="w-5 h-5 rounded-full border-2 transition-all"
              style={{
                background: COLOR_STYLES[c].dot,
                borderColor: active ? "#1f2937" : "transparent",
                opacity: active ? 1 : 0.55,
              }}
              aria-label={c}
            />
          );
        })}
      </div>
    </div>
  );
}

function AngleGrid({ title, fields, data, onChange, colors, onColorChange }: {
  title: string;
  fields: { label: string; initialKey: string; finalKey: string; unit?: string }[];
  data: PrimaryData;
  onChange: (name: string, v: string) => void;
  colors: ColorMap;
  onColorChange: (name: string, c: ColorStatus | undefined) => void;
}) {
  return (
    <div className="mb-4">
      <div className="text-xs font-bold uppercase tracking-wide text-white px-3 py-2 rounded-t-lg" style={{ background: "#1f2937" }}>
        {title}
      </div>
      <div className="border border-gray-100 border-t-0 rounded-b-lg overflow-hidden">
        <div className="grid px-3 py-1.5 bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <span className="text-xs font-semibold text-gray-400">Ölçüm</span>
          <span className="text-xs font-semibold text-gray-400 text-center">İlk</span>
          <span className="text-xs font-semibold text-gray-400 text-center">Son</span>
        </div>
        {fields.map((f) => (
          <div key={f.initialKey} className="grid gap-2 px-3 py-2 border-b border-gray-50 last:border-0" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <span className="text-xs font-semibold text-gray-700 flex items-center">{f.label}</span>
            <ColorFieldInput
              name={f.initialKey}
              value={data[f.initialKey] ?? ""}
              onChange={onChange}
              color={colors[f.initialKey]}
              onColorChange={onColorChange}
              unit={f.unit}
            />
            <ColorFieldInput
              name={f.finalKey}
              value={data[f.finalKey] ?? ""}
              onChange={onChange}
              color={colors[f.finalKey]}
              onColorChange={onColorChange}
              unit={f.unit}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewRecordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 — Araç
  const [plateInput, setPlateInput] = useState("");
  const [vehicleFound, setVehicleFound] = useState<VehicleFound | null>(null);
  const [plateNotFound, setPlateNotFound] = useState(false);
  const [searching, setSearching] = useState(false);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0, 16));
  const [kmAtService, setKmAtService] = useState("");
  const [orderNo, setOrderNo] = useState("");

  // Step 2
  const [primary, setPrimary] = useState<PrimaryData>({});
  const [colors, setColors] = useState<ColorMap>({});
  const [saving, setSaving] = useState(false);

  // ── Plate lookup ────────────────────────────────────────────────────────────
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
      setMake(data.vehicle.make ?? "");
      setModel(data.vehicle.model ?? "");
      setOwnerName(data.vehicle.ownerName ?? "");
      setOwnerPhone(data.vehicle.ownerPhone ?? "");
    } else {
      setPlateNotFound(true);
    }
  }

  function setPrimaryField(name: string, v: string) { setPrimary((p) => ({ ...p, [name]: v })); }

  function setColor(name: string, c: ColorStatus | undefined) {
    setColors((prev) => {
      const next = { ...prev };
      if (c) next[name] = c; else delete next[name];
      return next;
    });
  }

  function toNum(v: string | undefined) {
    if (!v) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  const [saveError, setSaveError] = useState("");

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    const primaryPayload: Record<string, number | null> = {};
    Object.entries(primary).forEach(([k, v]) => { primaryPayload[k] = toNum(v); });

    const result = await createRecord({
      plate: plateInput.toUpperCase().replace(/\s/g, ""),
      make: make || null,
      model: model || null,
      ownerName: ownerName || null,
      ownerPhone: ownerPhone || null,
      serviceDate,
      kmAtService: kmAtService || null,
      orderNo: orderNo || null,
      primary: primaryPayload,
      colors,
    });

    setSaving(false);
    if (result.ok) {
      router.push(`/admin/records/${result.id}`);
    } else {
      setSaveError(result.error);
    }
  }

  const plate = plateInput.toUpperCase().replace(/\s/g, "");
  const canGoToStep2 = !!plate && !!serviceDate && (vehicleFound !== null || plateNotFound);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-800">Yeni Kayıt</h1>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-6">
        {["Araç", "Birincil Açılar"].map((label, i) => {
          const s = i + 1;
          const active = step === s;
          const done = step > s;
          return (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: done ? "#16a34a" : active ? "#f97316" : "#e5e7eb", color: done || active ? "#fff" : "#9ca3af" }}>
                  {done ? <Check size={12} /> : s}
                </div>
                <span className="text-xs font-semibold hidden sm:block" style={{ color: active ? "#f97316" : "#9ca3af" }}>{label}</span>
              </div>
              {s < 2 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: Araç ─────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">

          {/* Plaka */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Plaka *</label>
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
                style={{ borderColor: vehicleFound ? "#86efac" : plateNotFound ? "#f97316" : "#e5e7eb" }}
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
                  Mevcut araç: {[vehicleFound.make, vehicleFound.model].filter(Boolean).join(" ") || "Bilinmiyor"}
                  {vehicleFound.ownerName && ` · ${vehicleFound.ownerName}`}
                </span>
              </div>
            )}
            {plateNotFound && (
              <div className="mt-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                <p className="text-orange-700 text-xs font-semibold">Yeni araç — bilgiler opsiyonel</p>
              </div>
            )}
          </div>

          {/* Araç Bilgileri */}
          {(vehicleFound !== null || plateNotFound) && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "make", label: "Marka", value: make, set: setMake, placeholder: "FORD" },
                  { key: "model", label: "Model", value: model, set: setModel, placeholder: "S-MAX" },
                  { key: "ownerName", label: "Sahip Adı", value: ownerName, set: setOwnerName, placeholder: "Opsiyonel" },
                  { key: "ownerPhone", label: "Telefon", value: ownerPhone, set: setOwnerPhone, placeholder: "05050010816" },
                ].map(({ key, label, value, set, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="h-px bg-gray-100" />

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Servis Tarihi *</label>
                  <input
                    type="datetime-local"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">KM</label>
                  <input type="number" value={kmAtService} onChange={(e) => setKmAtService(e.target.value)}
                    placeholder="150000" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sipariş No</label>
                  <input type="text" value={orderNo} onChange={(e) => setOrderNo(e.target.value)}
                    placeholder="2026-001" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button disabled={!canGoToStep2} onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "#f97316" }}>
              İleri <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Birincil Açılar ───────────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-0">
          <AngleGrid title="ÖN — KASTER" onChange={setPrimaryField} data={primary} colors={colors} onColorChange={setColor} fields={[
            { label: "Sol", initialKey: "frontCasterLeftInitial", finalKey: "frontCasterLeftFinal", unit: "°" },
            { label: "Sağ", initialKey: "frontCasterRightInitial", finalKey: "frontCasterRightFinal", unit: "°" },
          ]} />
          <AngleGrid title="ÖN — KAMBER" onChange={setPrimaryField} data={primary} colors={colors} onColorChange={setColor} fields={[
            { label: "Sol", initialKey: "frontCamberLeftInitial", finalKey: "frontCamberLeftFinal", unit: "°" },
            { label: "Sağ", initialKey: "frontCamberRightInitial", finalKey: "frontCamberRightFinal", unit: "°" },
          ]} />
          <AngleGrid title="ÖN — ROT (mm)" onChange={setPrimaryField} data={primary} colors={colors} onColorChange={setColor} fields={[
            { label: "Sol", initialKey: "frontToeLeftInitial", finalKey: "frontToeLeftFinal", unit: "mm" },
            { label: "Sağ", initialKey: "frontToeRightInitial", finalKey: "frontToeRightFinal", unit: "mm" },
            { label: "Toplam", initialKey: "frontToeTotalInitial", finalKey: "frontToeTotalFinal", unit: "mm" },
          ]} />
          <AngleGrid title="ARKA — KAMBER" onChange={setPrimaryField} data={primary} colors={colors} onColorChange={setColor} fields={[
            { label: "Sol", initialKey: "rearCamberLeftInitial", finalKey: "rearCamberLeftFinal", unit: "°" },
            { label: "Sağ", initialKey: "rearCamberRightInitial", finalKey: "rearCamberRightFinal", unit: "°" },
          ]} />
          <AngleGrid title="ARKA — ROT (mm)" onChange={setPrimaryField} data={primary} colors={colors} onColorChange={setColor} fields={[
            { label: "Sol", initialKey: "rearToeLeftInitial", finalKey: "rearToeLeftFinal", unit: "mm" },
            { label: "Sağ", initialKey: "rearToeRightInitial", finalKey: "rearToeRightFinal", unit: "mm" },
            { label: "Toplam", initialKey: "rearToeTotalInitial", finalKey: "rearToeTotalFinal", unit: "mm" },
          ]} />
          <AngleGrid title="ARKA — İTİŞ AÇISI" onChange={setPrimaryField} data={primary} colors={colors} onColorChange={setColor} fields={[
            { label: "İtiş Açısı", initialKey: "thrustAngleInitial", finalKey: "thrustAngleFinal", unit: "°" },
          ]} />

          {saveError && (
            <div className="mt-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <div className="flex justify-between mt-2">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors">
              <ChevronLeft size={16} /> Geri
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "#16a34a" }}>
              {saving ? "Kaydediliyor..." : <><Check size={16} /> Kaydet</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
