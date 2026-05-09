"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoadingScreen from "@/components/customer/LoadingScreen";
import { getSpecStatus, formatValue } from "@/lib/measurements";

type ReportData = {
  vehicle: {
    plate: string; make: string | null; model: string | null;
    yearFrom: number | null; yearTo: number | null;
    ownerName: string | null; km: number | null;
  };
  record: { orderNo: string | null; serviceDate: string; kmAtService: number | null };
  technician: { fullName: string } | null;
  primaryAngles: Record<string, number | null> | null;
  secondaryAngles: Record<string, number | null> | null;
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

function TableHeader({ cols = ["", "İlk", "Min", "Maks", "Son"] }: { cols?: string[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: cols.map(() => "1fr").join(" "), fontSize: 11, background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
      {cols.map((h, i) => (
        <div key={i} style={{ padding: "4px 4px", textAlign: i > 0 ? "center" : "left", color: "#6b7280", fontWeight: 600 }}>{h}</div>
      ))}
    </div>
  );
}

function MeasurementRow({ label, initial, min, max, final, unit = "", highlight, decimals = 2 }: {
  label: string; initial: number | null | undefined; min?: number | null;
  max?: number | null; final: number | null | undefined; unit?: string; highlight?: boolean; decimals?: number;
}) {
  const status = getSpecStatus(initial, final, min, max);
  const finalColor = status === "in_spec" || status === "corrected" ? "#16a34a" : status === "out_of_spec" ? "#dc2626" : "#f97316";
  const fmt = (v: number | null | undefined) => v != null ? `${formatValue(v, decimals)}${unit}` : "—";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", fontSize: 12, borderBottom: "1px solid #f3f4f6", background: highlight ? "#fff7ed" : "transparent" }}>
      <div style={{ padding: "5px 8px", color: "#374151", fontWeight: 600 }}>{label}</div>
      <div style={{ padding: "5px 4px", textAlign: "center", color: "#6b7280" }}>{fmt(initial)}</div>
      <div style={{ padding: "5px 4px", textAlign: "center", color: "#9ca3af", fontSize: 11 }}>{min != null ? fmt(min) : "—"}</div>
      <div style={{ padding: "5px 4px", textAlign: "center", color: "#9ca3af", fontSize: 11 }}>{max != null ? fmt(max) : "—"}</div>
      <div style={{ padding: "5px 4px", textAlign: "center", fontWeight: 700, color: finalColor }}>{fmt(final)}</div>
    </div>
  );
}

function SimpleRow({ label, initial, final, unit = "mm" }: { label: string; initial: number | null | undefined; final: number | null | undefined; unit?: string }) {
  const fmt = (v: number | null | undefined) => v != null ? `${v}${unit}` : "—";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", fontSize: 12, borderBottom: "1px solid #f3f4f6" }}>
      <div style={{ padding: "5px 8px", color: "#374151", fontWeight: 600 }}>{label}</div>
      <div style={{ padding: "5px 4px", textAlign: "center", color: "#6b7280" }}>{fmt(initial)}</div>
      <div style={{ padding: "5px 4px", textAlign: "center", fontWeight: 700, color: "#f97316" }}>{fmt(final)}</div>
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
  const [activeTab, setActiveTab] = useState<"birincil" | "ikincil">("birincil");

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

  const { vehicle, record, technician, primaryAngles: pa, secondaryAngles: sa } = data;
  const serviceDate = new Date(record.serviceDate).toLocaleString("tr-TR");
  const vehicleLabel = [vehicle.make, vehicle.model, vehicle.yearFrom ? `${vehicle.yearFrom}${vehicle.yearTo ? `–${vehicle.yearTo}` : ""}` : null].filter(Boolean).join(" ") || "—";

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

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {(["birincil", "ikincil"] as const).map((key) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
            background: activeTab === key ? "#f97316" : "#fff", color: activeTab === key ? "#fff" : "#6b7280",
            boxShadow: activeTab === key ? "0 2px 8px #f9731640" : "0 1px 3px #0001", transition: "all 0.2s",
          }}>
            {key === "birincil" ? "Birincil Açılar" : "İkincil Açılar"}
          </button>
        ))}
      </div>

      {/* Birincil */}
      {activeTab === "birincil" && pa && (
        <>
          <Section title="ÖN — KASTET"><TableHeader />
            <MeasurementRow label="Sol" initial={pa.frontCasterLeftInitial} min={pa.frontCasterLeftMin} max={pa.frontCasterLeftMax} final={pa.frontCasterLeftFinal} unit="°" />
            <MeasurementRow label="Sağ" initial={pa.frontCasterRightInitial} min={pa.frontCasterRightMin} max={pa.frontCasterRightMax} final={pa.frontCasterRightFinal} unit="°" />
          </Section>
          <Section title="ÖN — KAMBER"><TableHeader />
            <MeasurementRow label="Sol" initial={pa.frontCamberLeftInitial} min={pa.frontCamberLeftMin} max={pa.frontCamberLeftMax} final={pa.frontCamberLeftFinal} unit="°" />
            <MeasurementRow label="Sağ" initial={pa.frontCamberRightInitial} min={pa.frontCamberRightMin} max={pa.frontCamberRightMax} final={pa.frontCamberRightFinal} unit="°" />
          </Section>
          <Section title="ÖN — ROT (mm)"><TableHeader />
            <MeasurementRow label="Sol" initial={pa.frontToeLeftInitial} min={pa.frontToeLeftMin} max={pa.frontToeLeftMax} final={pa.frontToeLeftFinal} unit="mm" />
            <MeasurementRow label="Sağ" initial={pa.frontToeRightInitial} min={pa.frontToeRightMin} max={pa.frontToeRightMax} final={pa.frontToeRightFinal} unit="mm" />
            <MeasurementRow label="Toplam" initial={pa.frontToeTotalInitial} min={pa.frontToeTotalMin} max={pa.frontToeTotalMax} final={pa.frontToeTotalFinal} unit="mm" highlight />
          </Section>
          <Section title="ARKA — KAMBER"><TableHeader />
            <MeasurementRow label="Sol" initial={pa.rearCamberLeftInitial} min={pa.rearCamberLeftMin} max={pa.rearCamberLeftMax} final={pa.rearCamberLeftFinal} unit="°" />
            <MeasurementRow label="Sağ" initial={pa.rearCamberRightInitial} min={pa.rearCamberRightMin} max={pa.rearCamberRightMax} final={pa.rearCamberRightFinal} unit="°" />
          </Section>
          <Section title="ARKA — ROT (mm)"><TableHeader />
            <MeasurementRow label="Sol" initial={pa.rearToeLeftInitial} min={pa.rearToeLeftMin} max={pa.rearToeLeftMax} final={pa.rearToeLeftFinal} unit="mm" />
            <MeasurementRow label="Sağ" initial={pa.rearToeRightInitial} min={pa.rearToeRightMin} max={pa.rearToeRightMax} final={pa.rearToeRightFinal} unit="mm" />
            <MeasurementRow label="Toplam" initial={pa.rearToeTotalInitial} min={pa.rearToeTotalMin} max={pa.rearToeTotalMax} final={pa.rearToeTotalFinal} unit="mm" highlight />
          </Section>
          <Section title="ARKA — İTİŞ AÇISI"><TableHeader />
            <MeasurementRow label="İtiş Açısı" initial={pa.thrustAngleInitial} final={pa.thrustAngleFinal} unit="°" />
          </Section>
        </>
      )}

      {/* İkincil */}
      {activeTab === "ikincil" && sa && (
        <>
          <Section title="S.A.İ."><TableHeader />
            <MeasurementRow label="Sol" initial={sa.saiLeftInitial} min={sa.saiLeftMin} max={sa.saiLeftMax} final={sa.saiLeftFinal} unit="°" />
            <MeasurementRow label="Sağ" initial={sa.saiRightInitial} min={sa.saiRightMin} max={sa.saiRightMax} final={sa.saiRightFinal} unit="°" />
          </Section>
          <Section title="KAPSAM AÇISI">
            <TableHeader cols={["", "İlk", "Son"]} />
            {[{ l: "Sol", i: sa.includedAngleLeftInitial, f: sa.includedAngleLeftFinal }, { l: "Sağ", i: sa.includedAngleRightInitial, f: sa.includedAngleRightFinal }].map((r) => (
              <div key={r.l} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontSize: 12, borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ padding: "5px 8px", fontWeight: 600, color: "#374151" }}>{r.l}</div>
                <div style={{ padding: "5px 4px", textAlign: "center", color: "#6b7280" }}>{r.i?.toFixed(2) ?? "—"}°</div>
                <div style={{ padding: "5px 4px", textAlign: "center", fontWeight: 700, color: "#f97316" }}>{r.f?.toFixed(2) ?? "—"}°</div>
              </div>
            ))}
          </Section>
          <Section title="FLAŞON KAÇIKLIGI">
            <TableHeader cols={["", "İlk", "Son"]} />
            {[{ l: "Ön", i: sa.rimRunoutFrontInitial, f: sa.rimRunoutFrontFinal }, { l: "Arka", i: sa.rimRunoutRearInitial, f: sa.rimRunoutRearFinal }].map((r) => (
              <div key={r.l} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontSize: 12, borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ padding: "5px 8px", fontWeight: 600, color: "#374151" }}>{r.l}</div>
                <div style={{ padding: "5px 4px", textAlign: "center", color: "#6b7280" }}>{r.i != null ? `${r.i}mm` : "—"}</div>
                <div style={{ padding: "5px 4px", textAlign: "center", fontWeight: 700, color: "#f97316" }}>{r.f != null ? `${r.f}mm` : "—"}</div>
              </div>
            ))}
          </Section>
          <Section title="DİĞER ÖLÇÜMLER">
            <SimpleRow label="Tekerlek İzi Genişlik Farkı" initial={sa.trackWidthDiffInitial} final={sa.trackWidthDiffFinal} />
            <SimpleRow label="Ön-Arka Aks Merkez Farkı" initial={sa.axleCenterDiffInitial} final={sa.axleCenterDiffFinal} />
          </Section>
        </>
      )}

      {!pa && !sa && <div className="text-center py-8 text-gray-400">Ölçüm verisi bulunamadı</div>}

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
