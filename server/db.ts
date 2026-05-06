import { eq, and, or, like, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  fireStations,
  buildings,
  inspectionRecords,
  referralDepartments,
  verificationRecords,
  riskCategoryUpdates,
  InsertInspectionRecord,
  InsertFireStation,
  InsertRiskCategoryUpdate,
  Building,
  FireStation,
  ReferralDepartment,
  InspectionRecord,
  VerificationRecord,
  RiskCategoryUpdate
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
// We use a simple singleton pattern. In production, make sure DATABASE_URL is set.
export async function getDb(retryCount = 0) {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      console.warn("[Database] DATABASE_URL is not set. Database operations will fail.");
      return null;
    }

    try {
      _db = drizzle(process.env.DATABASE_URL);
      console.log("[Database] Drizzle instance initialized");
    } catch (error: any) {
      console.error("[Database] Failed to initialize Drizzle:", error?.message || error);
      _db = null;
    }
  }
  return _db;
}

// ============ Fire Station Functions ============

export async function getFireStationByCode(stationCode: string): Promise<FireStation | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(fireStations)
    .where(eq(fireStations.stationCode, stationCode))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getFireStationById(id: number): Promise<FireStation | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(fireStations)
    .where(eq(fireStations.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllFireStations(): Promise<FireStation[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(fireStations);
}

// ============ Building Functions ============

export async function getAllBuildings(): Promise<Building[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(buildings);
}

export async function getBuildingById(id: number): Promise<Building | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(buildings)
    .where(eq(buildings.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getBuildingByLifipsNumber(lifipsNumber: string): Promise<Building | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(buildings)
    .where(eq(buildings.lifipsNumber, lifipsNumber))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function searchBuildings(query: string): Promise<Building[]> {
  const db = await getDb();
  if (!db) return [];

  const searchPattern = `%${query}%`;
  return await db
    .select()
    .from(buildings)
    .where(
      or(
        like(buildings.lifipsNumber, searchPattern),
        like(buildings.address, searchPattern),
        like(buildings.location, searchPattern)
      )
    )
    .limit(100);
}

// ============ Referral Department Functions ============

export async function getAllReferralDepartments(): Promise<ReferralDepartment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(referralDepartments);
}

export async function getReferralDepartmentById(id: number): Promise<ReferralDepartment | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(referralDepartments)
    .where(eq(referralDepartments.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Inspection Record Functions ============

export async function createInspectionRecord(data: InsertInspectionRecord): Promise<InspectionRecord | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(inspectionRecords).values(data);
    const resultArr = Array.isArray(result) ? result : [result];
    const recordId = (resultArr[0] as any)?.insertId || (result as any).insertId;

    if (recordId) {
      return await db
        .select()
        .from(inspectionRecords)
        .where(eq(inspectionRecords.id, recordId as number))
        .then(rows => rows[0] || null);
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to create inspection record:", error);
    return null;
  }
}

export async function getInspectionRecordsByStation(stationId: number): Promise<InspectionRecord[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(inspectionRecords)
    .where(eq(inspectionRecords.stationId, stationId));
}

export async function searchInspectionRecords(
  stationId: number,
  query?: string,
  buildingId?: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<InspectionRecord[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(inspectionRecords.stationId, stationId)];

  if (buildingId) {
    conditions.push(eq(inspectionRecords.buildingId, buildingId));
  }

  if (dateFrom) {
    conditions.push(gte(inspectionRecords.inspectionDateTime, dateFrom));
  }

  if (dateTo) {
    conditions.push(lte(inspectionRecords.inspectionDateTime, dateTo));
  }

  return await db
    .select()
    .from(inspectionRecords)
    .where(and(...conditions));
}

export async function getAllInspectionRecords(): Promise<InspectionRecord[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(inspectionRecords);
}

// ============ Verification Record Functions ============

export async function createVerificationRecord(data: any): Promise<VerificationRecord | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(verificationRecords).values(data);
    const resultArr = Array.isArray(result) ? result : [result];
    const recordId = (resultArr[0] as any)?.insertId || (result as any).insertId;

    if (recordId) {
      return await db
        .select()
        .from(verificationRecords)
        .where(eq(verificationRecords.id, recordId as number))
        .then(rows => rows[0] || null);
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to create verification record:", error);
    return null;
  }
}

export async function getVerificationRecordsByStation(stationId: number): Promise<VerificationRecord[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(verificationRecords)
    .where(eq(verificationRecords.verifiedByStationId, stationId));
}

export async function updateVerificationRecord(
  recordId: number,
  data: Partial<VerificationRecord>
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(verificationRecords)
      .set(data)
      .where(eq(verificationRecords.id, recordId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update verification record:", error);
    return false;
  }
}

// ============ Legacy User Functions ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Risk Category Update Functions ============

export async function createRiskCategoryUpdate(data: InsertRiskCategoryUpdate): Promise<RiskCategoryUpdate | null> {
  const db = await getDb();
  if (!db) {
    console.error("[Database] No DB connection in createRiskCategoryUpdate");
    throw new Error("No database connection");
  }

  try {
    console.log("[Database] Inserting risk category update:", JSON.stringify(data));
    const result = await db.insert(riskCategoryUpdates).values(data);
    console.log("[Database] Insert result:", JSON.stringify(result));
    // Drizzle mysql2 returns [ResultSetHeader, undefined]; extract from first element
    const resultArr = Array.isArray(result) ? result : [result];
    const recordId = (resultArr[0] as any)?.insertId || (result as any).insertId;

    if (recordId) {
      const rows = await db
        .select()
        .from(riskCategoryUpdates)
        .where(eq(riskCategoryUpdates.id, recordId as number));
      return rows[0] || null;
    }
    return null;
  } catch (error: any) {
    console.error("[Database] Failed to create risk category update:", error?.message || error);
    console.error("[Database] Data was:", JSON.stringify(data));
    if (error?.cause) console.error("[Database] Cause:", error.cause?.message || JSON.stringify(error.cause));
    if (error?.sqlMessage) console.error("[Database] SQL Message:", error.sqlMessage);
    if (error?.code) console.error("[Database] Code:", error.code);
    throw error;
  }
}

export async function getRiskCategoryUpdatesByBuilding(buildingId: string): Promise<RiskCategoryUpdate[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(riskCategoryUpdates)
    .where(eq(riskCategoryUpdates.buildingId, buildingId));
}

export async function updateBuildingRiskCategory(buildingId: string, newRiskCategory: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(buildings)
      .set({ riskCategory: newRiskCategory as any })
      .where(eq(buildings.lifipsNumber, buildingId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update building risk category:", error);
    return false;
  }
}
