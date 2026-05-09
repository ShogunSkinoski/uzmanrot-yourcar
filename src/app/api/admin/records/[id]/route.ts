import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { alignmentRecords, primaryAngles, secondaryAngles, vehicles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const recordId = parseInt(id);

  const row = db
    .select()
    .from(alignmentRecords)
    .leftJoin(vehicles, eq(alignmentRecords.vehicleId, vehicles.id))
    .leftJoin(users, eq(alignmentRecords.technicianId, users.id))
    .where(eq(alignmentRecords.id, recordId))
    .get();

  if (!row) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });

  const primary = db.select().from(primaryAngles).where(eq(primaryAngles.recordId, recordId)).get();
  const secondary = db.select().from(secondaryAngles).where(eq(secondaryAngles.recordId, recordId)).get();

  return NextResponse.json({
    record: row.alignment_records,
    vehicle: row.vehicles,
    technician: row.users,
    primaryAngles: primary ?? null,
    secondaryAngles: secondary ?? null,
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { id } = await params;
  const recordId = parseInt(id);

  db.delete(primaryAngles).where(eq(primaryAngles.recordId, recordId)).run();
  db.delete(secondaryAngles).where(eq(secondaryAngles.recordId, recordId)).run();
  db.delete(alignmentRecords).where(eq(alignmentRecords.id, recordId)).run();

  return NextResponse.json({ ok: true });
}
