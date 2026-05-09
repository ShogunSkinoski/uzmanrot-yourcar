"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import {
  SEASON_LABEL,
  STATUS_LABEL,
  formatLocation,
  type TireSeason,
  type TireStatus,
} from "@/lib/tires";

type SetRow = {
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
  createdAt: string | null;
  plate: string | null;
  make: string | null;
  model: string | null;
  ownerName: string | null;
};

const STATUS_BADGE: Record<TireStatus, { bg: string; color: string }> = {
  on_vehicle: { bg: "#dcfce7", color: "#166534" },
  in_storage: { bg: "#fef3c7", color: "#92400e" },
};

const SEASON_BADGE: Record<TireSeason, { bg: string; color: string }> = {
  summer: { bg: "#fef9c3", color: "#854d0e" },
  winter: { bg: "#dbeafe", color: "#1e40af" },
  all_season: { bg: "#f3e8ff", color: "#6b21a8" },
};

export default function TireSetList({ sets }: { sets: SetRow[] }) {
  const [query, setQuery] = useState("");
  const [seasonFilter, setSeasonFilter] = useState<"" | TireSeason>("");
  const [statusFilter, setStatusFilter] = useState<"" | TireStatus>("");

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    return sets.filter((s) => {
      if (seasonFilter && s.season !== seasonFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      if (!q) return true;
      const qPlate = q.replace(/\s/g, "");
      if (s.plate && s.plate.includes(qPlate)) return true;
      if (s.ownerName && s.ownerName.toUpperCase().includes(q)) return true;
      if (s.brand && s.brand.toUpperCase().includes(q)) return true;
      if (s.modelName && s.modelName.toUpperCase().includes(q)) return true;
      if (s.sizeText && s.sizeText.toUpperCase().includes(q)) return true;
      const veh = [s.make, s.model].filter(Boolean).join(" ").toUpperCase();
      if (veh.includes(q)) return true;
      return false;
    });
  }, [sets, query, seasonFilter, statusFilter]);

  if (sets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-12 text-center text-gray-400 text-sm">
        Henüz lastik seti yok.{" "}
        <Link href="/admin/tires/new" style={{ color: "#f97316" }} className="font-semibold">
          İlk seti ekle →
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
            placeholder="Plaka, sahip, marka, ebat..."
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
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value as "" | TireSeason)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-orange-400"
        >
          <option value="">Tüm sezonlar</option>
          <option value="summer">Yaz</option>
          <option value="winter">Kış</option>
          <option value="all_season">4 Mevsim</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | TireStatus)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-orange-400"
        >
          <option value="">Tüm durumlar</option>
          <option value="on_vehicle">Araçta</option>
          <option value="in_storage">Depoda</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">Eşleşen set bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Plaka", "Sezon", "Lastik", "Ebat", "Durum", "Konum", "KM", ""].map((h) => (
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
                {filtered.map((s) => {
                  const seasonStyle = SEASON_BADGE[s.season];
                  const statusStyle = STATUS_BADGE[s.status];
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-black font-mono text-gray-800">{s.plate ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: seasonStyle.bg, color: seasonStyle.color }}
                        >
                          {SEASON_LABEL[s.season]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-xs">
                        {[s.brand, s.modelName].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{s.sizeText ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                          {STATUS_LABEL[s.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                        {s.status === "in_storage" ? formatLocation(s.zoneCode, s.rowCode, s.slotCode) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono whitespace-nowrap">
                        {s.installedKm != null ? `↑ ${s.installedKm.toLocaleString("tr-TR")}` : "—"}
                        {s.removedKm != null && (
                          <>
                            <br />
                            <span className="text-gray-400">↓ {s.removedKm.toLocaleString("tr-TR")}</span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/tires/${s.id}`}
                          className="text-xs font-semibold"
                          style={{ color: "#f97316" }}
                        >
                          Detay →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
