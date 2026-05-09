import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tireSets } from "@/db/schema";
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

  const vehicleIdParam = req.nextUrl.searchParams.get("vehicleId");
  const query = db.select().from(tireSets);
  const rows = vehicleIdParam
    ? query.where(eq(tireSets.vehicleId, parseInt(vehicleIdParam))).orderBy(desc(tireSets.createdAt)).all()
    : query.orderBy(desc(tireSets.createdAt)).all();
  return NextResponse.json(rows);
}
