import { db } from "@/db";
import { alignmentRecords, primaryAngles, vehicles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-bold uppercase tracking-wide text-white px-3 py-2 rounded-t-lg" style={{ background: "#1f2937" }}>
        {title}
      </div>
      <div className="border border-gray-100 border-t-0 rounded-b-lg overflow-hidden">{children}</div>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="grid text-xs bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}>
      {["", "İlk", "Min", "Maks", "Son"].map((h, i) => (
        <div key={i} className="px-2 py-1.5 font-semibold text-gray-400" style={{ textAlign: i > 0 ? "center" : "left" }}>{h}</div>
      ))}
    </div>
  );
}

type ColorStatus = "red" | "yellow" | "green";
const COLORS: Record<ColorStatus, string> = { red: "#dc2626", yellow: "#f59e0b", green: "#16a34a" };

function Row({ label, initial, min, max, final, unit = "", initialColor, finalColor: finalColorOverride }: {
  label: string; initial: number | null; min?: number | null; max?: number | null; final: number | null; unit?: string;
  initialColor?: ColorStatus; finalColor?: ColorStatus;
}) {
  const fmt = (v: number | null) => v != null ? `${v.toFixed(2)}${unit}` : "—";
  let finalColor: string;
  if (finalColorOverride) {
    finalColor = COLORS[finalColorOverride];
  } else {
    const inSpec = final != null && min != null && max != null && final >= min && final <= max;
    const outOfSpec = final != null && min != null && max != null && (final < min || final > max);
    finalColor = inSpec ? "#16a34a" : outOfSpec ? "#dc2626" : "#f97316";
  }
  const initialColorHex = initialColor ? COLORS[initialColor] : "#6b7280";

  return (
    <div className="grid text-xs border-b border-gray-50 last:border-0" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}>
      <div className="px-3 py-2 font-semibold text-gray-700">{label}</div>
      <div className="px-2 py-2 text-center" style={{ color: initialColorHex, fontWeight: initialColor ? 700 : 400 }}>{fmt(initial)}</div>
      <div className="px-2 py-2 text-center text-gray-400">{min != null ? fmt(min) : "—"}</div>
      <div className="px-2 py-2 text-center text-gray-400">{max != null ? fmt(max) : "—"}</div>
      <div className="px-2 py-2 text-center font-bold" style={{ color: finalColor }}>{fmt(final)}</div>
    </div>
  );
}

export default async function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recordId = parseInt(id);

  const row = db
    .select()
    .from(alignmentRecords)
    .leftJoin(vehicles, eq(alignmentRecords.vehicleId, vehicles.id))
    .leftJoin(users, eq(alignmentRecords.technicianId, users.id))
    .where(eq(alignmentRecords.id, recordId))
    .get();

  if (!row) notFound();

  const pa = db.select().from(primaryAngles).where(eq(primaryAngles.recordId, recordId)).get();

  const { alignment_records: rec, vehicles: veh, users: tech } = row;
  const vehicleLabel = [veh?.make, veh?.model].filter(Boolean).join(" ") || "—";

  return (
    <div className="max-w-2xl" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/records" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-gray-800">Kayıt Detayı</h1>
      </div>

      {/* Araç Bilgisi */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Plaka", veh?.plate],
            ["Tarih", rec.serviceDate ? new Date(rec.serviceDate).toLocaleString("tr-TR") : "—"],
            ["Araç", vehicleLabel],
            ["Teknisyen", tech?.fullName ?? "—"],
            ["Araç Sahibi", veh?.ownerName ?? "—"],
            ["Telefon", veh?.ownerPhone ?? "—"],
            ["Sipariş No", rec.orderNo ?? "—"],
            ["KM", rec.kmAtService?.toLocaleString("tr-TR") ?? "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-xs text-gray-400">{k}: </span>
              <span className="font-bold text-gray-800 text-xs">{v ?? "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Müşteri Rapor Linki */}
      {veh && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-orange-700">Müşteri Rapor Linki</p>
            <p className="text-xs text-orange-500 mt-0.5 font-mono">/customer/report?plate={veh.plate}</p>
          </div>
          <a href={`/customer/report?plate=${veh.plate}`} target="_blank"
            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: "#f97316" }}>
            Önizle →
          </a>
        </div>
      )}

      {pa && (() => {
        let colorMap: Record<string, ColorStatus> = {};
        if (pa.colors) {
          try { colorMap = JSON.parse(pa.colors) as Record<string, ColorStatus>; } catch { colorMap = {}; }
        }
        const c = (k: string) => colorMap[k];
        return (
          <>
            <Section title="ÖN — KASTER"><TableHeader />
              <Row label="Sol" initial={pa.frontCasterLeftInitial} min={pa.frontCasterLeftMin} max={pa.frontCasterLeftMax} final={pa.frontCasterLeftFinal} unit="°" initialColor={c("frontCasterLeftInitial")} finalColor={c("frontCasterLeftFinal")} />
              <Row label="Sağ" initial={pa.frontCasterRightInitial} min={pa.frontCasterRightMin} max={pa.frontCasterRightMax} final={pa.frontCasterRightFinal} unit="°" initialColor={c("frontCasterRightInitial")} finalColor={c("frontCasterRightFinal")} />
            </Section>
            <Section title="ÖN — KAMBER"><TableHeader />
              <Row label="Sol" initial={pa.frontCamberLeftInitial} min={pa.frontCamberLeftMin} max={pa.frontCamberLeftMax} final={pa.frontCamberLeftFinal} unit="°" initialColor={c("frontCamberLeftInitial")} finalColor={c("frontCamberLeftFinal")} />
              <Row label="Sağ" initial={pa.frontCamberRightInitial} min={pa.frontCamberRightMin} max={pa.frontCamberRightMax} final={pa.frontCamberRightFinal} unit="°" initialColor={c("frontCamberRightInitial")} finalColor={c("frontCamberRightFinal")} />
            </Section>
            <Section title="ÖN — ROT (mm)"><TableHeader />
              <Row label="Sol" initial={pa.frontToeLeftInitial} min={pa.frontToeLeftMin} max={pa.frontToeLeftMax} final={pa.frontToeLeftFinal} unit="mm" initialColor={c("frontToeLeftInitial")} finalColor={c("frontToeLeftFinal")} />
              <Row label="Sağ" initial={pa.frontToeRightInitial} min={pa.frontToeRightMin} max={pa.frontToeRightMax} final={pa.frontToeRightFinal} unit="mm" initialColor={c("frontToeRightInitial")} finalColor={c("frontToeRightFinal")} />
              <Row label="Toplam" initial={pa.frontToeTotalInitial} min={pa.frontToeTotalMin} max={pa.frontToeTotalMax} final={pa.frontToeTotalFinal} unit="mm" initialColor={c("frontToeTotalInitial")} finalColor={c("frontToeTotalFinal")} />
            </Section>
            <Section title="ARKA — KAMBER"><TableHeader />
              <Row label="Sol" initial={pa.rearCamberLeftInitial} min={pa.rearCamberLeftMin} max={pa.rearCamberLeftMax} final={pa.rearCamberLeftFinal} unit="°" initialColor={c("rearCamberLeftInitial")} finalColor={c("rearCamberLeftFinal")} />
              <Row label="Sağ" initial={pa.rearCamberRightInitial} min={pa.rearCamberRightMin} max={pa.rearCamberRightMax} final={pa.rearCamberRightFinal} unit="°" initialColor={c("rearCamberRightInitial")} finalColor={c("rearCamberRightFinal")} />
            </Section>
            <Section title="ARKA — ROT (mm)"><TableHeader />
              <Row label="Sol" initial={pa.rearToeLeftInitial} min={pa.rearToeLeftMin} max={pa.rearToeLeftMax} final={pa.rearToeLeftFinal} unit="mm" initialColor={c("rearToeLeftInitial")} finalColor={c("rearToeLeftFinal")} />
              <Row label="Sağ" initial={pa.rearToeRightInitial} min={pa.rearToeRightMin} max={pa.rearToeRightMax} final={pa.rearToeRightFinal} unit="mm" initialColor={c("rearToeRightInitial")} finalColor={c("rearToeRightFinal")} />
              <Row label="Toplam" initial={pa.rearToeTotalInitial} min={pa.rearToeTotalMin} max={pa.rearToeTotalMax} final={pa.rearToeTotalFinal} unit="mm" initialColor={c("rearToeTotalInitial")} finalColor={c("rearToeTotalFinal")} />
            </Section>
            <Section title="ARKA — İTİŞ AÇISI"><TableHeader />
              <Row label="İtiş Açısı" initial={pa.thrustAngleInitial} final={pa.thrustAngleFinal} unit="°" initialColor={c("thrustAngleInitial")} finalColor={c("thrustAngleFinal")} />
            </Section>
          </>
        );
      })()}

    </div>
  );
}
