"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { OPERATION_LABEL, type TireOperationType } from "@/lib/tires";

type Row = {
  id: number;
  operationType: TireOperationType;
  serviceDate: string | null;
  orderNo: string | null;
  kmAtService: number | null;
  plate: string | null;
  make: string | null;
  model: string | null;
  ownerName: string | null;
  technicianName: string | null;
};

export default function TireOperationList({ ops }: { ops: Row[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | TireOperationType>("");

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    return ops.filter((r) => {
      if (typeFilter && r.operationType !== typeFilter) return false;
      if (!q) return true;
      const qPlate = q.replace(/\s/g, "");
      if (r.plate && r.plate.includes(qPlate)) return true;
      if (r.ownerName && r.ownerName.toUpperCase().includes(q)) return true;
      if (r.orderNo && r.orderNo.toUpperCase().includes(q)) return true;
      if (r.technicianName && r.technicianName.toUpperCase().includes(q)) return true;
      const veh = [r.make, r.model].filter(Boolean).join(" ").toUpperCase();
      if (veh.includes(q)) return true;
      return false;
    });
  }, [ops, query, typeFilter]);

  if (ops.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-12 text-center text-gray-400 text-sm">
        Henüz işlem yok.{" "}
        <Link href="/admin/tire-operations/new" style={{ color: "#f97316" }} className="font-semibold">
          İlk işlemi ekle →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Plaka, sahip, sipariş no..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-orange-400 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "" | TireOperationType)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-orange-400"
        >
          <option value="">Tüm işlemler</option>
          <option value="seasonal_change">Sezon Değişimi</option>
          <option value="store">Depoya Teslim</option>
          <option value="retrieve">Depodan Teslim Alma</option>
          <option value="new_install">Yeni Lastik Takma</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">Eşleşen işlem bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Plaka", "İşlem", "Tarih", "Sipariş No", "KM", "Teknisyen", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-black font-mono text-gray-800">{r.plate ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs font-semibold">
                      {OPERATION_LABEL[r.operationType]}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {r.serviceDate ? new Date(r.serviceDate).toLocaleString("tr-TR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.orderNo ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {r.kmAtService?.toLocaleString("tr-TR") ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.technicianName ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/tire-operations/${r.id}`}
                        className="text-xs font-semibold"
                        style={{ color: "#f97316" }}
                      >
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
