import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
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

  const all = db.select().from(vehicles).orderBy(desc(vehicles.createdAt)).all();
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { plate, make, model, yearFrom, yearTo, km, ownerName, ownerPhone } = await req.json();
  if (!plate) return NextResponse.json({ error: "Plaka gerekli" }, { status: 400 });

  const normalizedPlate = plate.toUpperCase().replace(/\s/g, "");

  const existing = db.select().from(vehicles).where(eq(vehicles.plate, normalizedPlate)).get();
  if (existing) {
    return NextResponse.json({ error: "Bu plaka zaten kayıtlı" }, { status: 409 });
  }

  const vehicle = db
    .insert(vehicles)
    .values({
      plate: normalizedPlate,
      make: make || null,
      model: model || null,
      yearFrom: yearFrom ? parseInt(yearFrom) : null,
      yearTo: yearTo ? parseInt(yearTo) : null,
      km: km ? parseInt(km) : null,
      ownerName: ownerName || null,
      ownerPhone: ownerPhone || null,
    })
    .returning()
    .get();

  return NextResponse.json(vehicle, { status: 201 });
}
