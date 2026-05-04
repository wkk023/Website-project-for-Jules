import { describe, it, expect } from "vitest";
import { parseCSV, validateRecord, processBulkImport, BulkImportRecord } from "./bulkImport";

describe("Bulk Import", () => {
  describe("validateRecord", () => {
    it("should validate a correct record", () => {
      const record: BulkImportRecord = {
        buildingId: "TS-1",
        address: "Tsuen Nam Road 15-35",
        location: "Grandway Block 1-3",
        buildingType: "Domestic Building (住宅)",
        riskCategory: "E",
      };
      expect(validateRecord(record)).toBeNull();
    });

    it("should reject missing buildingId", () => {
      const record: BulkImportRecord = {
        buildingId: "",
        address: "Tsuen Nam Road 15-35",
        location: "Grandway Block 1-3",
        buildingType: "Domestic Building (住宅)",
        riskCategory: "E",
      };
      expect(validateRecord(record)).toBe("Missing Building ID");
    });

    it("should reject missing address", () => {
      const record: BulkImportRecord = {
        buildingId: "TS-1",
        address: "",
        location: "Grandway Block 1-3",
        buildingType: "Domestic Building (住宅)",
        riskCategory: "E",
      };
      expect(validateRecord(record)).toBe("Missing Address");
    });

    it("should reject invalid risk category", () => {
      const record: BulkImportRecord = {
        buildingId: "TS-1",
        address: "Tsuen Nam Road 15-35",
        location: "Grandway Block 1-3",
        buildingType: "Domestic Building (住宅)",
        riskCategory: "F",
      };
      expect(validateRecord(record)).toContain("Invalid Risk Category");
    });

    it("should accept all valid risk categories", () => {
      const validCategories = ["A*", "A", "B", "C", "D", "E"];
      validCategories.forEach((category) => {
        const record: BulkImportRecord = {
          buildingId: "TS-1",
          address: "Tsuen Nam Road 15-35",
          location: "Grandway Block 1-3",
          buildingType: "Domestic Building (住宅)",
          riskCategory: category,
        };
        expect(validateRecord(record)).toBeNull();
      });
    });
  });

  describe("processBulkImport", () => {
    it("should process valid records successfully", () => {
      const records: BulkImportRecord[] = [
        {
          buildingId: "TS-1",
          address: "Tsuen Nam Road 15-35",
          location: "Grandway Block 1-3",
          buildingType: "Domestic Building (住宅)",
          riskCategory: "E",
        },
        {
          buildingId: "TS-2",
          address: "Main Street 1-10",
          location: "Building A",
          buildingType: "Commercial (商業)",
          riskCategory: "A",
        },
      ];

      const result = processBulkImport(records);
      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(2);
      expect(result.validRecords).toBe(2);
      expect(result.records).toHaveLength(2);
      expect(result.errors).toBeUndefined();
    });

    it("should reject all records if any are invalid", () => {
      const records: BulkImportRecord[] = [
        {
          buildingId: "TS-1",
          address: "Tsuen Nam Road 15-35",
          location: "Grandway Block 1-3",
          buildingType: "Domestic Building (住宅)",
          riskCategory: "E",
        },
        {
          buildingId: "", // Invalid
          address: "Main Street 1-10",
          location: "Building A",
          buildingType: "Commercial (商業)",
          riskCategory: "A",
        },
      ];

      const result = processBulkImport(records);
      expect(result.success).toBe(false);
      expect(result.totalRecords).toBe(2);
      expect(result.validRecords).toBe(1);
      expect(result.records).toBeUndefined();
      expect(result.errors).toHaveLength(1);
    });

    it("should provide detailed error messages", () => {
      const records: BulkImportRecord[] = [
        {
          buildingId: "",
          address: "",
          location: "Grandway Block 1-3",
          buildingType: "Domestic Building (住宅)",
          riskCategory: "E",
        },
      ];

      const result = processBulkImport(records);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe("parseCSV", () => {
    it("should parse CSV content correctly", () => {
      const csvContent = `Building ID,Address,Location,Building Type,Risk Category
TS-1,Tsuen Nam Road 15-35,Grandway Block 1-3,Domestic Building (住宅),E
TS-2,Main Street 1-10,Building A,Commercial (商業),A`;

      const records = parseCSV(csvContent);
      expect(records).toHaveLength(2);
      expect(records[0].buildingId).toBe("TS-1");
      expect(records[0].riskCategory).toBe("E");
      expect(records[1].buildingId).toBe("TS-2");
      expect(records[1].riskCategory).toBe("A");
    });
  });
});
