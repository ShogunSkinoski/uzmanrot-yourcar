import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tireOperations, vehicles, users } from "@/db/schema";
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

  const rows = db
    .select({
      id: tireOperations.id,
      operationType: tireOperations.operationType,
      serviceDate: tireOperations.serviceDate,
      orderNo: tireOperations.orderNo,
      kmAtService: tireOperations.kmAtService,
      plate: vehicles.plate,
      technicianName: users.fullName,
    })
    .from(tireOperations)
    .leftJoin(vehicles, eq(tireOperations.vehicleId, vehicles.id))
    .leftJoin(users, eq(tireOperations.technicianId, users.id))
    .orderBy(desc(tireOperations.serviceDate))
    .all();
  return NextResponse.json(rows);
}
