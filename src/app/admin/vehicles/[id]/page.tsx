import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { vehicles, alignmentRecords, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicleId = parseInt(id);

  const vehicle = db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).get();
  if (!vehicle) notFound();

  const records = db
    .select({
      id: alignmentRecords.id,
      orderNo: alignmentRecords.orderNo,
      serviceDate: alignmentRecords.serviceDate,
      kmAtService: alignmentRecords.kmAtService,
      technicianName: users.fullName,
    })
    .from(alignmentRecords)
    .leftJoin(users, eq(alignmentRecords.technicianId, users.id))
    .where(eq(alignmentRecords.vehicleId, vehicleId))
    .orderBy(desc(alignmentRecords.serviceDate))
    .all();

  const vehicleLabel = [vehicle.make, vehicle.model].filter(Boolean).join(" ") || "—";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/vehicles" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-gray-800">Araç Detayı</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-black font-mono text-gray-800 text-lg">{vehicle.plate}</span>
            <span className="text-gray-400 text-sm ml-2">{vehicleLabel}</span>
          </div>
          <Link href="/admin/records/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: "#f97316" }}>
            <Plus size={14} /> Yeni Kayıt
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Araç Sahibi", vehicle.ownerName ?? "—"],
            ["Telefon", vehicle.ownerPhone ?? "—"],
            ["KM", vehicle.km?.toLocaleString("tr-TR") ?? "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-xs text-gray-400">{k}: </span>
              <span className="font-bold text-gray-800 text-xs">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-sm font-bold text-gray-700 mb-3 px-1">
        Geçmiş İşlemler <span className="text-gray-400 font-semibold">({records.length})</span>
      </h2>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {records.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">
            Bu araç için henüz işlem kaydı yok.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map((r) => (
              <Link key={r.id} href={`/admin/records/${r.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="text-sm font-bold text-gray-800">
                    {r.serviceDate ? new Date(r.serviceDate).toLocaleString("tr-TR") : "—"}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {r.technicianName ?? "—"}
                    {r.orderNo ? ` · Sipariş: ${r.orderNo}` : ""}
                    {r.kmAtService ? ` · ${r.kmAtService.toLocaleString("tr-TR")} km` : ""}
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
