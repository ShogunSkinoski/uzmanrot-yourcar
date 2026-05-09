import Link from "next/link";
import { db } from "@/db";
import { alignmentRecords, vehicles, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Plus } from "lucide-react";

export default function RecordsPage() {
  const records = db
    .select({
      id: alignmentRecords.id,
      orderNo: alignmentRecords.orderNo,
      serviceDate: alignmentRecords.serviceDate,
      plate: vehicles.plate,
      make: vehicles.make,
      model: vehicles.model,
      ownerName: vehicles.ownerName,
      technicianName: users.fullName,
    })
    .from(alignmentRecords)
    .leftJoin(vehicles, eq(alignmentRecords.vehicleId, vehicles.id))
    .leftJoin(users, eq(alignmentRecords.technicianId, users.id))
    .orderBy(desc(alignmentRecords.serviceDate))
    .all();

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-gray-800">Kayıtlar</h1>
        <Link
          href="/admin/records/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "#f97316" }}
        >
          <Plus size={16} /> Yeni Kayıt
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {records.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">
            Henüz kayıt yok.{" "}
            <Link href="/admin/records/new" style={{ color: "#f97316" }} className="font-semibold">
              İlk kaydı ekle →
            </Link>
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
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-black font-mono text-gray-800">{r.plate}</td>
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
    </div>
  );
}
