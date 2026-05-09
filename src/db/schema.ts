import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "technician"] }).notNull().default("technician"),
  fullName: text("full_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Araç = Müşteri. Plaka tek zorunlu alan.
export const vehicles = sqliteTable("vehicles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plate: text("plate").notNull().unique(),
  make: text("make"),
  model: text("model"),
  km: integer("km"),
  ownerName: text("owner_name"),
  ownerPhone: text("owner_phone"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const alignmentRecords = sqliteTable("alignment_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  technicianId: integer("technician_id")
    .notNull()
    .references(() => users.id),
  orderNo: text("order_no"),
  kmAtService: integer("km_at_service"),
  serviceDate: integer("service_date", { mode: "timestamp" }).notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const primaryAngles = sqliteTable("primary_angles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recordId: integer("record_id")
    .notNull()
    .references(() => alignmentRecords.id),
  frontCasterLeftInitial: real("front_caster_left_initial"),
  frontCasterLeftFinal: real("front_caster_left_final"),
  frontCasterRightInitial: real("front_caster_right_initial"),
  frontCasterRightFinal: real("front_caster_right_final"),
  frontCasterLeftMin: real("front_caster_left_min"),
  frontCasterLeftMax: real("front_caster_left_max"),
  frontCasterRightMin: real("front_caster_right_min"),
  frontCasterRightMax: real("front_caster_right_max"),
  frontCamberLeftInitial: real("front_camber_left_initial"),
  frontCamberLeftFinal: real("front_camber_left_final"),
  frontCamberRightInitial: real("front_camber_right_initial"),
  frontCamberRightFinal: real("front_camber_right_final"),
  frontCamberLeftMin: real("front_camber_left_min"),
  frontCamberLeftMax: real("front_camber_left_max"),
  frontCamberRightMin: real("front_camber_right_min"),
  frontCamberRightMax: real("front_camber_right_max"),
  frontToeLeftInitial: real("front_toe_left_initial"),
  frontToeLeftFinal: real("front_toe_left_final"),
  frontToeRightInitial: real("front_toe_right_initial"),
  frontToeRightFinal: real("front_toe_right_final"),
  frontToeTotalInitial: real("front_toe_total_initial"),
  frontToeTotalFinal: real("front_toe_total_final"),
  frontToeLeftMin: real("front_toe_left_min"),
  frontToeLeftMax: real("front_toe_left_max"),
  frontToeRightMin: real("front_toe_right_min"),
  frontToeRightMax: real("front_toe_right_max"),
  frontToeTotalMin: real("front_toe_total_min"),
  frontToeTotalMax: real("front_toe_total_max"),
  rearCamberLeftInitial: real("rear_camber_left_initial"),
  rearCamberLeftFinal: real("rear_camber_left_final"),
  rearCamberRightInitial: real("rear_camber_right_initial"),
  rearCamberRightFinal: real("rear_camber_right_final"),
  rearCamberLeftMin: real("rear_camber_left_min"),
  rearCamberLeftMax: real("rear_camber_left_max"),
  rearCamberRightMin: real("rear_camber_right_min"),
  rearCamberRightMax: real("rear_camber_right_max"),
  rearToeLeftInitial: real("rear_toe_left_initial"),
  rearToeLeftFinal: real("rear_toe_left_final"),
  rearToeRightInitial: real("rear_toe_right_initial"),
  rearToeRightFinal: real("rear_toe_right_final"),
  rearToeTotalInitial: real("rear_toe_total_initial"),
  rearToeTotalFinal: real("rear_toe_total_final"),
  rearToeLeftMin: real("rear_toe_left_min"),
  rearToeLeftMax: real("rear_toe_left_max"),
  rearToeRightMin: real("rear_toe_right_min"),
  rearToeRightMax: real("rear_toe_right_max"),
  rearToeTotalMin: real("rear_toe_total_min"),
  rearToeTotalMax: real("rear_toe_total_max"),
  thrustAngleInitial: real("thrust_angle_initial"),
  thrustAngleFinal: real("thrust_angle_final"),
  colors: text("colors"), // JSON: { fieldKey: "red" | "yellow" | "green" }
});
