"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Gauge, Disc, ChevronLeft } from "lucide-react";
import LoadingScreen from "@/components/customer/LoadingScreen";
import { formatValue } from "@/lib/measurements";
import {
  SEASON_LABEL,
  STATUS_LABEL,
  POSITION_LABEL,
  formatLocation,
  type TireSeason,
  type TireStatus,
  type TirePosition,
} from "@/lib/tires";

type ColorStatus = "red" | "yellow" | "green";
type ColorMap = Record<string, ColorStatus>;

const COLORS: Record<ColorStatus, string> = {
  red: "#dc2626",
  yellow: "#f59e0b",
  green: "#16a34a",
};

type ReportData = {
  vehicle: {
    plate: string;
    make: string | null;
    model: string | null;
    ownerName: string | null;
    km: number | null;
  };
  record: { orderNo: string | null; serviceDate: string; kmAtService: number | null } | null;
  technician: { fullName: string } | null;
  primaryAngles: (Record<string, number | null> & { colors?: string | null }) | null;
};

type TireSet = {
  id: number;
  season: TireSeason;
  brand: string | null;
  modelName: string | null;
  sizeText: string | null;
  status: TireStatus;
  zoneCode: string | null;
  rowCode: string | null;
  slotCode: string | null;
  installedKm: number | null;
  removedKm: number | null;
};

type TireRow = {
  id: number;
  tireSetId: number | null;
  position: TirePosition | null;
  brand: string | null;
  modelName: string | null;
  sizeText: string | null;
  season: TireSeason | null;
  status: TireStatus;
};

type TiresData = {
  vehicle: { plate: string };
  sets: TireSet[];
  tires: TireRow[];
};

const SEASON_BADGE: Record<TireSeason, { bg: string; color: string }> = {
  summer: { bg: "#fef9c3", color: "#854d0e" },
  winter: { bg: "#dbeafe", color: "#1e40af" },
  all_season: { bg: "#f3e8ff", color: "#6b21a8" },
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

type View = "menu" | "alignment" | "tires";

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plate = searchParams.get("plate");

  const [data, setData] = useState<ReportData | null>(null);
  const [tiresData, setTiresData] = useState<TiresData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("menu");

  useEffect(() => {
    if (!plate) {
      router.replace("/customer");
      return;
    }
    Promise.all([
      fetch(`/api/plate?plate=${encodeURIComponent(plate)}`).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error);
        return r.json() as Promise<ReportData>;
      }),
      fetch(`/api/plate/tires?plate=${encodeURIComponent(plate)}`).then(async (r) => {
        if (!r.ok) return null;
        return r.json() as Promise<TiresData>;
      }),
    ])
      .then(([report, tires]) => {
        setData(report);
        setTiresData(tires);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [plate, router]);

  if (loading) return <LoadingScreen />;

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">{error || "Kayıt bulunamadı"}</p>
          <button
            onClick={() => router.push("/customer")}
            className="px-6 py-2 rounded-xl font-bold text-white"
            style={{ background: "#f97316" }}
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const { vehicle, record, technician, primaryAngles: pa } = data;
  const serviceDate = record ? new Date(record.serviceDate).toLocaleString("tr-TR") : null;
  const vehicleLabel = [vehicle.make, vehicle.model].filter(Boolean).join(" ") || "—";
  let colorMap: ColorMap = {};
  if (pa?.colors) {
    try {
      colorMap = JSON.parse(pa.colors) as ColorMap;
    } catch {
      colorMap = {};
    }
  }
  const colorOf = (key: string): ColorStatus | undefined => colorMap[key];

  const hasAlignment = !!pa;
  const hasTires = !!tiresData && tiresData.sets.length > 0;

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
          ARAÇ BİLGİLERİ
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
          {[
            ["Plaka", vehicle.plate],
            ["Araç", vehicleLabel],
            ["Araç Sahibi", vehicle.ownerName ?? "—"],
            ["Son Ölçüm", serviceDate ?? "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <span style={{ color: "#9ca3af", fontSize: 11 }}>{k}: </span>
              <span style={{ fontWeight: 600, color: "#1f2937" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menü (iki kare buton) */}
      {view === "menu" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <MenuTile
              icon={<Gauge size={36} />}
              label="Rot Ayarları"
              sub={hasAlignment ? "Son ölçümü görüntüle" : "Kayıt yok"}
              disabled={!hasAlignment}
              onClick={() => setView("alignment")}
            />
            <MenuTile
              icon={<Disc size={36} />}
              label="Lastiklerim"
              sub={hasTires ? `${tiresData!.sets.length} set kayıtlı` : "Kayıt yok"}
              disabled={!hasTires}
              onClick={() => setView("tires")}
            />
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 16, paddingBottom: 20 }}>
            BİZİ TERCİH ETTİĞİNİZ İÇİN TEŞEKKÜR EDERİZ
          </div>
        </>
      )}

      {/* Rot ayarları görünümü */}
      {view === "alignment" && (
        <>
          <BackButton onClick={() => setView("menu")} />
          {record && (
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 10, marginBottom: 12, fontSize: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div>
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>Tarih: </span>
                  <span style={{ fontWeight: 600, color: "#1f2937" }}>{serviceDate}</span>
                </div>
                <div>
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>Teknisyen: </span>
                  <span style={{ fontWeight: 600, color: "#1f2937" }}>{technician?.fullName ?? "—"}</span>
                </div>
                <div>
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>Sipariş No: </span>
                  <span style={{ fontWeight: 600, color: "#1f2937" }}>{record.orderNo ?? "—"}</span>
                </div>
                <div>
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>KM: </span>
                  <span style={{ fontWeight: 600, color: "#1f2937" }}>
                    {record.kmAtService?.toLocaleString("tr-TR") ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
          {pa ? (
            <>
              <Section title="ÖN — KASTER">
                <TableHeader />
                <MeasurementRow label="Sol" initial={pa.frontCasterLeftInitial} final={pa.frontCasterLeftFinal} unit="°" initialColor={colorOf("frontCasterLeftInitial")} finalColor={colorOf("frontCasterLeftFinal")} />
                <MeasurementRow label="Sağ" initial={pa.frontCasterRightInitial} final={pa.frontCasterRightFinal} unit="°" initialColor={colorOf("frontCasterRightInitial")} finalColor={colorOf("frontCasterRightFinal")} />
              </Section>
              <Section title="ÖN — KAMBER">
                <TableHeader />
                <MeasurementRow label="Sol" initial={pa.frontCamberLeftInitial} final={pa.frontCamberLeftFinal} unit="°" initialColor={colorOf("frontCamberLeftInitial")} finalColor={colorOf("frontCamberLeftFinal")} />
                <MeasurementRow label="Sağ" initial={pa.frontCamberRightInitial} final={pa.frontCamberRightFinal} unit="°" initialColor={colorOf("frontCamberRightInitial")} finalColor={colorOf("frontCamberRightFinal")} />
              </Section>
              <Section title="ÖN — ROT (mm)">
                <TableHeader />
                <MeasurementRow label="Sol" initial={pa.frontToeLeftInitial} final={pa.frontToeLeftFinal} unit="mm" initialColor={colorOf("frontToeLeftInitial")} finalColor={colorOf("frontToeLeftFinal")} />
                <MeasurementRow label="Sağ" initial={pa.frontToeRightInitial} final={pa.frontToeRightFinal} unit="mm" initialColor={colorOf("frontToeRightInitial")} finalColor={colorOf("frontToeRightFinal")} />
                <MeasurementRow label="Toplam" initial={pa.frontToeTotalInitial} final={pa.frontToeTotalFinal} unit="mm" highlight initialColor={colorOf("frontToeTotalInitial")} finalColor={colorOf("frontToeTotalFinal")} />
              </Section>
              <Section title="ARKA — KAMBER">
                <TableHeader />
                <MeasurementRow label="Sol" initial={pa.rearCamberLeftInitial} final={pa.rearCamberLeftFinal} unit="°" initialColor={colorOf("rearCamberLeftInitial")} finalColor={colorOf("rearCamberLeftFinal")} />
                <MeasurementRow label="Sağ" initial={pa.rearCamberRightInitial} final={pa.rearCamberRightFinal} unit="°" initialColor={colorOf("rearCamberRightInitial")} finalColor={colorOf("rearCamberRightFinal")} />
              </Section>
              <Section title="ARKA — ROT (mm)">
                <TableHeader />
                <MeasurementRow label="Sol" initial={pa.rearToeLeftInitial} final={pa.rearToeLeftFinal} unit="mm" initialColor={colorOf("rearToeLeftInitial")} finalColor={colorOf("rearToeLeftFinal")} />
                <MeasurementRow label="Sağ" initial={pa.rearToeRightInitial} final={pa.rearToeRightFinal} unit="mm" initialColor={colorOf("rearToeRightInitial")} finalColor={colorOf("rearToeRightFinal")} />
                <MeasurementRow label="Toplam" initial={pa.rearToeTotalInitial} final={pa.rearToeTotalFinal} unit="mm" highlight initialColor={colorOf("rearToeTotalInitial")} finalColor={colorOf("rearToeTotalFinal")} />
              </Section>
              <Section title="ARKA — İTİŞ AÇISI">
                <TableHeader />
                <MeasurementRow label="İtiş Açısı" initial={pa.thrustAngleInitial} final={pa.thrustAngleFinal} unit="°" initialColor={colorOf("thrustAngleInitial")} finalColor={colorOf("thrustAngleFinal")} />
              </Section>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">Ölçüm verisi bulunamadı</div>
          )}
        </>
      )}

      {/* Lastiklerim görünümü */}
      {view === "tires" && (
        <>
          <BackButton onClick={() => setView("menu")} />
          {tiresData && tiresData.sets.length > 0 ? (
            <TiresView data={tiresData} />
          ) : (
            <div className="text-center py-8 text-gray-400">Lastik kaydı bulunamadı</div>
          )}
        </>
      )}
    </div>
  );
}

function MenuTile({
  icon,
  label,
  sub,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        aspectRatio: "1",
        background: disabled ? "#f3f4f6" : "#fff",
        border: `2px solid ${disabled ? "#e5e7eb" : "#f97316"}`,
        borderRadius: 14,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "transform 0.1s, box-shadow 0.1s",
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.98)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <div style={{ color: disabled ? "#9ca3af" : "#f97316" }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#1f2937", textAlign: "center" }}>{label}</div>
      <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center" }}>{sub}</div>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 10px",
        marginBottom: 12,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        color: "#6b7280",
        cursor: "pointer",
      }}
    >
      <ChevronLeft size={14} /> Menü
    </button>
  );
}

function TiresView({ data }: { data: TiresData }) {
  const onVehicle = data.sets.filter((s) => s.status === "on_vehicle");
  const inStorage = data.sets.filter((s) => s.status === "in_storage");

  return (
    <>
      {onVehicle.length > 0 && (
        <Section title="ARAÇTA TAKILI">
          {onVehicle.map((s) => (
            <SetCard key={s.id} set={s} tires={data.tires.filter((t) => t.tireSetId === s.id)} />
          ))}
        </Section>
      )}
      {inStorage.length > 0 && (
        <Section title="DEPODA SAKLANAN">
          {inStorage.map((s) => (
            <SetCard key={s.id} set={s} tires={data.tires.filter((t) => t.tireSetId === s.id)} />
          ))}
        </Section>
      )}
    </>
  );
}

function SetCard({ set, tires }: { set: TireSet; tires: TireRow[] }) {
  const seasonStyle = SEASON_BADGE[set.season];
  const positionOrder: TirePosition[] = ["FL", "FR", "RL", "RR", "spare"];
  const sortedTires = [...tires].sort(
    (a, b) =>
      positionOrder.indexOf(a.position ?? "spare") - positionOrder.indexOf(b.position ?? "spare"),
  );
  return (
    <div style={{ padding: 10, borderBottom: "1px solid #f3f4f6", fontSize: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontWeight: 700, color: "#1f2937" }}>
          {[set.brand, set.modelName].filter(Boolean).join(" ") || "—"}
          {set.sizeText && (
            <span style={{ color: "#6b7280", fontFamily: "monospace", marginLeft: 6 }}>
              {set.sizeText}
            </span>
          )}
        </div>
        <span
          style={{
            background: seasonStyle.bg,
            color: seasonStyle.color,
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 999,
          }}
        >
          {SEASON_LABEL[set.season]}
        </span>
      </div>
      <div style={{ fontSize: 11, color: "#6b7280" }}>
        Durum: <span style={{ fontWeight: 600, color: "#1f2937" }}>{STATUS_LABEL[set.status]}</span>
        {set.status === "in_storage" && (
          <>
            {" · Konum: "}
            <span style={{ fontWeight: 600, fontFamily: "monospace", color: "#1f2937" }}>
              {formatLocation(set.zoneCode, set.rowCode, set.slotCode)}
            </span>
          </>
        )}
      </div>
      {(set.installedKm != null || set.removedKm != null) && (
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
          {set.installedKm != null && (
            <>
              Takıldı:{" "}
              <span style={{ fontWeight: 600, fontFamily: "monospace", color: "#1f2937" }}>
                {set.installedKm.toLocaleString("tr-TR")} km
              </span>
            </>
          )}
          {set.installedKm != null && set.removedKm != null && " · "}
          {set.removedKm != null && (
            <>
              Söküldü:{" "}
              <span style={{ fontWeight: 600, fontFamily: "monospace", color: "#1f2937" }}>
                {set.removedKm.toLocaleString("tr-TR")} km
              </span>
            </>
          )}
        </div>
      )}
      {sortedTires.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 6 }}>
          {sortedTires.map((t) => (
            <div
              key={t.id}
              style={{
                fontSize: 11,
                background: "#f9fafb",
                padding: "4px 8px",
                borderRadius: 6,
              }}
            >
              <span style={{ color: "#6b7280" }}>{t.position ? POSITION_LABEL[t.position] : "—"}: </span>
              <span style={{ color: "#1f2937", fontWeight: 600 }}>{t.sizeText ?? "—"}</span>
            </div>
          ))}
        </div>
      )}
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
