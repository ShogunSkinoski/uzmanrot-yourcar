"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createVehicle } from "./actions";

export default function NewVehicleForm() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plate: "", make: "", model: "", km: "", ownerName: "", ownerPhone: "" });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function setField(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createVehicle(form);
      if (result.ok) {
        setForm({ plate: "", make: "", model: "", km: "", ownerName: "", ownerPhone: "" });
        setShowForm(false);
      } else {
        setError(result.error);
      }
    });
  }

  const fields: { key: keyof typeof form; label: string; placeholder: string }[] = [
    { key: "plate", label: "Plaka *", placeholder: "42ABC42" },
    { key: "make", label: "Marka", placeholder: "FORD" },
    { key: "model", label: "Model", placeholder: "S-MAX" },
    { key: "km", label: "KM", placeholder: "150000" },
    { key: "ownerName", label: "Araç Sahibi", placeholder: "Opsiyonel" },
    { key: "ownerPhone", label: "Telefon", placeholder: "0532 000 0000" },
  ];

  return (
    <>
      <button onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
        style={{ background: "#f97316" }}>
        <Plus size={16} /> Yeni Araç
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl border border-gray-100 p-5 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
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
                <button type="submit" disabled={pending} className="px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "#f97316" }}>
                  {pending ? "Ekleniyor..." : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
