import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";

/**
 * Interface for the record format expected in the bulk import files.
 * This matches the inspection_records table fields.
 */
export interface BulkImportRecord {
  buildingId: string;
  floor?: string;
  watchNumber?: string;
  inspectionDateTime: Date | string;
  irregularities?: string;
  referralDepartmentId?: number | string;
}

export interface BulkImportResult {
  success: boolean;
  records?: BulkImportRecord[];
  errors?: string[];
  totalRecords: number;
  validRecords: number;
}

/**
 * Normalize header names (handle variations in casing and spacing)
 */
function normalizeRecord(record: any): any {
  const normalized: any = {};
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = (key as string).toLowerCase().trim().replace(/[\s\-_]/g, "");
    normalized[normalizedKey] = value;
  }
  return normalized;
}

/**
 * Map normalized record to BulkImportRecord
 */
function mapToBulkImportRecord(normalized: any): BulkImportRecord {
  // Try various header names for each field
  const buildingId = normalized["buildingid"] || normalized["lifipsnumber"] || normalized["building"] || "";
  const floor = normalized["floor"] || "";
  const watchNumber = normalized["watchnumber"] || normalized["watch"] || "";
  const inspectionDateTime = normalized["inspectiondatetime"] || normalized["date"] || normalized["datetime"] || "";
  const irregularities = normalized["irregularities"] || normalized["remarks"] || normalized["description"] || "";
  const referralDepartmentId = normalized["referraldepartmentid"] || normalized["referralid"] || normalized["departmentid"] || undefined;

  return {
    buildingId: String(buildingId).trim(),
    floor: floor ? String(floor).trim() : undefined,
    watchNumber: watchNumber ? String(watchNumber).trim() : undefined,
    inspectionDateTime,
    irregularities: irregularities ? String(irregularities).trim() : undefined,
    referralDepartmentId: referralDepartmentId ? Number(referralDepartmentId) : undefined,
  };
}

/**
 * Parse CSV content and extract inspection records
 */
export function parseCSV(content: string): BulkImportRecord[] {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.map((record: any) => {
    const normalized = normalizeRecord(record);
    return mapToBulkImportRecord(normalized);
  });
}

/**
 * Parse Excel file content and extract inspection records
 */
export function parseExcel(buffer: Buffer): BulkImportRecord[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const records = XLSX.utils.sheet_to_json(worksheet);

  return records.map((record: any) => {
    const normalized = normalizeRecord(record);
    return mapToBulkImportRecord(normalized);
  });
}

/**
 * Validate a single record
 */
export function validateRecord(record: BulkImportRecord): string | null {
  if (!record.buildingId || record.buildingId.trim() === "") {
    return "Missing Building ID";
  }

  // Validate DateTime
  const date = new Date(record.inspectionDateTime);
  if (isNaN(date.getTime())) {
    return `Invalid Inspection Date/Time: ${record.inspectionDateTime}`;
  }

  return null;
}

/**
 * Process and validate bulk import records
 */
export function processBulkImport(records: BulkImportRecord[]): BulkImportResult {
  const errors: string[] = [];
  const validRecords: BulkImportRecord[] = [];

  records.forEach((record, index) => {
    const error = validateRecord(record);
    if (error) {
      errors.push(`Row ${index + 2}: ${error}`);
    } else {
      // Ensure date is a proper Date object
      validRecords.push({
        ...record,
        inspectionDateTime: new Date(record.inspectionDateTime),
      });
    }
  });

  return {
    success: errors.length === 0,
    records: errors.length === 0 ? validRecords : undefined,
    errors: errors.length > 0 ? errors : undefined,
    totalRecords: records.length,
    validRecords: validRecords.length,
  };
}
