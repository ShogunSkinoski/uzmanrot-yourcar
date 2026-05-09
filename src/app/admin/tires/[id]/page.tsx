import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { tireSets, tires, vehicles, tireOperations, users } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import {
  SEASON_LABEL,
  STATUS_LABEL,
  POSITION_LABEL,
  OPERATION_LABEL,
  formatLocation,
} from "@/lib/tires";
import EditTireSet from "./EditTireSet";

export default async function TireSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const setId = parseInt(id);

  const set = db.select().from(tireSets).where(eq(tireSets.id, setId)).get();
  if (!set) notFound();

  const vehicle = db.select().from(vehicles).where(eq(vehicles.id, set.vehicleId)).get();

  const setTires = db
    .select()
    .from(tires)
    .where(eq(tires.tireSetId, setId))
    .all();

  const ops = db
    .select({
      id: tireOperations.id,
      operationType: tireOperations.operationType,
      serviceDate: tireOperations.serviceDate,
      removedTireSetId: tireOperations.removedTireSetId,
      installedTireSetId: tireOperations.installedTireSetId,
      technicianName: users.fullName,
    })
    .from(tireOperations)
    .leftJoin(users, eq(tireOperations.technicianId, users.id))
    .where(
      or(
        eq(tireOperations.removedTireSetId, setId),
        eq(tireOperations.installedTireSetId, setId),
      ),
    )
    .orderBy(desc(tireOperations.serviceDate))
    .all();

  const vehicleLabel = [vehicle?.make, vehicle?.model].filter(Boolean).join(" ") || "—";

  const positionOrder = ["FL", "FR", "RL", "RR", "spare"];
  const sortedTires = [...setTires].sort(
    (a, b) =>
      positionOrder.indexOf(a.position ?? "spare") - positionOrder.indexOf(b.position ?? "spare"),
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/tires" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-gray-800">Lastik Seti Detayı</h1>
      </div>

      {/* Araç kartı */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={vehicle ? `/admin/vehicles/${vehicle.id}` : "#"}
              className="font-black font-mono text-gray-800 text-lg hover:underline"
            >
              {vehicle?.plate ?? "—"}
            </Link>
            <span className="text-gray-400 text-sm ml-2">{vehicleLabel}</span>
            {vehicle?.ownerName && (
              <div className="text-xs text-gray-400 mt-0.5">{vehicle.ownerName}</div>
            )}
          </div>
        </div>
      </div>

      {/* Set bilgileri + düzenleme */}
      <EditTireSet
        set={{
          id: set.id,
          season: set.season,
          brand: set.brand,
          modelName: set.modelName,
          sizeText: set.sizeText,
          status: set.status,
          zoneCode: set.zoneCode,
          rowCode: set.rowCode,
          slotCode: set.slotCode,
          installedKm: set.installedKm,
          removedKm: set.removedKm,
          notes: set.notes,
        }}
      />

      {/* Set özeti (read-only) */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Sezon", SEASON_LABEL[set.season]],
            ["Durum", STATUS_LABEL[set.status]],
            ["Marka / Model", [set.brand, set.modelName].filter(Boolean).join(" ") || "—"],
            ["Ebat", set.sizeText ?? "—"],
            [
              "Konum",
              set.status === "in_storage"
                ? formatLocation(set.zoneCode, set.rowCode, set.slotCode)
                : "Araçta",
            ],
            [
              "Takılma KM",
              set.installedKm != null ? `${set.installedKm.toLocaleString("tr-TR")} km` : "—",
            ],
            [
              "Sökülme KM",
              set.removedKm != null ? `${set.removedKm.toLocaleString("tr-TR")} km` : "—",
            ],
            [
              "Eklenme",
              set.createdAt ? new Date(set.createdAt).toLocaleDateString("tr-TR") : "—",
            ],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-xs text-gray-400">{k}: </span>
              <span className="font-bold text-gray-800 text-xs">{v}</span>
            </div>
          ))}
        </div>
        {set.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Notlar: </span>
            <span className="text-xs text-gray-700">{set.notes}</span>
          </div>
        )}
      </div>

      {/* Lastikler */}
      <h2 className="text-sm font-bold text-gray-700 mb-3 px-1">
        Lastikler <span className="text-gray-400 font-semibold">({sortedTires.length})</span>
      </h2>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-5">
        {sortedTires.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">
            Bu sete bağlı lastik kaydı yok.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sortedTires.map((t) => (
              <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-800">
                    {t.position ? POSITION_LABEL[t.position] : "—"}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 font-mono">
                    {t.sizeText ?? "—"} ·{" "}
                    {[t.brand, t.modelName].filter(Boolean).join(" ") || "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* İşlem geçmişi */}
      <h2 className="text-sm font-bold text-gray-700 mb-3 px-1">
        İşlem Geçmişi <span className="text-gray-400 font-semibold">({ops.length})</span>
      </h2>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {ops.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">İşlem yok.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {ops.map((op) => (
              <Link
                key={op.id}
                href={`/admin/tire-operations/${op.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-bold text-gray-800">
                    {OPERATION_LABEL[op.operationType]}
                    {op.removedTireSetId === setId && (
                      <span className="ml-2 text-xs font-semibold text-red-600">söküldü</span>
                    )}
                    {op.installedTireSetId === setId && (
                      <span className="ml-2 text-xs font-semibold text-green-600">takıldı</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {op.serviceDate ? new Date(op.serviceDate).toLocaleString("tr-TR") : "—"}
                    {op.technicianName ? ` · ${op.technicianName}` : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
