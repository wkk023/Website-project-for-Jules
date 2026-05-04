import { COOKIE_NAME, FIRE_STATION_COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  getFireStationByCode,
  getFireStationById,
  getAllFireStations,
  getAllReferralDepartments,
  getReferralDepartmentById,
  createInspectionRecord,
  getInspectionRecordsByStation,
  searchInspectionRecords,
  getAllInspectionRecords,
  getVerificationRecordsByStation,
  updateVerificationRecord,
  createVerificationRecord,
  createRiskCategoryUpdate,
  getRiskCategoryUpdatesByBuilding,
  updateBuildingRiskCategory,
} from "./db";
import {
  searchBuildings as searchBuildingsFromCSV,
  getBuildingById as getBuildingByIdFromCSV,
  getAllBuildings as getAllBuildingsFromCSV,
} from "./buildings";

export const appRouter = router({
  system: systemRouter,

  // ============ Authentication Router ============
  auth: router({
    login: publicProcedure
      .input(
        z.object({
          stationCode: z.string().min(1, "Station code is required"),
          password: z.string().min(1, "Password is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const station = await getFireStationByCode(input.stationCode);

          if (!station) {
            throw new Error("Invalid station code or password");
          }

          const passwordMatch = await bcrypt.compare(input.password, station.passwordHash);

          if (!passwordMatch) {
            throw new Error("Invalid station code or password");
          }

          // Set session cookie with station code (works for desktop browsers)
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(FIRE_STATION_COOKIE_NAME, station.stationCode, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
          });

          // Also return token in body so frontend can store in localStorage
          // and send via Authorization header — fallback for iframes / iOS Safari
          // that block 3rd-party cookies
          return {
            success: true,
            stationId: station.id,
            stationCode: station.stationCode,
            stationName: station.stationName,
            token: station.stationCode,
          };
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        }
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(FIRE_STATION_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    me: publicProcedure.query(async ({ ctx }) => {
      // Try to get station from session
      const stationCode = (ctx.req.cookies?.[FIRE_STATION_COOKIE_NAME] || (typeof ctx.req.headers?.authorization === 'string' && ctx.req.headers.authorization.startsWith('Bearer ') ? ctx.req.headers.authorization.substring(7).trim() : null));
      if (stationCode) {
        try {
          const station = await getFireStationByCode(stationCode);
          return station ? { id: station.id, stationCode: station.stationCode, stationName: station.stationName, type: 'fire_station' } : null;
        } catch (e) {
          console.error('Error getting station:', e);
          return null;
        }
      }
      return null;
    }),
  }),

  // ============ Building Router ============
  building: router({
    list: publicProcedure.query(async () => {
      return getAllBuildingsFromCSV();
    }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return searchBuildingsFromCSV(input.query);
      }),

    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return getBuildingByIdFromCSV(input.id);
      }),
  }),

  // ============ Referral Department Router ============
  referralDepartment: router({
    list: publicProcedure.query(async () => {
      const departments = await getAllReferralDepartments();
      return departments;
    }),
  }),

  // ============ Inspection Router ============
  inspection: router({
    submit: publicProcedure
      .input(
        z.object({
          buildingId: z.string().min(1, "Building is required"),
          floor: z.string().optional(),
          watchNumber: z.string().optional(),
          inspectionDateTime: z.date(),
          irregularities: z.string().optional(),
          referralDepartmentId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Get station from context
          const stationCode = (ctx.req.cookies?.[FIRE_STATION_COOKIE_NAME] || (typeof ctx.req.headers?.authorization === 'string' && ctx.req.headers.authorization.startsWith('Bearer ') ? ctx.req.headers.authorization.substring(7).trim() : null));
          if (!stationCode) {
            throw new Error("Not authenticated");
          }

          const station = await getFireStationByCode(stationCode);

          if (!station) {
            throw new Error("Invalid station");
          }

          const building = await getBuildingByIdFromCSV(input.buildingId);
          if (!building) {
            throw new Error("Invalid building");
          }

          const record = await createInspectionRecord({
            buildingId: input.buildingId,
            stationId: station.id,
            floor: input.floor || null,
            watchNumber: input.watchNumber || null,
            inspectionDateTime: input.inspectionDateTime,
            irregularities: input.irregularities || null,
            referralDepartmentId: input.referralDepartmentId || null,
          });

          return { success: true, recordId: record?.id };
        } catch (error) {
          console.error("Error submitting inspection record:", error);
          throw error;
        }
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      try {
        const stationCode = (ctx.req.cookies?.[FIRE_STATION_COOKIE_NAME] || (typeof ctx.req.headers?.authorization === 'string' && ctx.req.headers.authorization.startsWith('Bearer ') ? ctx.req.headers.authorization.substring(7).trim() : null));
        if (!stationCode) {
          throw new Error("Not authenticated");
        }

        const station = await getFireStationByCode(stationCode);
        if (!station) {
          throw new Error("Invalid station");
        }

        const records = await getInspectionRecordsByStation(station.id);
        return records;
      } catch (error) {
        console.error("Error listing inspection records:", error);
        throw error;
      }
    }),

    search: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          buildingId: z.string().optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          const stationCode = (ctx.req.cookies?.[FIRE_STATION_COOKIE_NAME] || (typeof ctx.req.headers?.authorization === 'string' && ctx.req.headers.authorization.startsWith('Bearer ') ? ctx.req.headers.authorization.substring(7).trim() : null));
          if (!stationCode) {
            throw new Error("Not authenticated");
          }

          const station = await getFireStationByCode(stationCode);
          if (!station) {
            throw new Error("Invalid station");
          }

          const records = await searchInspectionRecords(
            station.id,
            input.query,
            input.buildingId,
            input.dateFrom,
            input.dateTo
          );
          return records;
        } catch (error) {
          console.error("Error searching inspection records:", error);
          throw error;
        }
      }),

    export: publicProcedure.query(async ({ ctx }) => {
      try {
        const stationCode = (ctx.req.cookies?.[FIRE_STATION_COOKIE_NAME] || (typeof ctx.req.headers?.authorization === 'string' && ctx.req.headers.authorization.startsWith('Bearer ') ? ctx.req.headers.authorization.substring(7).trim() : null));
        if (!stationCode) {
          throw new Error("Not authenticated");
        }

        const station = await getFireStationByCode(stationCode);
        if (!station) {
          throw new Error("Invalid station");
        }

        const records = await getInspectionRecordsByStation(station.id);
        return records;
      } catch (error) {
        console.error("Error exporting inspection records:", error);
        throw error;
      }
    }),
  }),

  // ============ Verification Router ============
  verification: router({
    getRecords: publicProcedure.query(async ({ ctx }) => {
      try {
        const stationCode = (ctx.req.cookies?.[FIRE_STATION_COOKIE_NAME] || (typeof ctx.req.headers?.authorization === 'string' && ctx.req.headers.authorization.startsWith('Bearer ') ? ctx.req.headers.authorization.substring(7).trim() : null));
        if (!stationCode) {
          throw new Error("Not authenticated");
        }

        const station = await getFireStationByCode(stationCode);
        if (!station) {
          throw new Error("Invalid station");
        }

        const records = await getVerificationRecordsByStation(station.id);
        return records;
      } catch (error) {
        console.error("Error getting verification records:", error);
        throw error;
      }
    }),

    markViewed: publicProcedure
      .input(z.object({ recordId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const success = await updateVerificationRecord(input.recordId, {
            status: "viewed",
            verificationDate: new Date(),
          });
          return { success };
        } catch (error) {
          console.error("Error marking verification record as viewed:", error);
          throw error;
        }
      }),

    verify: publicProcedure
      .input(
        z.object({
          recordId: z.number(),
          status: z.enum(["verified", "rejected"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const success = await updateVerificationRecord(input.recordId, {
            status: input.status,
            verificationDate: new Date(),
            notes: input.notes || null,
          });
          return { success };
        } catch (error) {
          console.error("Error verifying record:", error);
          throw error;
        }
      }),
  }),

  // ============ Buildings Router ============
  buildings: router({
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => {
        return searchBuildingsFromCSV(input.query);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        return getBuildingByIdFromCSV(input.id);
      }),

    getAll: publicProcedure.query(() => {
      return getAllBuildingsFromCSV();
    }),
  }),

  // ============ Dashboard Router ============
  dashboard: router({
    stats: publicProcedure.query(async ({ ctx }) => {
      try {
        const stationCode = (ctx.req.cookies?.[FIRE_STATION_COOKIE_NAME] || (typeof ctx.req.headers?.authorization === 'string' && ctx.req.headers.authorization.startsWith('Bearer ') ? ctx.req.headers.authorization.substring(7).trim() : null));
        if (!stationCode) {
          throw new Error("Not authenticated");
        }

        const station = await getFireStationByCode(stationCode);
        if (!station) {
          throw new Error("Invalid station");
        }

        const records = await getInspectionRecordsByStation(station.id);
        const verifications = await getVerificationRecordsByStation(station.id);

        // Calculate monthly trends (last 6 months)
        const monthlyTrends: Record<string, number> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = d.toLocaleString('default', { month: 'short' });
          monthlyTrends[monthKey] = 0;
        }

        records.forEach(r => {
          const d = new Date(r.inspectionDateTime);
          const monthKey = d.toLocaleString('default', { month: 'short' });
          if (monthlyTrends.hasOwnProperty(monthKey)) {
            monthlyTrends[monthKey]++;
          }
        });

        const trendData = Object.entries(monthlyTrends).map(([month, count]) => ({
          month,
          count,
        }));

        // Calculate verification status distribution
        const verificationStats = [
          { name: "Verified", value: verifications.filter(v => v.status === "verified").length },
          { name: "Pending", value: verifications.filter(v => v.status === "pending" || v.status === "viewed").length },
          { name: "Rejected", value: verifications.filter(v => v.status === "rejected").length },
        ].filter(s => s.value > 0);

        return {
          totalInspections: records.length,
          totalVerifications: verifications.length,
          verifiedCount: verifications.filter(v => v.status === "verified").length,
          pendingVerifications: verifications.filter(v => v.status === "pending" || v.status === "viewed").length,
          trendData,
          verificationStats,
        };
      } catch (error) {
        console.error("Error getting dashboard stats:", error);
        throw error;
      }
    }),
  }),

  // ============ Risk Category Update Router ============
  riskCategoryUpdate: router({
    update: publicProcedure
      .input(
        z.object({
          buildingId: z.string().min(1, "Building ID is required"),
          newRiskCategory: z.enum(["A", "A*", "B", "C", "D", "E"]),
          officerRank: z.enum(["SStnO", "StnO", "PStnO"]),
          officerName: z.string().min(1, "Officer name is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const stationCode = (ctx.req.cookies?.[FIRE_STATION_COOKIE_NAME] || (typeof ctx.req.headers?.authorization === 'string' && ctx.req.headers.authorization.startsWith('Bearer ') ? ctx.req.headers.authorization.substring(7).trim() : null));
          if (!stationCode) {
            throw new Error("Not authenticated");
          }

          const station = await getFireStationByCode(stationCode);
          if (!station) {
            throw new Error("Invalid station");
          }

          const building = await getBuildingByIdFromCSV(input.buildingId);
          if (!building) {
            throw new Error("Invalid building");
          }

          // Create risk category update record
          const update = await createRiskCategoryUpdate({
            buildingId: input.buildingId,
            oldRiskCategory: building.riskCategory as any,
            newRiskCategory: input.newRiskCategory as any,
            updatedByStationId: station.id,
            officerRank: input.officerRank,
            officerName: input.officerName,
          });

          if (!update) {
            throw new Error("Failed to create risk category update record");
          }

          // Try to update building risk category in DB (buildings are mostly from CSV, so this may not affect anything)
          await updateBuildingRiskCategory(input.buildingId, input.newRiskCategory).catch((e) => {
            console.warn("Building not in DB, only update record saved:", e);
          });

          return {
            success: true,
            updateId: update.id,
            message: `Risk category updated from ${building.riskCategory} to ${input.newRiskCategory}`,
          };
        } catch (error) {
          console.error("Error updating risk category:", error);
          throw error;
        }
      }),

    getHistory: publicProcedure
      .input(z.object({ buildingId: z.string() }))
      .query(async ({ input }) => {
        try {
          return await getRiskCategoryUpdatesByBuilding(input.buildingId);
        } catch (error) {
          console.error("Error getting risk category history:", error);
          throw error;
        }
      }),
  }),

  // ============ Monthly Verification Router ============
  monthlyVerification: router({
    generateVerifications: publicProcedure.query(async ({ ctx }) => {
      try {
        const stationCode = (ctx.req.cookies?.[FIRE_STATION_COOKIE_NAME] || (typeof ctx.req.headers?.authorization === 'string' && ctx.req.headers.authorization.startsWith('Bearer ') ? ctx.req.headers.authorization.substring(7).trim() : null));
        if (!stationCode) {
          throw new Error("Not authenticated");
        }

        const currentStation = await getFireStationByCode(stationCode);
        if (!currentStation) {
          throw new Error("Invalid station");
        }

        // Get all fire stations
        const allStations = await getAllFireStations();
        const otherStations = allStations.filter((s: any) => s.id !== currentStation.id);

        // For each other station, get 5 random records
        const verificationRecords: any[] = [];
        for (const otherStation of otherStations) {
          const stationRecords = await getInspectionRecordsByStation(otherStation.id);

          // Shuffle and take 5 random records
          const shuffled = stationRecords.sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, 5);

          // Create verification records
          for (const record of selected) {
            const verification = await createVerificationRecord({
              inspectionRecordId: record.id,
              verifiedByStationId: currentStation.id,
              status: "pending",
              verificationDate: null,
              notes: null,
            });
            if (verification) {
              verificationRecords.push(verification);
            }
          }
        }

        return {
          success: true,
          recordsGenerated: verificationRecords.length,
          records: verificationRecords,
        };
      } catch (error) {
        console.error("Error generating monthly verifications:", error);
        throw error;
      }
    }),
   }),

  // ============ Bulk Import Router ============
  bulkImport: router({
    import: publicProcedure
      .input(
        z.object({
          fileContent: z.string(),
          fileType: z.enum(["csv", "xlsx"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const stationCode = (ctx.req.cookies?.[FIRE_STATION_COOKIE_NAME] || (typeof ctx.req.headers?.authorization === 'string' && ctx.req.headers.authorization.startsWith('Bearer ') ? ctx.req.headers.authorization.substring(7).trim() : null));
          if (!stationCode) {
            throw new Error("Not authenticated");
          }

          const { parseCSV, parseExcel, processBulkImport } = await import("./bulkImport");
          let records;

          if (input.fileType === "csv") {
            records = parseCSV(input.fileContent);
          } else {
            // For Excel, we need to handle buffer differently
            const buffer = Buffer.from(input.fileContent, "base64");
            records = parseExcel(buffer);
          }

          const result = processBulkImport(records);

          if (result.success && result.records) {
            const station = await getFireStationByCode(stationCode);
            if (!station) throw new Error("Invalid station");

            // Batch insert records to database
            for (const record of result.records) {
              await createInspectionRecord({
                buildingId: record.buildingId,
                stationId: station.id,
                floor: record.floor || null,
                watchNumber: record.watchNumber || null,
                inspectionDateTime: new Date(record.inspectionDateTime),
                irregularities: record.irregularities || null,
                referralDepartmentId: record.referralDepartmentId ? Number(record.referralDepartmentId) : null,
              });
            }
          }

          return result;
        } catch (error) {
          console.error("Error importing bulk records:", error);
          throw error;
        }
      }),
  }),
});
export type AppRouter = typeof appRouter;
