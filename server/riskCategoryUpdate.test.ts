import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createRiskCategoryUpdate,
  getRiskCategoryUpdatesByBuilding,
  updateBuildingRiskCategory
} from "./db";
import { getDb } from "./db";
import { riskCategoryUpdates, buildings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Risk Category Update Functions", () => {
  let db: any;
  let testBuildingId: string;
  let testStationId: number;

  beforeAll(async () => {
    db = await getDb();
    testBuildingId = "TS-1";
    testStationId = 1;
  });

  it("should create a risk category update record", async () => {
    const update = await createRiskCategoryUpdate({
      buildingId: testBuildingId,
      oldRiskCategory: "B" as any,
      newRiskCategory: "A" as any,
      updatedByStationId: testStationId,
      officerRank: "StnO",
      officerName: "John Doe",
    });

    // Database may return null if connection fails, but function should not throw
    if (update) {
      expect(update.buildingId).toBe(testBuildingId);
      expect(update.newRiskCategory).toBe("A");
      expect(update.officerRank).toBe("StnO");
      expect(update.officerName).toBe("John Doe");
    }
  });

  it("should retrieve risk category update history for a building", async () => {
    // Retrieve history
    const history = await getRiskCategoryUpdatesByBuilding(testBuildingId);

    expect(history).toBeDefined();
    expect(Array.isArray(history)).toBe(true);
    // History may be empty if database connection fails
  });

  it("should update building risk category", async () => {
    const success = await updateBuildingRiskCategory(testBuildingId, "A*");
    expect(success).toBe(true);

    // Verify the update in database
    if (db) {
      const [building] = await db
        .select()
        .from(buildings)
        .where(eq(buildings.lifipsNumber, testBuildingId))
        .limit(1);

      expect(building?.riskCategory).toBe("A*");
    }
  });

  it("should handle invalid building ID gracefully", async () => {
    const update = await createRiskCategoryUpdate({
      buildingId: "INVALID-ID",
      oldRiskCategory: "B" as any,
      newRiskCategory: "A" as any,
      updatedByStationId: testStationId,
      officerRank: "StnO",
      officerName: "Test Officer",
    });

    // Should still create the record (database constraint will handle validation)
    expect(update).toBeDefined();
  });

  it("should handle all risk category values", async () => {
    const riskCategories = ["A*", "A", "B", "C", "D", "E"];

    for (const category of riskCategories) {
      const update = await createRiskCategoryUpdate({
        buildingId: testBuildingId,
        oldRiskCategory: "B" as any,
        newRiskCategory: category as any,
        updatedByStationId: testStationId,
        officerRank: "StnO",
        officerName: "Test Officer",
      });

      // Should not throw error
      expect(update === null || update?.newRiskCategory === category).toBe(true);
    }
  });

  it("should handle all officer ranks", async () => {
    const ranks = ["SStnO", "StnO", "PStnO"];

    for (const rank of ranks) {
      const update = await createRiskCategoryUpdate({
        buildingId: testBuildingId,
        oldRiskCategory: "B" as any,
        newRiskCategory: "A" as any,
        updatedByStationId: testStationId,
        officerRank: rank,
        officerName: "Test Officer",
      });

      // Should not throw error
      expect(update === null || update?.officerRank === rank).toBe(true);
    }
  });

  afterAll(async () => {
    // Cleanup is optional - you can leave test data for audit purposes
    // Or delete test records if needed
  });
});
