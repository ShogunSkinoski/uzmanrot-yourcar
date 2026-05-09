import Link from "next/link";
import { db } from "@/db";
import { alignmentRecords, vehicles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ClipboardList, Car, Plus } from "lucide-react";

export default function DashboardPage() {
  const recordCount = db.select().from(alignmentRecords).all().length;
  const vehicleCount = db.select().from(vehicles).all().length;

  const recentRecords = db
    .select({
      id: alignmentRecords.id,
      serviceDate: alignmentRecords.serviceDate,
      plate: vehicles.plate,
      make: vehicles.make,
      model: vehicles.model,
      ownerName: vehicles.ownerName,
    })
    .from(alignmentRecords)
    .leftJoin(vehicles, eq(alignmentRecords.vehicleId, vehicles.id))
    .orderBy(desc(alignmentRecords.serviceDate))
    .limit(5)
    .all();

  const stats = [
    { label: "Toplam Kayıt", value: recordCount, icon: ClipboardList, href: "/admin/records" },
    { label: "Araçlar", value: vehicleCount, icon: Car, href: "/admin/vehicles" },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-gray-800">Dashboard</h1>
        <Link
          href="/admin/records/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "#f97316" }}
        >
          <Plus size={16} />
          Yeni Kayıt
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:border-orange-200 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} style={{ color: "#f97316" }} />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-2xl font-black text-gray-800">{value}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-700 text-sm">Son Kayıtlar</h2>
          <Link href="/admin/records" className="text-xs font-semibold" style={{ color: "#f97316" }}>
            Tümünü Gör →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentRecords.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Henüz kayıt yok.{" "}
              <Link href="/admin/records/new" style={{ color: "#f97316" }} className="font-semibold">
                İlk kaydı ekle →
              </Link>
            </div>
          )}
          {recentRecords.map((r) => (
            <Link
              key={r.id}
              href={`/admin/records/${r.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div>
                <span className="font-bold text-gray-800 text-sm font-mono">{r.plate}</span>
                <span className="text-gray-400 text-xs ml-2">{[r.make, r.model].filter(Boolean).join(" ") || "—"}</span>
                {r.ownerName && <span className="text-gray-400 text-xs ml-2">· {r.ownerName}</span>}
              </div>
              <span className="text-xs text-gray-400">
                {r.serviceDate ? new Date(r.serviceDate).toLocaleDateString("tr-TR") : "—"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
