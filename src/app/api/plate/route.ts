import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles, alignmentRecords, primaryAngles, secondaryAngles, users } from "@/db/schema";
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
    .leftJoin(users, eq(alignmentRecords.technicianId, users.id))
    .where(eq(alignmentRecords.vehicleId, vehicle.id))
    .orderBy(desc(alignmentRecords.serviceDate))
    .get();

  if (!record) {
    return NextResponse.json({ error: "Bu araç için kayıt bulunamadı" }, { status: 404 });
  }

  const primary = db
    .select()
    .from(primaryAngles)
    .where(eq(primaryAngles.recordId, record.alignment_records.id))
    .get();

  const secondary = db
    .select()
    .from(secondaryAngles)
    .where(eq(secondaryAngles.recordId, record.alignment_records.id))
    .get();

  return NextResponse.json({
    vehicle,
    record: record.alignment_records,
    technician: record.users ? { fullName: record.users.fullName } : null,
    primaryAngles: primary ?? null,
    secondaryAngles: secondary ?? null,
  });
}
