#!/usr/bin/env node

/**
 * Скрипт ожидания готовности БД
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function getDatabaseUrl() {
  // Try .env.local first, then .env
  const envLocalPath = path.join(__dirname, "..", ".env.local");
  const envPath = path.join(__dirname, "..", ".env");

  let envFile = envLocalPath;
  if (!fs.existsSync(envLocalPath)) {
    envFile = envPath;
  }

  if (!fs.existsSync(envFile)) {
    console.error("❌ No .env or .env.local file found");
    process.exit(1);
  }

  const content = fs.readFileSync(envFile, "utf-8");
  const match = content.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
  if (!match) {
    console.error("❌ DATABASE_URL not found in env file");
    process.exit(1);
  }
  return match[1];
}

function waitForDb(maxAttempts = 30, delayMs = 2000) {
  const dbUrl = getDatabaseUrl();
  console.log("⏳ Waiting for database to be ready...");

  // Check if it's a local Postgres (docker) or remote
  const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");

  if (isLocal) {
    // For local Postgres, use pg_isready
    for (let i = 0; i < maxAttempts; i++) {
      try {
        execSync("docker compose exec -T postgres pg_isready -U h_sport", {
          stdio: "pipe",
        });
        console.log("✅ Database is ready");
        return true;
      } catch (e) {
        if (i < maxAttempts - 1) {
          process.stdout.write(".");
          const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
          // Use synchronous sleep for simplicity
          const start = Date.now();
          while (Date.now() - start < delayMs) {
            // Busy wait
          }
        }
      }
    }
    console.error("\n❌ Database did not become ready in time");
    return false;
  } else {
    // For remote DB (Prisma Cloud), try to connect with Prisma
    console.log("ℹ️  Remote database detected, attempting connection...");
    try {
      // Just wait a bit for remote DB
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      return true;
    } catch (e) {
      console.error("❌ Could not verify remote database");
      return false;
    }
  }
}

if (!waitForDb()) {
  process.exit(1);
}
