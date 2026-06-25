import { execSync } from "child_process";
import { resolve } from "path";

const target = process.argv[2] as "prod" | "preview";

if (target !== "prod" && target !== "preview") {
  console.error("Usage: bun run db:push:<target>");
  console.error("  target: 'prod' or 'preview'");
  process.exit(1);
}

const envKey = target === "prod" ? "PROD_DATABASE_URL" : "PREVIEW_DATABASE_URL";
const url = process.env[envKey];

if (!url) {
  console.error(`${envKey} not found in .env`);
  process.exit(1);
}

console.log(`Pushing schema to ${target.toUpperCase()} database...`);

try {
  execSync("bunx drizzle-kit push", {
    cwd: resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  });
  console.log(`${target.toUpperCase()} schema updated successfully.`);
} catch {
  console.error(`Failed to push schema to ${target}.`);
  process.exit(1);
}
