import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tireOperations } from "@/db/schema";
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
  const op = db.select().from(tireOperations).where(eq(tireOperations.id, parseInt(id))).get();
  if (!op) return NextResponse.json({ error: "İşlem bulunamadı" }, { status: 404 });
  return NextResponse.json(op);
}
