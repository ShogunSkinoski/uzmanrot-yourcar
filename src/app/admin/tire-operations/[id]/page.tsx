import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { tireOperations, tireSets, vehicles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import {
  OPERATION_LABEL,
  SEASON_LABEL,
  formatLocation,
} from "@/lib/tires";

export default async function TireOperationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opId = parseInt(id);

  const op = db.select().from(tireOperations).where(eq(tireOperations.id, opId)).get();
  if (!op) notFound();

  const vehicle = db.select().from(vehicles).where(eq(vehicles.id, op.vehicleId)).get();
  const technician = db.select().from(users).where(eq(users.id, op.technicianId)).get();
  const removed = op.removedTireSetId
    ? db.select().from(tireSets).where(eq(tireSets.id, op.removedTireSetId)).get()
    : null;
  const installed = op.installedTireSetId
    ? db.select().from(tireSets).where(eq(tireSets.id, op.installedTireSetId)).get()
    : null;

  const vehicleLabel = [vehicle?.make, vehicle?.model].filter(Boolean).join(" ") || "—";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/tire-operations" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-gray-800">İşlem Detayı</h1>
      </div>

      {/* Genel bilgiler */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["İşlem Tipi", OPERATION_LABEL[op.operationType]],
            ["Tarih", op.serviceDate ? new Date(op.serviceDate).toLocaleString("tr-TR") : "—"],
            ["Plaka", vehicle?.plate ?? "—"],
            ["Araç", vehicleLabel],
            ["Araç Sahibi", vehicle?.ownerName ?? "—"],
            ["Teknisyen", technician?.fullName ?? "—"],
            ["Sipariş No", op.orderNo ?? "—"],
            ["KM", op.kmAtService?.toLocaleString("tr-TR") ?? "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-xs text-gray-400">{k}: </span>
              <span className="font-bold text-gray-800 text-xs">{v}</span>
            </div>
          ))}
        </div>
        {op.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Notlar: </span>
            <span className="text-xs text-gray-700">{op.notes}</span>
          </div>
        )}
      </div>

      {/* Sökülen */}
      {removed && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Sökülen Set</h3>
          <Link
            href={`/admin/tires/${removed.id}`}
            className="text-sm font-bold text-gray-800 hover:underline"
          >
            {SEASON_LABEL[removed.season]} ·{" "}
            {[removed.brand, removed.modelName].filter(Boolean).join(" ") || "—"}
            {removed.sizeText && (
              <span className="text-gray-400 font-mono ml-2">{removed.sizeText}</span>
            )}
          </Link>
          <div className="text-xs text-gray-400 mt-1">
            Yerleştirildiği konum:{" "}
            <span className="font-mono text-gray-700">
              {formatLocation(op.removedToZone, op.removedToRow, op.removedToSlot)}
            </span>
          </div>
        </div>
      )}

      {/* Takılan */}
      {installed && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Takılan Set</h3>
          <Link
            href={`/admin/tires/${installed.id}`}
            className="text-sm font-bold text-gray-800 hover:underline"
          >
            {SEASON_LABEL[installed.season]} ·{" "}
            {[installed.brand, installed.modelName].filter(Boolean).join(" ") || "—"}
            {installed.sizeText && (
              <span className="text-gray-400 font-mono ml-2">{installed.sizeText}</span>
            )}
          </Link>
        </div>
      )}
    </div>
  );
}
