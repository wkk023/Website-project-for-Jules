import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

// Mock the database module
vi.mock("./db", () => ({
  createInspectionRecord: vi.fn(),
  getInspectionRecordsList: vi.fn(),
  searchInspectionRecords: vi.fn(),
  getAllInspectionRecords: vi.fn(),
  getInspectionRecordsCount: vi.fn(),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("inspection API endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("inspection.submit", () => {
    it("should reject submission with missing required fields", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.inspection.submit({
          lifipsNumber: "",
          address: "",
          location: "",
          fsiInspected: "",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("required");
      }
    });

    it("should accept valid inspection record submission", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(db.createInspectionRecord).mockResolvedValueOnce({
        insertId: 1,
        affectedRows: 1,
      } as any);

      const input = {
        lifipsNumber: "LIFIPS-2024-001",
        address: "123 Main Street, City",
        location: "Building A, Floor 3",
        fsiInspected: "Fire extinguishers, Sprinkler system, Emergency exits",
        irregularities: "Minor rust on extinguisher",
      };

      const result = await caller.inspection.submit(input);

      expect(result).toEqual({ success: true });
      expect(db.createInspectionRecord).toHaveBeenCalledWith({
        lifipsNumber: input.lifipsNumber,
        address: input.address,
        location: input.location,
        fsiInspected: input.fsiInspected,
        irregularities: input.irregularities,
      });
    });

    it("should handle optional irregularities field", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(db.createInspectionRecord).mockResolvedValueOnce({
        insertId: 2,
        affectedRows: 1,
      } as any);

      const input = {
        lifipsNumber: "LIFIPS-2024-002",
        address: "456 Oak Avenue",
        location: "Building B",
        fsiInspected: "Fire doors, Alarm system",
      };

      const result = await caller.inspection.submit(input);

      expect(result).toEqual({ success: true });
      expect(db.createInspectionRecord).toHaveBeenCalledWith({
        lifipsNumber: input.lifipsNumber,
        address: input.address,
        location: input.location,
        fsiInspected: input.fsiInspected,
        irregularities: null,
      });
    });
  });

  describe("inspection.list", () => {
    it("should return paginated records with count", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const mockRecords = [
        {
          id: 1,
          lifipsNumber: "LIFIPS-001",
          address: "123 Main St",
          location: "Building A",
          fsiInspected: "Extinguishers",
          irregularities: null,
          createdAt: new Date("2024-04-24"),
          updatedAt: new Date("2024-04-24"),
        },
      ];

      vi.mocked(db.getInspectionRecordsList).mockResolvedValueOnce(mockRecords as any);
      vi.mocked(db.getInspectionRecordsCount).mockResolvedValueOnce(1);

      const result = await caller.inspection.list({ limit: 100, offset: 0 });

      expect(result.records).toEqual(mockRecords);
      expect(result.count).toBe(1);
      expect(db.getInspectionRecordsList).toHaveBeenCalledWith(100, 0);
      expect(db.getInspectionRecordsCount).toHaveBeenCalled();
    });

    it("should use default pagination parameters", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(db.getInspectionRecordsList).mockResolvedValueOnce([]);
      vi.mocked(db.getInspectionRecordsCount).mockResolvedValueOnce(0);

      await caller.inspection.list({});

      expect(db.getInspectionRecordsList).toHaveBeenCalledWith(100, 0);
    });
  });

  describe("inspection.search", () => {
    it("should search records by LIFIPS number", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const mockRecords = [
        {
          id: 1,
          lifipsNumber: "LIFIPS-001",
          address: "123 Main St",
          location: "Building A",
          fsiInspected: "Extinguishers",
          irregularities: null,
          createdAt: new Date("2024-04-24"),
          updatedAt: new Date("2024-04-24"),
        },
      ];

      vi.mocked(db.searchInspectionRecords).mockResolvedValueOnce(mockRecords as any);

      const result = await caller.inspection.search({
        query: "LIFIPS-001",
        searchFields: ["lifipsNumber"],
        limit: 100,
        offset: 0,
      });

      expect(result.records).toEqual(mockRecords);
      expect(db.searchInspectionRecords).toHaveBeenCalledWith(
        "LIFIPS-001",
        ["lifipsNumber"],
        100,
        0
      );
    });

    it("should search records by address", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const mockRecords = [
        {
          id: 2,
          lifipsNumber: "LIFIPS-002",
          address: "456 Oak Ave",
          location: "Building B",
          fsiInspected: "Alarm system",
          irregularities: "Minor issue",
          createdAt: new Date("2024-04-24"),
          updatedAt: new Date("2024-04-24"),
        },
      ];

      vi.mocked(db.searchInspectionRecords).mockResolvedValueOnce(mockRecords as any);

      const result = await caller.inspection.search({
        query: "Oak",
        searchFields: ["address"],
        limit: 100,
        offset: 0,
      });

      expect(result.records).toEqual(mockRecords);
      expect(db.searchInspectionRecords).toHaveBeenCalledWith(
        "Oak",
        ["address"],
        100,
        0
      );
    });

    it("should search by multiple fields", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(db.searchInspectionRecords).mockResolvedValueOnce([]);

      await caller.inspection.search({
        query: "test",
        searchFields: ["lifipsNumber", "address", "location"],
        limit: 100,
        offset: 0,
      });

      expect(db.searchInspectionRecords).toHaveBeenCalledWith(
        "test",
        ["lifipsNumber", "address", "location"],
        100,
        0
      );
    });
  });

  describe("inspection.export", () => {
    it("should return all records for export", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const mockRecords = [
        {
          id: 1,
          lifipsNumber: "LIFIPS-001",
          address: "123 Main St",
          location: "Building A",
          fsiInspected: "Extinguishers",
          irregularities: null,
          createdAt: new Date("2024-04-24"),
          updatedAt: new Date("2024-04-24"),
        },
        {
          id: 2,
          lifipsNumber: "LIFIPS-002",
          address: "456 Oak Ave",
          location: "Building B",
          fsiInspected: "Alarm system",
          irregularities: "Minor issue",
          createdAt: new Date("2024-04-24"),
          updatedAt: new Date("2024-04-24"),
        },
      ];

      vi.mocked(db.getAllInspectionRecords).mockResolvedValueOnce(mockRecords as any);

      const result = await caller.inspection.export();

      expect(result).toEqual(mockRecords);
      expect(db.getAllInspectionRecords).toHaveBeenCalled();
    });

    it("should handle empty export", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(db.getAllInspectionRecords).mockResolvedValueOnce([]);

      const result = await caller.inspection.export();

      expect(result).toEqual([]);
    });
  });
});
