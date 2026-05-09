import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import bcrypt from "bcryptjs";
import path from "path";

const sqlite = new Database(path.join(process.cwd(), "uzmanrot.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

async function seed() {
  const existing = db.select().from(schema.users).all();
  if (existing.length > 0) {
    console.log("Veritabanı zaten seed'lendi, atlanıyor.");
    return;
  }

  const passwordHash = await bcrypt.hash("uzmanrot2026", 12);

  const admin = db
    .insert(schema.users)
    .values({ email: "admin@uzmanrot.com", passwordHash, role: "admin", fullName: "Admin" })
    .returning()
    .get();

  console.log("Admin oluşturuldu:", admin.email);

  // Araç = Müşteri. Plaka zorunlu, geri kalanı opsiyonel.
  const vehicle = db
    .insert(schema.vehicles)
    .values({
      plate: "42ABC42",
      make: "FORD",
      model: "S-MAX",
      yearFrom: 2006,
      yearTo: 2013,
      km: 150000,
      ownerName: "Ahmet Yılmaz",
      ownerPhone: "0532 123 4567",
    })
    .returning()
    .get();

  const record = db
    .insert(schema.alignmentRecords)
    .values({
      vehicleId: vehicle.id,
      technicianId: admin.id,
      orderNo: "2026-001",
      kmAtService: 150000,
      serviceDate: new Date("2026-05-02T18:57:00"),
    })
    .returning()
    .get();

  db.insert(schema.primaryAngles).values({
    recordId: record.id,
    frontCasterLeftInitial: 3.93, frontCasterLeftFinal: 4.45,
    frontCasterLeftMin: 2.37, frontCasterLeftMax: 4.42,
    frontCasterRightInitial: 3.67, frontCasterRightFinal: 4.18,
    frontCasterRightMin: 2.37, frontCasterRightMax: 4.42,
    frontCamberLeftInitial: -0.75, frontCamberLeftFinal: -1.10,
    frontCamberLeftMin: -1.95, frontCamberLeftMax: 0.58,
    frontCamberRightInitial: -1.07, frontCamberRightFinal: null,
    frontCamberRightMin: -1.95, frontCamberRightMax: 0.58,
    frontToeLeftInitial: 4.7, frontToeLeftFinal: 0.5,
    frontToeLeftMin: 0.2, frontToeLeftMax: 1.0,
    frontToeRightInitial: -0.7, frontToeRightFinal: 0.3,
    frontToeRightMin: 0.2, frontToeRightMax: 1.0,
    frontToeTotalInitial: 4.0, frontToeTotalFinal: 0.8,
    frontToeTotalMin: 0.4, frontToeTotalMax: 2.1,
    rearCamberLeftInitial: -1.55, rearCamberLeftFinal: -1.55,
    rearCamberLeftMin: -2.88, rearCamberLeftMax: -0.35,
    rearCamberRightInitial: -1.93, rearCamberRightFinal: -1.93,
    rearCamberRightMin: -2.88, rearCamberRightMax: -0.35,
    rearToeLeftInitial: 0.1, rearToeLeftFinal: 0.1,
    rearToeLeftMin: 0.8, rearToeLeftMax: 1.6,
    rearToeRightInitial: -0.6, rearToeRightFinal: -0.7,
    rearToeRightMin: 0.8, rearToeRightMax: 1.6,
    rearToeTotalInitial: -0.5, rearToeTotalFinal: -0.6,
    rearToeTotalMin: 4.6, rearToeTotalMax: 3.3,
    thrustAngleInitial: -0.05, thrustAngleFinal: -0.07,
  }).run();

  db.insert(schema.secondaryAngles).values({
    recordId: record.id,
    saiLeftInitial: 13.83, saiLeftFinal: 13.83, saiLeftMin: 13.62, saiLeftMax: 13.62,
    saiRightInitial: 13.98, saiRightFinal: 13.98, saiRightMin: 13.62, saiRightMax: 13.62,
    includedAngleLeftInitial: 13.08, includedAngleLeftFinal: 13.12,
    includedAngleRightInitial: 12.92, includedAngleRightFinal: 12.88,
    rimRunoutFrontInitial: 0, rimRunoutFrontFinal: -2,
    rimRunoutRearInitial: 11, rimRunoutRearFinal: 2,
    trackWidthDiffInitial: 2, trackWidthDiffFinal: -2,
    axleCenterDiffInitial: 12, axleCenterDiffFinal: 4,
  }).run();

  console.log("Örnek araç: 42ABC42");
  console.log("Giriş: admin@uzmanrot.com / uzmanrot2026");
}

seed().catch(console.error);
