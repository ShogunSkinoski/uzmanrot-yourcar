"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { tireSets, tires, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { TireSeason, TireStatus } from "@/lib/tires";

type CreateInput = {
  plate: string;
  season: TireSeason;
  brand: string | null;
  modelName: string | null;
  sizeText: string | null;
  status: TireStatus;
  zoneCode: string | null;
  rowCode: string | null;
  slotCode: string | null;
  installedKm: string | null;
  removedKm: string | null;
  notes: string | null;
  createTires: boolean;
};

function parseKm(v: string | null | undefined): number | null {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

async function requireSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function createTireSet(
  input: CreateInput,
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  const session = await requireSession();
  if (!session) return { ok: false, error: "Yetkisiz" };
  if (!input.plate) return { ok: false, error: "Plaka gerekli" };

  try {
    const plate = input.plate.toUpperCase().replace(/\s/g, "");
    const vehicle = db.select().from(vehicles).where(eq(vehicles.plate, plate)).get();
    if (!vehicle) return { ok: false, error: "Bu plakaya ait araç bulunamadı" };

    const set = db
      .insert(tireSets)
      .values({
        vehicleId: vehicle.id,
        season: input.season,
        brand: input.brand,
        modelName: input.modelName,
        sizeText: input.sizeText,
        status: input.status,
        zoneCode: input.status === "in_storage" ? input.zoneCode : null,
        rowCode: input.status === "in_storage" ? input.rowCode : null,
        slotCode: input.status === "in_storage" ? input.slotCode : null,
        installedKm: parseKm(input.installedKm),
        removedKm: parseKm(input.removedKm),
        notes: input.notes,
      })
      .returning()
      .get();

    if (input.createTires) {
      const positions = ["FL", "FR", "RL", "RR"] as const;
      for (const position of positions) {
        db.insert(tires).values({
          vehicleId: vehicle.id,
          tireSetId: set.id,
          position,
          season: input.season,
          brand: input.brand,
          modelName: input.modelName,
          sizeText: input.sizeText,
          status: input.status,
        }).run();
      }
    }

    revalidatePath("/admin/tires");
    revalidatePath(`/admin/vehicles/${vehicle.id}`);
    return { ok: true, id: set.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Kaydedilemedi: ${msg}` };
  }
}

export async function updateTireSet(
  id: number,
  input: Omit<CreateInput, "plate" | "createTires">,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  if (!session) return { ok: false, error: "Yetkisiz" };

  try {
    const set = db.select().from(tireSets).where(eq(tireSets.id, id)).get();
    if (!set) return { ok: false, error: "Set bulunamadı" };

    db.update(tireSets)
      .set({
        season: input.season,
        brand: input.brand,
        modelName: input.modelName,
        sizeText: input.sizeText,
        status: input.status,
        zoneCode: input.status === "in_storage" ? input.zoneCode : null,
        rowCode: input.status === "in_storage" ? input.rowCode : null,
        slotCode: input.status === "in_storage" ? input.slotCode : null,
        installedKm: parseKm(input.installedKm),
        removedKm: parseKm(input.removedKm),
        notes: input.notes,
      })
      .where(eq(tireSets.id, id))
      .run();

    db.update(tires)
      .set({
        season: input.season,
        brand: input.brand,
        modelName: input.modelName,
        sizeText: input.sizeText,
        status: input.status,
      })
      .where(eq(tires.tireSetId, id))
      .run();

    revalidatePath(`/admin/tires/${id}`);
    revalidatePath("/admin/tires");
    revalidatePath(`/admin/vehicles/${set.vehicleId}`);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Güncellenemedi: ${msg}` };
  }
}

export async function deleteTireSet(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  if (!session) return { ok: false, error: "Yetkisiz" };

  try {
    const set = db.select().from(tireSets).where(eq(tireSets.id, id)).get();
    if (!set) return { ok: false, error: "Set bulunamadı" };

    db.delete(tires).where(eq(tires.tireSetId, id)).run();
    db.delete(tireSets).where(eq(tireSets.id, id)).run();

    revalidatePath("/admin/tires");
    revalidatePath(`/admin/vehicles/${set.vehicleId}`);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Silinemedi: ${msg}` };
  }
}
