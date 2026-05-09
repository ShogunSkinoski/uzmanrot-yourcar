import Link from "next/link";
import { db } from "@/db";
import { tireOperations, vehicles, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import TireOperationList from "./TireOperationList";

export default function TireOperationsPage() {
  const rows = db
    .select({
      id: tireOperations.id,
      operationType: tireOperations.operationType,
      serviceDate: tireOperations.serviceDate,
      orderNo: tireOperations.orderNo,
      kmAtService: tireOperations.kmAtService,
      plate: vehicles.plate,
      make: vehicles.make,
      model: vehicles.model,
      ownerName: vehicles.ownerName,
      technicianName: users.fullName,
    })
    .from(tireOperations)
    .leftJoin(vehicles, eq(tireOperations.vehicleId, vehicles.id))
    .leftJoin(users, eq(tireOperations.technicianId, users.id))
    .orderBy(desc(tireOperations.serviceDate))
    .all();

  const ops = rows.map((r) => ({
    ...r,
    serviceDate: r.serviceDate ? r.serviceDate.toISOString() : null,
  }));

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-gray-800">Lastik İşlemleri</h1>
        <Link
          href="/admin/tire-operations/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "#f97316" }}
        >
          <Plus size={16} /> Yeni İşlem
        </Link>
      </div>

      <TireOperationList ops={ops} />
    </div>
  );
}
