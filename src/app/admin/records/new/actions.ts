"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { alignmentRecords, primaryAngles, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type ColorStatus = "red" | "yellow" | "green";

export async function createRecord(input: {
  plate: string;
  make: string | null;
  model: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  serviceDate: string;
  kmAtService: string | null;
  orderNo: string | null;
  primary: Record<string, number | null>;
  colors: Record<string, ColorStatus>;
}): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  console.log("[createRecord] token present:", !!token);
  if (!token) return { ok: false, error: "Yetkisiz (token yok)" };
  const session = await verifyToken(token);
  console.log("[createRecord] session:", session ? `userId=${session.userId}` : "null");
  if (!session) return { ok: false, error: "Yetkisiz (token geçersiz)" };

  if (!input.plate || !input.serviceDate) {
    return { ok: false, error: "Plaka ve servis tarihi gerekli" };
  }

  try {
    const normalizedPlate = input.plate.toUpperCase().replace(/\s/g, "");

    let vehicle = db.select().from(vehicles).where(eq(vehicles.plate, normalizedPlate)).get();

    if (!vehicle) {
      vehicle = db.insert(vehicles).values({
        plate: normalizedPlate,
        make: input.make,
        model: input.model,
        km: input.kmAtService ? parseInt(input.kmAtService) : null,
        ownerName: input.ownerName,
        ownerPhone: input.ownerPhone,
      }).returning().get();
    } else if (input.ownerName || input.ownerPhone || input.make || input.model) {
      db.update(vehicles).set({
        ownerName: input.ownerName ?? vehicle.ownerName,
        ownerPhone: input.ownerPhone ?? vehicle.ownerPhone,
        make: input.make ?? vehicle.make,
        model: input.model ?? vehicle.model,
      }).where(eq(vehicles.id, vehicle.id)).run();
    }

    const record = db.insert(alignmentRecords).values({
      vehicleId: vehicle!.id,
      technicianId: session.userId,
      orderNo: input.orderNo,
      kmAtService: input.kmAtService ? parseInt(input.kmAtService) : null,
      serviceDate: new Date(input.serviceDate),
      notes: null,
    }).returning().get();

    console.log("[createRecord] inserted alignment_records id=", record.id, "vehicle=", vehicle!.id);

    if (Object.keys(input.primary).length > 0 || Object.keys(input.colors).length > 0) {
      db.insert(primaryAngles).values({
        recordId: record.id,
        ...input.primary,
        colors: Object.keys(input.colors).length > 0 ? JSON.stringify(input.colors) : null,
      }).run();
      console.log("[createRecord] inserted primary_angles for record=", record.id);
    }

    revalidatePath("/admin/records");
    return { ok: true, id: record.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[createRecord] FAILED:", msg, e);
    return { ok: false, error: `Kaydedilemedi: ${msg}` };
  }
}
