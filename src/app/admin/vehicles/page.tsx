import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { desc } from "drizzle-orm";
import NewVehicleForm from "./NewVehicleForm";
import VehicleList from "./VehicleList";

export default function VehiclesPage() {
  const all = db.select({
    id: vehicles.id,
    plate: vehicles.plate,
    make: vehicles.make,
    model: vehicles.model,
    ownerName: vehicles.ownerName,
    ownerPhone: vehicles.ownerPhone,
  }).from(vehicles).orderBy(desc(vehicles.createdAt)).all();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-gray-800">Araçlar</h1>
        <NewVehicleForm />
      </div>

      <VehicleList vehicles={all} />
    </div>
  );
}
