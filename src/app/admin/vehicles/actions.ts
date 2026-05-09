"use server";

import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createVehicle(input: {
  plate: string;
  make: string;
  model: string;
  km: string;
  ownerName: string;
  ownerPhone: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.plate) return { ok: false, error: "Plaka gerekli" };

  const normalizedPlate = input.plate.toUpperCase().replace(/\s/g, "");
  const existing = db.select().from(vehicles).where(eq(vehicles.plate, normalizedPlate)).get();
  if (existing) return { ok: false, error: "Bu plaka zaten kayıtlı" };

  db.insert(vehicles).values({
    plate: normalizedPlate,
    make: input.make || null,
    model: input.model || null,
    km: input.km ? parseInt(input.km) : null,
    ownerName: input.ownerName || null,
    ownerPhone: input.ownerPhone || null,
  }).run();

  revalidatePath("/admin/vehicles");
  return { ok: true };
}
