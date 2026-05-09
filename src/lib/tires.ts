export type TireSeason = "summer" | "winter" | "all_season";
export type TireStatus = "on_vehicle" | "in_storage";
export type TirePosition = "FL" | "FR" | "RL" | "RR" | "spare";
export type TireOperationType = "seasonal_change" | "store" | "retrieve" | "new_install";

export const SEASON_LABEL: Record<TireSeason, string> = {
  summer: "Yaz",
  winter: "Kış",
  all_season: "4 Mevsim",
};

export const STATUS_LABEL: Record<TireStatus, string> = {
  on_vehicle: "Araçta",
  in_storage: "Depoda",
};

export const POSITION_LABEL: Record<TirePosition, string> = {
  FL: "Ön Sol",
  FR: "Ön Sağ",
  RL: "Arka Sol",
  RR: "Arka Sağ",
  spare: "Stepne",
};

export const OPERATION_LABEL: Record<TireOperationType, string> = {
  seasonal_change: "Sezon Değişimi",
  store: "Depoya Teslim",
  retrieve: "Depodan Teslim Alma",
  new_install: "Yeni Lastik Takma",
};

export function formatLocation(
  zone: string | null | undefined,
  row: string | null | undefined,
  slot: string | null | undefined,
): string {
  const parts = [zone, row, slot].filter((p) => p && p.trim().length > 0);
  return parts.length > 0 ? parts.join(" / ") : "—";
}
