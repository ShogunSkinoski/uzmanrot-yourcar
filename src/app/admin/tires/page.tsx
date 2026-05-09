import Link from "next/link";
import { db } from "@/db";
import { tireSets, vehicles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import TireSetList from "./TireSetList";

export default function TiresPage() {
  const rows = db
    .select({
      id: tireSets.id,
      season: tireSets.season,
      brand: tireSets.brand,
      modelName: tireSets.modelName,
      sizeText: tireSets.sizeText,
      status: tireSets.status,
      zoneCode: tireSets.zoneCode,
      rowCode: tireSets.rowCode,
      slotCode: tireSets.slotCode,
      installedKm: tireSets.installedKm,
      removedKm: tireSets.removedKm,
      createdAt: tireSets.createdAt,
      plate: vehicles.plate,
      make: vehicles.make,
      model: vehicles.model,
      ownerName: vehicles.ownerName,
    })
    .from(tireSets)
    .leftJoin(vehicles, eq(tireSets.vehicleId, vehicles.id))
    .orderBy(desc(tireSets.createdAt))
    .all();

  const sets = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt ? r.createdAt.toISOString() : null,
  }));

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-gray-800">Lastikler</h1>
        <Link
          href="/admin/tires/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "#f97316" }}
        >
          <Plus size={16} /> Yeni Set
        </Link>
      </div>

      <TireSetList sets={sets} />
    </div>
  );
}
