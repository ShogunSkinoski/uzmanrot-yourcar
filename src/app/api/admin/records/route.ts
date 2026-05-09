import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { alignmentRecords, primaryAngles, vehicles, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const records = db
    .select({
      id: alignmentRecords.id,
      orderNo: alignmentRecords.orderNo,
      serviceDate: alignmentRecords.serviceDate,
      kmAtService: alignmentRecords.kmAtService,
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

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const {
    plate, make, model, ownerName, ownerPhone,
    kmAtService, orderNo, serviceDate, notes, primary, colors,
  } = body;

  if (!plate || !serviceDate) {
    return NextResponse.json({ error: "Plaka ve servis tarihi gerekli" }, { status: 400 });
  }

  const normalizedPlate = plate.toUpperCase().replace(/\s/g, "");

  // Araç varsa bul, yoksa oluştur; ek bilgiler varsa güncelle
  let vehicle = db.select().from(vehicles).where(eq(vehicles.plate, normalizedPlate)).get();

  if (!vehicle) {
    vehicle = db
      .insert(vehicles)
      .values({
        plate: normalizedPlate,
        make: make || null,
        model: model || null,
        km: kmAtService ? parseInt(kmAtService) : null,
        ownerName: ownerName || null,
        ownerPhone: ownerPhone || null,
      })
      .returning()
      .get();
  } else if (ownerName || ownerPhone || make || model) {
    db.update(vehicles)
      .set({
        ownerName: ownerName || vehicle.ownerName,
        ownerPhone: ownerPhone || vehicle.ownerPhone,
        make: make || vehicle.make,
        model: model || vehicle.model,
      })
      .where(eq(vehicles.id, vehicle.id))
      .run();
  }

  const record = db
    .insert(alignmentRecords)
    .values({
      vehicleId: vehicle!.id,
      technicianId: session.userId,
      orderNo: orderNo || null,
      kmAtService: kmAtService ? parseInt(kmAtService) : null,
      serviceDate: new Date(serviceDate),
      notes: notes || null,
    })
    .returning()
    .get();

  if (primary) {
    db.insert(primaryAngles).values({
      recordId: record.id,
      ...primary,
      colors: colors && Object.keys(colors).length > 0 ? JSON.stringify(colors) : null,
    }).run();
  }

  return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
}
