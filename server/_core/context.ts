import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getFireStationByCode } from "../db";
import { COOKIE_NAME, FIRE_STATION_COOKIE_NAME } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | FireStationUser | null;
};

export type FireStationUser = {
  id: number;
  stationCode: string;
  stationName: string;
  type: "fire_station";
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | FireStationUser | null = null;

  try {
    // First try to authenticate as OAuth user
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // If OAuth fails, try to authenticate as fire station.
    // Look in cookie first, then in Authorization header (fallback for
    // iframes / iOS Safari that block 3rd-party cookies).
    try {
      const authHeader = opts.req.headers?.authorization;
      const bearerToken = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7).trim()
        : null;
      const stationCode =
        opts.req.cookies?.[FIRE_STATION_COOKIE_NAME] || bearerToken;
      if (stationCode) {
        const station = await getFireStationByCode(stationCode);
        if (station) {
          user = {
            id: station.id,
            stationCode: station.stationCode,
            stationName: station.stationName,
            type: "fire_station",
          };
        }
      }
    } catch (stationError) {
      // Silently fail, user remains null
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
