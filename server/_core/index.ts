import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./serveStatic";
import { getDb } from "../db";

async function startServer() {
  const port = parseInt(process.env.PORT || "8080");
  console.log(`[Startup] Initializing server on port ${port}...`);

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

  if (process.env.NODE_ENV === "development") {
    const viteModule = "./vite.js";
    // @ts-ignore
    const { setupVite } = await import(viteModule);
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Bind port BEFORE attempting DB connection to pass health checks
  server.listen(port, "0.0.0.0", () => {
    console.log(`[Ready] Server is listening at http://0.0.0.0:${port}/`);

    // Background DB initialization
    getDb().then(db => {
      if (db) console.log("[Database] Connected successfully in background.");
      else console.error("[Database] Failed to connect in background.");
    }).catch(err => {
      console.error("[Database] Error during background initialization:", err);
    });
  });
}

startServer().catch((err) => {
  console.error("[Fatal] Unhandled error during server startup:", err);
  process.exit(1);
});
