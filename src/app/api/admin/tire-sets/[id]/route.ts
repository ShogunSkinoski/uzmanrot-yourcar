import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tireSets, tires } from "@/db/schema";
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
  const setId = parseInt(id);
  const set = db.select().from(tireSets).where(eq(tireSets.id, setId)).get();
  if (!set) return NextResponse.json({ error: "Set bulunamadı" }, { status: 404 });

  const setTires = db.select().from(tires).where(eq(tires.tireSetId, setId)).all();
  return NextResponse.json({ set, tires: setTires });
}
