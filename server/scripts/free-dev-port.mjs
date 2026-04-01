import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const serverDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(serverDir, ".env") });
const port = process.env.PORT || "3001";

if (process.platform === "win32") {
  process.exit(0);
}

try {
  const out = execSync(`lsof -ti :${port}`, { encoding: "utf8" }).trim();
  if (!out) process.exit(0);
  for (const pid of out.split(/\n/)) {
    if (!pid) continue;
    try {
      execSync(`kill -15 ${pid}`, { stdio: "ignore" });
    } catch {
      try {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
      } catch {
        /* ignore */
      }
    }
  }
} catch {
  /* port free or lsof unavailable */
}
