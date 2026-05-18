import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth.js";
import { registerStorageProxy } from "./storageProxy.js";
import { appRouter } from "../routers.js";
import { createContext } from "./context.js";
import { serveStatic } from "./serveStatic.js";
import { getDb } from "../db.js";

async function startServer() {
  const port = parseInt(process.env.PORT || "8080");
  const isDev = process.env.NODE_ENV === "development";
  console.log(`[Startup] Mode: ${process.env.NODE_ENV}, Port: ${port}`);

  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (isDev) {
    // Dynamic import with full extension for ESM
    try {
      // @ts-ignore
      const { setupVite } = await import("./vite.js");
      await setupVite(app, server);
    } catch (e) {
      console.warn("[Vite] Failed to load development middleware:", e);
    }
  } else {
    serveStatic(app);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`[Ready] Server is live at http://0.0.0.0:${port}/`);

    // Background DB initialization to prevent health check timeout
    getDb().then(db => {
      if (db) console.log("[Database] Connected successfully.");
    }).catch(err => {
      console.error("[Database] Initialization error:", err);
    });
  });
}

startServer().catch((err) => {
  console.error("[Fatal] Startup failed:", err);
  process.exit(1);
});
