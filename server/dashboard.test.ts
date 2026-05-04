import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

// Mock the database module
vi.mock("./db", () => ({
  getDashboardStats: vi.fn(),
  getIrregularitiesStats: vi.fn(),
  getRecordsByLocation: vi.fn(),
  getInspectionRecordsList: vi.fn(),
  searchInspectionRecords: vi.fn(),
  getAllInspectionRecords: vi.fn(),
  getInspectionRecordsCount: vi.fn(),
  createInspectionRecord: vi.fn(),
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

describe("dashboard API endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dashboard.stats", () => {
    it("should return dashboard statistics", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const mockStats = {
        totalRecords: 10,
        recordsWithIrregularities: 3,
      };

      vi.mocked(db.getDashboardStats).mockResolvedValueOnce(mockStats as any);

      const result = await caller.dashboard.stats();

      expect(result).toEqual(mockStats);
      expect(db.getDashboardStats).toHaveBeenCalled();
    });

    it("should handle zero records", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const mockStats = {
        totalRecords: 0,
        recordsWithIrregularities: 0,
      };

      vi.mocked(db.getDashboardStats).mockResolvedValueOnce(mockStats as any);

      const result = await caller.dashboard.stats();

      expect(result.totalRecords).toBe(0);
      expect(result.recordsWithIrregularities).toBe(0);
    });
  });

  describe("dashboard.irregularities", () => {
    it("should return irregularities statistics", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const mockIrregularities = [
        { name: "Rust on extinguisher", count: 5 },
        { name: "Blocked exit", count: 3 },
        { name: "Missing signage", count: 2 },
      ];

      vi.mocked(db.getIrregularitiesStats).mockResolvedValueOnce(
        mockIrregularities as any
      );

      const result = await caller.dashboard.irregularities();

      expect(result).toEqual(mockIrregularities);
      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe("Rust on extinguisher");
      expect(result[0]?.count).toBe(5);
      expect(db.getIrregularitiesStats).toHaveBeenCalled();
    });

    it("should handle empty irregularities", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(db.getIrregularitiesStats).mockResolvedValueOnce([]);

      const result = await caller.dashboard.irregularities();

      expect(result).toEqual([]);
    });

    it("should return sorted irregularities by count", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const mockIrregularities = [
        { name: "Issue A", count: 10 },
        { name: "Issue B", count: 5 },
        { name: "Issue C", count: 15 },
      ];

      vi.mocked(db.getIrregularitiesStats).mockResolvedValueOnce(
        mockIrregularities as any
      );

      const result = await caller.dashboard.irregularities();

      expect(result).toHaveLength(3);
      expect(result[0]?.count).toBe(10);
    });
  });

  describe("dashboard.locations", () => {
    it("should return records by location", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const mockLocations = [
        { location: "Building A, Floor 1", count: 5 },
        { location: "Building B, Floor 2", count: 8 },
        { location: "Building C, Floor 1", count: 3 },
      ];

      vi.mocked(db.getRecordsByLocation).mockResolvedValueOnce(
        mockLocations as any
      );

      const result = await caller.dashboard.locations();

      expect(result).toEqual(mockLocations);
      expect(result).toHaveLength(3);
      expect(result[0]?.location).toBe("Building A, Floor 1");
      expect(result[0]?.count).toBe(5);
      expect(db.getRecordsByLocation).toHaveBeenCalled();
    });

    it("should handle empty locations", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      vi.mocked(db.getRecordsByLocation).mockResolvedValueOnce([]);

      const result = await caller.dashboard.locations();

      expect(result).toEqual([]);
    });

    it("should return locations with correct counts", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const mockLocations = [
        { location: "Main Office", count: 20 },
        { location: "Warehouse", count: 15 },
      ];

      vi.mocked(db.getRecordsByLocation).mockResolvedValueOnce(
        mockLocations as any
      );

      const result = await caller.dashboard.locations();

      expect(result).toHaveLength(2);
      const totalCount = result.reduce((sum, loc) => sum + loc.count, 0);
      expect(totalCount).toBe(35);
    });
  });
});
