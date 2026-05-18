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

  // Bind to 0.0.0.0 is critical for Cloud Run health checks
  server.listen(port, "0.0.0.0", () => {
    console.log(`[Ready] Server is live at http://0.0.0.0:${port}/`);
  });
}

// Ensure the process doesn't hang if DB is slow - let the server start FIRST
startServer().catch((err) => {
  console.error("[Fatal] Server failed to start:", err);
  process.exit(1);
});
