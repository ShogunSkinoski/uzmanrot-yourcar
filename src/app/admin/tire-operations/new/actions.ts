"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { tireOperations, tireSets, tires, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { TireOperationType } from "@/lib/tires";

type Input = {
  plate: string;
  operationType: TireOperationType;
  serviceDate: string;
  kmAtService: string | null;
  orderNo: string | null;
  notes: string | null;
  removedTireSetId: number | null;
  installedTireSetId: number | null;
  removedToZone: string | null;
  removedToRow: string | null;
  removedToSlot: string | null;
};

export async function createTireOperation(
  input: Input,
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return { ok: false, error: "Yetkisiz" };
  const session = await verifyToken(token);
  if (!session) return { ok: false, error: "Yetkisiz" };

  if (!input.plate || !input.serviceDate) {
    return { ok: false, error: "Plaka ve servis tarihi gerekli" };
  }

  try {
    const plate = input.plate.toUpperCase().replace(/\s/g, "");
    const vehicle = db.select().from(vehicles).where(eq(vehicles.plate, plate)).get();
    if (!vehicle) return { ok: false, error: "Bu plakaya ait araç bulunamadı" };

    // İşlem tipine göre minimum gereksinimler
    if (input.operationType === "seasonal_change") {
      if (!input.removedTireSetId || !input.installedTireSetId) {
        return { ok: false, error: "Sezon değişimi için sökülen ve takılan set gerekli" };
      }
    } else if (input.operationType === "store") {
      if (!input.removedTireSetId) {
        return { ok: false, error: "Depoya teslim için sökülen set gerekli" };
      }
    } else if (input.operationType === "retrieve") {
      if (!input.installedTireSetId) {
        return { ok: false, error: "Teslim alma için takılan set gerekli" };
      }
    } else if (input.operationType === "new_install") {
      if (!input.installedTireSetId) {
        return { ok: false, error: "Yeni lastik takma için set gerekli" };
      }
    }

    const op = db
      .insert(tireOperations)
      .values({
        vehicleId: vehicle.id,
        technicianId: session.userId,
        operationType: input.operationType,
        serviceDate: new Date(input.serviceDate),
        kmAtService: input.kmAtService ? parseInt(input.kmAtService) : null,
        orderNo: input.orderNo,
        removedTireSetId: input.removedTireSetId,
        installedTireSetId: input.installedTireSetId,
        removedToZone: input.removedToZone,
        removedToRow: input.removedToRow,
        removedToSlot: input.removedToSlot,
        notes: input.notes,
      })
      .returning()
      .get();

    const km = input.kmAtService ? parseInt(input.kmAtService, 10) : null;
    const kmValue = km !== null && Number.isFinite(km) ? km : null;

    // Sökülen seti depoya
    if (input.removedTireSetId) {
      db.update(tireSets)
        .set({
          status: "in_storage",
          zoneCode: input.removedToZone,
          rowCode: input.removedToRow,
          slotCode: input.removedToSlot,
          removedKm: kmValue,
        })
        .where(eq(tireSets.id, input.removedTireSetId))
        .run();
      db.update(tires)
        .set({ status: "in_storage" })
        .where(eq(tires.tireSetId, input.removedTireSetId))
        .run();
    }

    // Takılan seti araca
    if (input.installedTireSetId) {
      db.update(tireSets)
        .set({
          status: "on_vehicle",
          zoneCode: null,
          rowCode: null,
          slotCode: null,
          installedKm: kmValue,
          removedKm: null,
        })
        .where(eq(tireSets.id, input.installedTireSetId))
        .run();
      db.update(tires)
        .set({ status: "on_vehicle" })
        .where(eq(tires.tireSetId, input.installedTireSetId))
        .run();
    }

    revalidatePath("/admin/tire-operations");
    revalidatePath("/admin/tires");
    revalidatePath(`/admin/vehicles/${vehicle.id}`);
    return { ok: true, id: op.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Kaydedilemedi: ${msg}` };
  }
}
