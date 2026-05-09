"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoadingScreen from "@/components/customer/LoadingScreen";
import { formatValue } from "@/lib/measurements";

type ColorStatus = "red" | "yellow" | "green";
type ColorMap = Record<string, ColorStatus>;

const COLORS: Record<ColorStatus, string> = {
  red: "#dc2626",
  yellow: "#f59e0b",
  green: "#16a34a",
};

type ReportData = {
  vehicle: {
    plate: string; make: string | null; model: string | null;
    ownerName: string | null; km: number | null;
  };
  record: { orderNo: string | null; serviceDate: string; kmAtService: number | null };
  technician: { fullName: string } | null;
  primaryAngles: (Record<string, number | null> & { colors?: string | null }) | null;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ background: "#1f2937", color: "#fff", fontWeight: 700, fontSize: 13, padding: "6px 10px", borderRadius: "6px 6px 0 0" }}>
        {title}
      </div>
      <div style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 6px 6px", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function TableHeader() {
  const cols = ["", "İlk", "Son"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontSize: 11, background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
      {cols.map((h, i) => (
        <div key={i} style={{ padding: "4px 4px", textAlign: i > 0 ? "center" : "left", color: "#6b7280", fontWeight: 600 }}>{h}</div>
      ))}
    </div>
  );
}

function MeasurementRow({ label, initial, final, unit = "", highlight, decimals = 2, initialColor, finalColor: finalColorOverride }: {
  label: string; initial: number | null | undefined;
  final: number | null | undefined; unit?: string; highlight?: boolean; decimals?: number;
  initialColor?: ColorStatus; finalColor?: ColorStatus;
}) {
  const finalColor = finalColorOverride ? COLORS[finalColorOverride] : "#f97316";
  const initialColorHex = initialColor ? COLORS[initialColor] : "#6b7280";
  const fmt = (v: number | null | undefined) => v != null ? `${formatValue(v, decimals)}${unit}` : "—";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontSize: 12, borderBottom: "1px solid #f3f4f6", background: highlight ? "#fff7ed" : "transparent" }}>
      <div style={{ padding: "5px 8px", color: "#374151", fontWeight: 600 }}>{label}</div>
      <div style={{ padding: "5px 4px", textAlign: "center", color: initialColorHex, fontWeight: initialColor ? 700 : 400 }}>{fmt(initial)}</div>
      <div style={{ padding: "5px 4px", textAlign: "center", fontWeight: 700, color: finalColor }}>{fmt(final)}</div>
    </div>
  );
}

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plate = searchParams.get("plate");

  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plate) { router.replace("/customer"); return; }
    fetch(`/api/plate?plate=${encodeURIComponent(plate)}`)
      .then((r) => { if (!r.ok) return r.json().then((d) => { throw new Error(d.error); }); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [plate, router]);

  if (loading) return <LoadingScreen />;

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">{error || "Kayıt bulunamadı"}</p>
          <button onClick={() => router.push("/customer")} className="px-6 py-2 rounded-xl font-bold text-white" style={{ background: "#f97316" }}>Geri Dön</button>
        </div>
      </div>
    );
  }

  const { vehicle, record, technician, primaryAngles: pa } = data;
  const serviceDate = new Date(record.serviceDate).toLocaleString("tr-TR");
  const vehicleLabel = [vehicle.make, vehicle.model].filter(Boolean).join(" ") || "—";
  let colorMap: ColorMap = {};
  if (pa?.colors) {
    try { colorMap = JSON.parse(pa.colors) as ColorMap; } catch { colorMap = {}; }
  }
  const colorOf = (key: string): ColorStatus | undefined => colorMap[key];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "0 auto", padding: 12, background: "#f8fafc", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16, padding: "14px 10px", background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb" }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#1f2937", letterSpacing: 1 }}>UZMAN ROT BALANS</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>MOTORLU SAN. EMEVİLER SK. NO: 9/11 KONYA</div>
        <div style={{ fontSize: 11, color: "#f97316", marginTop: 1 }}>0332 237 9226 / 0532 523 2903</div>
      </div>

      {/* Araç Bilgileri */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 12, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#1f2937", marginBottom: 8, borderBottom: "1px solid #f3f4f6", paddingBottom: 6 }}>
          ARAÇ AYAR RAPORU
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
          {[
            ["Araç Sahibi", vehicle.ownerName ?? "—"],
            ["Tarih", serviceDate],
            ["Araç", vehicleLabel],
            ["Teknisyen", technician?.fullName ?? "—"],
            ["Plaka", vehicle.plate],
            ["Sipariş No", record.orderNo ?? "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <span style={{ color: "#9ca3af", fontSize: 11 }}>{k}: </span>
              <span style={{ fontWeight: 600, color: "#1f2937" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {pa && (
        <>
          <Section title="ÖN — KASTER"><TableHeader />
            <MeasurementRow label="Sol" initial={pa.frontCasterLeftInitial} final={pa.frontCasterLeftFinal} unit="°" initialColor={colorOf("frontCasterLeftInitial")} finalColor={colorOf("frontCasterLeftFinal")} />
            <MeasurementRow label="Sağ" initial={pa.frontCasterRightInitial} final={pa.frontCasterRightFinal} unit="°" initialColor={colorOf("frontCasterRightInitial")} finalColor={colorOf("frontCasterRightFinal")} />
          </Section>
          <Section title="ÖN — KAMBER"><TableHeader />
            <MeasurementRow label="Sol" initial={pa.frontCamberLeftInitial} final={pa.frontCamberLeftFinal} unit="°" initialColor={colorOf("frontCamberLeftInitial")} finalColor={colorOf("frontCamberLeftFinal")} />
            <MeasurementRow label="Sağ" initial={pa.frontCamberRightInitial} final={pa.frontCamberRightFinal} unit="°" initialColor={colorOf("frontCamberRightInitial")} finalColor={colorOf("frontCamberRightFinal")} />
          </Section>
          <Section title="ÖN — ROT (mm)"><TableHeader />
            <MeasurementRow label="Sol" initial={pa.frontToeLeftInitial} final={pa.frontToeLeftFinal} unit="mm" initialColor={colorOf("frontToeLeftInitial")} finalColor={colorOf("frontToeLeftFinal")} />
            <MeasurementRow label="Sağ" initial={pa.frontToeRightInitial} final={pa.frontToeRightFinal} unit="mm" initialColor={colorOf("frontToeRightInitial")} finalColor={colorOf("frontToeRightFinal")} />
            <MeasurementRow label="Toplam" initial={pa.frontToeTotalInitial} final={pa.frontToeTotalFinal} unit="mm" highlight initialColor={colorOf("frontToeTotalInitial")} finalColor={colorOf("frontToeTotalFinal")} />
          </Section>
          <Section title="ARKA — KAMBER"><TableHeader />
            <MeasurementRow label="Sol" initial={pa.rearCamberLeftInitial} final={pa.rearCamberLeftFinal} unit="°" initialColor={colorOf("rearCamberLeftInitial")} finalColor={colorOf("rearCamberLeftFinal")} />
            <MeasurementRow label="Sağ" initial={pa.rearCamberRightInitial} final={pa.rearCamberRightFinal} unit="°" initialColor={colorOf("rearCamberRightInitial")} finalColor={colorOf("rearCamberRightFinal")} />
          </Section>
          <Section title="ARKA — ROT (mm)"><TableHeader />
            <MeasurementRow label="Sol" initial={pa.rearToeLeftInitial} final={pa.rearToeLeftFinal} unit="mm" initialColor={colorOf("rearToeLeftInitial")} finalColor={colorOf("rearToeLeftFinal")} />
            <MeasurementRow label="Sağ" initial={pa.rearToeRightInitial} final={pa.rearToeRightFinal} unit="mm" initialColor={colorOf("rearToeRightInitial")} finalColor={colorOf("rearToeRightFinal")} />
            <MeasurementRow label="Toplam" initial={pa.rearToeTotalInitial} final={pa.rearToeTotalFinal} unit="mm" highlight initialColor={colorOf("rearToeTotalInitial")} finalColor={colorOf("rearToeTotalFinal")} />
          </Section>
          <Section title="ARKA — İTİŞ AÇISI"><TableHeader />
            <MeasurementRow label="İtiş Açısı" initial={pa.thrustAngleInitial} final={pa.thrustAngleFinal} unit="°" initialColor={colorOf("thrustAngleInitial")} finalColor={colorOf("thrustAngleFinal")} />
          </Section>
        </>
      )}

      {!pa && <div className="text-center py-8 text-gray-400">Ölçüm verisi bulunamadı</div>}

      <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 16, paddingBottom: 20 }}>
        BİZİ TERCİH ETTİĞİNİZ İÇİN TEŞEKKÜR EDERİZ
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ReportContent />
    </Suspense>
  );
}
