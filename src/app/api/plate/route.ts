import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles, alignmentRecords, primaryAngles, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const plate = req.nextUrl.searchParams.get("plate")?.toUpperCase().replace(/\s/g, "");

  if (!plate) {
    return NextResponse.json({ error: "Plaka gerekli" }, { status: 400 });
  }

  const vehicle = db.select().from(vehicles).where(eq(vehicles.plate, plate)).get();

  if (!vehicle) {
    return NextResponse.json({ error: "Bu plakaya ait araç bulunamadı" }, { status: 404 });
  }

  const record = db
    .select()
    .from(alignmentRecords)
    .innerJoin(primaryAngles, eq(primaryAngles.recordId, alignmentRecords.id))
    .leftJoin(users, eq(alignmentRecords.technicianId, users.id))
    .where(eq(alignmentRecords.vehicleId, vehicle.id))
    .orderBy(desc(alignmentRecords.serviceDate), desc(alignmentRecords.id))
    .get();

  if (!record) {
    return NextResponse.json({ error: "Bu araç için ölçüm kaydı bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({
    vehicle,
    record: record.alignment_records,
    technician: record.users ? { fullName: record.users.fullName } : null,
    primaryAngles: record.primary_angles,
  });
}
