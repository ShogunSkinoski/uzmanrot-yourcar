export type SpecStatus = "in_spec" | "out_of_spec" | "corrected" | "no_spec";

export function getSpecStatus(
  initial: number | null | undefined,
  final: number | null | undefined,
  min: number | null | undefined,
  max: number | null | undefined
): SpecStatus {
  if (min == null || max == null) return "no_spec";
  const finalInSpec = final != null && final >= min && final <= max;
  const initialInSpec = initial != null && initial >= min && initial <= max;
  if (finalInSpec && !initialInSpec) return "corrected";
  if (finalInSpec) return "in_spec";
  if (final != null) return "out_of_spec";
  return "no_spec";
}

export const statusBadgeClass: Record<SpecStatus, string> = {
  in_spec: "badge-success",
  out_of_spec: "badge-error",
  corrected: "badge-warning",
  no_spec: "badge-ghost",
};

export const statusTextClass: Record<SpecStatus, string> = {
  in_spec: "text-success",
  out_of_spec: "text-error",
  corrected: "text-warning",
  no_spec: "text-base-content/40",
};

export const statusLabel: Record<SpecStatus, string> = {
  in_spec: "Spek İçi",
  out_of_spec: "Spek Dışı",
  corrected: "Düzeltildi",
  no_spec: "—",
};

export function formatValue(val: number | null | undefined, decimals = 2): string {
  if (val == null) return "—";
  return val.toFixed(decimals);
}
