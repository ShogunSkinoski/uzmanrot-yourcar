import Link from "next/link";
import { db } from "@/db";
import { alignmentRecords, vehicles, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import RecordList from "./RecordList";

export default function RecordsPage() {
  const rows = db
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

  const records = rows.map((r) => ({
    ...r,
    serviceDate: r.serviceDate ? r.serviceDate.toISOString() : null,
  }));

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

      <RecordList records={records} />
    </div>
  );
}
