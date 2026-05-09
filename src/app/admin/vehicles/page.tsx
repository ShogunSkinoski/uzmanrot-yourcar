"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

type Vehicle = {
  id: number; plate: string; make: string | null; model: string | null;
  yearFrom: number | null; yearTo: number | null; km: number | null;
  ownerName: string | null; ownerPhone: string | null;
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plate: "", make: "", model: "", yearFrom: "", yearTo: "", km: "", ownerName: "", ownerPhone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/vehicles").then((r) => r.json()).then(setVehicles);
  }, []);

  function setField(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) {
      const newV = await res.json();
      setVehicles((prev) => [newV, ...prev]);
      setForm({ plate: "", make: "", model: "", yearFrom: "", yearTo: "", km: "", ownerName: "", ownerPhone: "" });
      setShowForm(false);
    } else {
      const data = await res.json();
      setError(data.error ?? "Hata oluştu");
    }
  }

  const fields: { key: keyof typeof form; label: string; placeholder: string }[] = [
    { key: "plate", label: "Plaka *", placeholder: "42ABC42" },
    { key: "make", label: "Marka", placeholder: "FORD" },
    { key: "model", label: "Model", placeholder: "S-MAX" },
    { key: "yearFrom", label: "Yıl (dan)", placeholder: "2006" },
    { key: "yearTo", label: "Yıl (a)", placeholder: "2013" },
    { key: "km", label: "KM", placeholder: "150000" },
    { key: "ownerName", label: "Araç Sahibi", placeholder: "Opsiyonel" },
    { key: "ownerPhone", label: "Telefon", placeholder: "0532 000 0000" },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-gray-800">Araçlar</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "#f97316" }}>
          <Plus size={16} /> Yeni Araç
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
          <h2 className="font-bold text-gray-700 text-sm mb-4">Yeni Araç Ekle</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
            {fields.map(({ key, label, placeholder }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  required={label.includes("*")}
                  placeholder={placeholder}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                />
              </div>
            ))}
            {error && <div className="col-span-2 text-sm text-red-500 bg-red-50 rounded-lg py-2 px-3 text-center">{error}</div>}
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100">İptal</button>
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "#f97316" }}>
                {saving ? "Ekleniyor..." : "Ekle"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {vehicles.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">Henüz araç yok.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-black font-mono text-gray-800 text-sm">{v.plate}</span>
                  <span className="text-gray-400 text-xs ml-2">{[v.make, v.model, v.yearFrom ? `${v.yearFrom}${v.yearTo ? `–${v.yearTo}` : ""}` : null].filter(Boolean).join(" ") || "—"}</span>
                  {v.ownerName && <div className="text-xs text-gray-400 mt-0.5">{v.ownerName}{v.ownerPhone ? ` · ${v.ownerPhone}` : ""}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
