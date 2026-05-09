import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { vehicles, alignmentRecords, users, tireSets, tireOperations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  SEASON_LABEL,
  STATUS_LABEL,
  OPERATION_LABEL,
  formatLocation,
} from "@/lib/tires";

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

  const vehicleTireSets = db
    .select()
    .from(tireSets)
    .where(eq(tireSets.vehicleId, vehicleId))
    .orderBy(desc(tireSets.createdAt))
    .all();

  const vehicleTireOps = db
    .select({
      id: tireOperations.id,
      operationType: tireOperations.operationType,
      serviceDate: tireOperations.serviceDate,
      orderNo: tireOperations.orderNo,
      technicianName: users.fullName,
    })
    .from(tireOperations)
    .leftJoin(users, eq(tireOperations.technicianId, users.id))
    .where(eq(tireOperations.vehicleId, vehicleId))
    .orderBy(desc(tireOperations.serviceDate))
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
        Rot/Balans Kayıtları <span className="text-gray-400 font-semibold">({records.length})</span>
      </h2>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
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

      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-bold text-gray-700">
          Lastikler <span className="text-gray-400 font-semibold">({vehicleTireSets.length})</span>
        </h2>
        <Link href="/admin/tires/new"
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white"
          style={{ background: "#f97316" }}>
          <Plus size={12} /> Yeni Set
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        {vehicleTireSets.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">
            Bu araç için lastik kaydı yok.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {vehicleTireSets.map((s) => (
              <Link key={s.id} href={`/admin/tires/${s.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="text-sm font-bold text-gray-800">
                    {SEASON_LABEL[s.season]}
                    <span className="ml-2 text-xs font-semibold" style={{
                      color: s.status === "on_vehicle" ? "#16a34a" : "#92400e",
                    }}>
                      ({STATUS_LABEL[s.status]})
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 font-mono">
                    {[s.brand, s.modelName].filter(Boolean).join(" ") || "—"}
                    {s.sizeText ? ` · ${s.sizeText}` : ""}
                    {s.status === "in_storage" &&
                      ` · ${formatLocation(s.zoneCode, s.rowCode, s.slotCode)}`}
                  </div>
                  {(s.installedKm != null || s.removedKm != null) && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {s.installedKm != null && (
                        <>Takıldı: <span className="font-mono font-semibold">{s.installedKm.toLocaleString("tr-TR")} km</span></>
                      )}
                      {s.installedKm != null && s.removedKm != null && " · "}
                      {s.removedKm != null && (
                        <>Söküldü: <span className="font-mono font-semibold">{s.removedKm.toLocaleString("tr-TR")} km</span></>
                      )}
                    </div>
                  )}
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-bold text-gray-700">
          Lastik İşlemleri <span className="text-gray-400 font-semibold">({vehicleTireOps.length})</span>
        </h2>
        <Link href="/admin/tire-operations/new"
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white"
          style={{ background: "#f97316" }}>
          <Plus size={12} /> Yeni İşlem
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {vehicleTireOps.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">
            Bu araç için lastik işlemi yok.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {vehicleTireOps.map((o) => (
              <Link key={o.id} href={`/admin/tire-operations/${o.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="text-sm font-bold text-gray-800">
                    {OPERATION_LABEL[o.operationType]}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {o.serviceDate ? new Date(o.serviceDate).toLocaleString("tr-TR") : "—"}
                    {o.technicianName ? ` · ${o.technicianName}` : ""}
                    {o.orderNo ? ` · ${o.orderNo}` : ""}
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
