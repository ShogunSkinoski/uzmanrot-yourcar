import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles, tireSets, tires } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const plate = req.nextUrl.searchParams.get("plate")?.toUpperCase().replace(/\s/g, "");
  if (!plate) return NextResponse.json({ error: "Plaka gerekli" }, { status: 400 });

  const vehicle = db.select().from(vehicles).where(eq(vehicles.plate, plate)).get();
  if (!vehicle) {
    return NextResponse.json({ error: "Bu plakaya ait araç bulunamadı" }, { status: 404 });
  }

  const sets = db
    .select()
    .from(tireSets)
    .where(eq(tireSets.vehicleId, vehicle.id))
    .orderBy(desc(tireSets.createdAt))
    .all();

  const allTires = db
    .select()
    .from(tires)
    .where(eq(tires.vehicleId, vehicle.id))
    .all();

  return NextResponse.json({
    vehicle: { plate: vehicle.plate, make: vehicle.make, model: vehicle.model },
    sets,
    tires: allTires,
  });
}
