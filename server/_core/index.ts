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
  console.log(`Server is starting on port: ${port}`);

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
    // Dynamically import everything that might depend on Vite
    // @ts-ignore
    const { setupVite } = await import("./vite.js").catch(() => ({ setupVite: () => {} }));
    if (setupVite) await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/ (NODE_ENV: ${process.env.NODE_ENV})`);
  });
}

startServer().catch(console.error);
