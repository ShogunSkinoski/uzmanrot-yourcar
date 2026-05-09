"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

type RecordRow = {
  id: number;
  orderNo: string | null;
  serviceDate: string | null;
  plate: string | null;
  make: string | null;
  model: string | null;
  ownerName: string | null;
  technicianName: string | null;
};

export default function RecordList({ records }: { records: RecordRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return records;
    const qPlate = q.replace(/\s/g, "");
    return records.filter((r) => {
      if (r.plate && r.plate.includes(qPlate)) return true;
      if (r.ownerName && r.ownerName.toUpperCase().includes(q)) return true;
      if (r.orderNo && r.orderNo.toUpperCase().includes(q)) return true;
      const vehicle = [r.make, r.model].filter(Boolean).join(" ").toUpperCase();
      if (vehicle.includes(q)) return true;
      if (r.technicianName && r.technicianName.toUpperCase().includes(q)) return true;
      return false;
    });
  }, [records, query]);

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-12 text-center text-gray-400 text-sm">
        Henüz kayıt yok.{" "}
        <Link href="/admin/records/new" style={{ color: "#f97316" }} className="font-semibold">
          İlk kaydı ekle →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Plaka, sahip, sipariş no, araç veya teknisyene göre ara..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-orange-400 transition-colors"
        />
        {query && (
          <button onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">
            &ldquo;{query}&rdquo; ile eşleşen kayıt bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Plaka", "Araç", "Araç Sahibi", "Tarih", "Teknisyen", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-black font-mono text-gray-800">{r.plate ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{[r.make, r.model].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.ownerName ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {r.serviceDate ? new Date(r.serviceDate).toLocaleDateString("tr-TR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.technicianName ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/records/${r.id}`} className="text-xs font-semibold" style={{ color: "#f97316" }}>
                        Detay →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
