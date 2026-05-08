import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Use path relative to the bundle location or process.cwd()
  const distPath = path.resolve(process.cwd(), "dist", "public");

  console.log(`[Static] Attempting to serve static files from: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    console.error(`[Static] ERROR: Build directory NOT FOUND: ${distPath}`);
    // Fallback check
    const altPath = path.resolve(process.cwd(), "public");
    console.log(`[Static] Trying alternative path: ${altPath}`);
  }

  app.use(express.static(distPath));

  // Handle SPA routing: forward all non-API requests to index.html
  app.get("*", (req, res, next) => {
    if (req.url.startsWith("/api/")) {
      return next();
    }

    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error(`[Static] index.html NOT FOUND at ${indexPath}`);
      res.status(404).send("Frontend not found. Please ensure the build command 'npm run build' was executed.");
    }
  });
}
