import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, datetime } from "drizzle-orm/mysql-core";

/**
 * Fire stations table - stores fire station accounts
 */
export const fireStations = mysqlTable("fire_stations", {
  id: int("id").autoincrement().primaryKey(),
  stationCode: varchar("station_code", { length: 50 }).notNull().unique(),
  stationName: varchar("station_name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FireStation = typeof fireStations.$inferSelect;
export type InsertFireStation = typeof fireStations.$inferInsert;

/**
 * Buildings table - stores all buildings for inspection
 */
export const buildings = mysqlTable("buildings", {
  id: int("id").autoincrement().primaryKey(),
  lifipsNumber: varchar("lifips_number", { length: 100 }).notNull().unique(),
  address: text("address").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  buildingType: varchar("building_type", { length: 100 }),
  riskCategory: mysqlEnum("risk_category", ["A", "A*", "B", "C", "D", "E"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Building = typeof buildings.$inferSelect;
export type InsertBuilding = typeof buildings.$inferInsert;

/**
 * Referral departments table - stores available referral departments
 */
export const referralDepartments = mysqlTable("referral_departments", {
  id: int("id").autoincrement().primaryKey(),
  departmentCode: varchar("department_code", { length: 50 }).notNull().unique(),
  departmentName: varchar("department_name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReferralDepartment = typeof referralDepartments.$inferSelect;
export type InsertReferralDepartment = typeof referralDepartments.$inferInsert;

/**
 * Fire inspection records table - updated with new fields
 */
export const inspectionRecords = mysqlTable("inspection_records", {
  id: int("id").autoincrement().primaryKey(),
  buildingId: varchar("building_id", { length: 100 }).notNull(),
  stationId: int("station_id").notNull(),
  floor: varchar("floor", { length: 50 }),
  watchNumber: varchar("watch_number", { length: 10 }),
  inspectionDateTime: datetime("inspection_datetime").notNull(),
  irregularities: text("irregularities"),
  referralDepartmentId: int("referral_department_id"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InspectionRecord = typeof inspectionRecords.$inferSelect;
export type InsertInspectionRecord = typeof inspectionRecords.$inferInsert;

/**
 * Verification records table - tracks verification of inspection records
 */
export const verificationRecords = mysqlTable("verification_records", {
  id: int("id").autoincrement().primaryKey(),
  inspectionRecordId: int("inspection_record_id").notNull(),
  verifiedByStationId: int("verified_by_station_id").notNull(),
  verificationDate: datetime("verification_date"),
  status: mysqlEnum("status", ["pending", "viewed", "verified", "rejected"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VerificationRecord = typeof verificationRecords.$inferSelect;
export type InsertVerificationRecord = typeof verificationRecords.$inferInsert;

/**
 * Risk category update records table - tracks risk category updates
 */
export const riskCategoryUpdates = mysqlTable("risk_category_updates", {
  id: int("id").autoincrement().primaryKey(),
  buildingId: varchar("building_id", { length: 100 }).notNull(),
  oldRiskCategory: mysqlEnum("old_risk_category", ["A", "A*", "B", "C", "D", "E"]),
  newRiskCategory: mysqlEnum("new_risk_category", ["A", "A*", "B", "C", "D", "E"]).notNull(),
  updatedByStationId: int("updated_by_station_id").notNull(),
  officerRank: varchar("officer_rank", { length: 50 }).notNull(),
  officerName: varchar("officer_name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RiskCategoryUpdate = typeof riskCategoryUpdates.$inferSelect;
export type InsertRiskCategoryUpdate = typeof riskCategoryUpdates.$inferInsert;

/**
 * Legacy users table - kept for backward compatibility
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
