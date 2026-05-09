"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Search, X } from "lucide-react";

type Vehicle = {
  id: number;
  plate: string;
  make: string | null;
  model: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
};

export default function VehicleList({ vehicles }: { vehicles: Vehicle[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toUpperCase().replace(/\s/g, "");
    if (!q) return vehicles;
    return vehicles.filter((v) => v.plate.includes(q));
  }, [vehicles, query]);

  return (
    <>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase().replace(/\s/g, ""))}
          placeholder="Plakaya göre ara..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-mono outline-none focus:border-orange-400 transition-colors"
        />
        {query && (
          <button onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {vehicles.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">Henüz araç yok.</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">
            &ldquo;{query}&rdquo; ile eşleşen araç bulunamadı.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((v) => (
              <Link key={v.id} href={`/admin/vehicles/${v.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-black font-mono text-gray-800 text-sm">{v.plate}</span>
                  <span className="text-gray-400 text-xs ml-2">{[v.make, v.model].filter(Boolean).join(" ") || "—"}</span>
                  {v.ownerName && <div className="text-xs text-gray-400 mt-0.5">{v.ownerName}{v.ownerPhone ? ` · ${v.ownerPhone}` : ""}</div>}
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
