import { describe, it, expect } from "vitest";

/**
 * Validates the insertId extraction logic used in createRiskCategoryUpdate,
 * createInspectionRecord, and createVerificationRecord.
 *
 * The drizzle-orm mysql2 driver returns either:
 * - A direct ResultSetHeader: { insertId: number, affectedRows: number, ... }
 * - An array tuple: [ResultSetHeader, undefined]
 *
 * Our extraction logic needs to handle both shapes.
 */
function extractInsertId(result: unknown): number | undefined {
  const resultArr = Array.isArray(result) ? result : [result];
  return (resultArr[0] as any)?.insertId || (result as any).insertId;
}

describe("Drizzle mysql2 insertId extraction", () => {
  it("extracts insertId from array tuple shape", () => {
    const arrShape = [
      { fieldCount: 0, affectedRows: 1, insertId: 30005, info: "", serverStatus: 2, warningStatus: 0, changedRows: 0 },
      null,
    ];
    expect(extractInsertId(arrShape)).toBe(30005);
  });

  it("extracts insertId from direct ResultSetHeader shape", () => {
    const directShape = { insertId: 42, affectedRows: 1 };
    expect(extractInsertId(directShape)).toBe(42);
  });

  it("returns undefined when insertId is missing", () => {
    expect(extractInsertId([{ affectedRows: 0 }, null])).toBeUndefined();
    expect(extractInsertId({})).toBeUndefined();
  });

  it("handles realistic mysql2 driver response format", () => {
    // Sampled from actual server log:
    // [{"fieldCount":0,"affectedRows":1,"insertId":30006,"info":"","serverStatus":2,"warningStatus":0,"changedRows":0},null]
    const realResponse = [
      {
        fieldCount: 0,
        affectedRows: 1,
        insertId: 30006,
        info: "",
        serverStatus: 2,
        warningStatus: 0,
        changedRows: 0,
      },
      null,
    ];
    expect(extractInsertId(realResponse)).toBe(30006);
  });
});
