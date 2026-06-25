import { execSync } from "child_process";
import { resolve } from "path";

const prodUrl = process.env.PROD_DATABASE_URL;
if (!prodUrl) {
  console.error("PROD_DATABASE_URL not found in .env");
  process.exit(1);
}

console.log("Pushing schema to PRODUCTION database...");

try {
  execSync("bunx drizzle-kit push", {
    cwd: resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: prodUrl },
    stdio: "inherit",
  });
  console.log("Production schema updated successfully.");
} catch {
  console.error("Failed to push schema to production.");
  process.exit(1);
}
