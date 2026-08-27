import dotenv from "dotenv";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import { ChemistryDatabase } from "./db/database.js";
import { ChemistryEngineClient } from "./services/chemistryEngineClient.js";
import { createExpressApp } from "./api/index.js";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);
const ENGINE_URL = process.env.PYTHON_ENGINE_URL || "http://127.0.0.1:8000";
const DATABASE_PATH = process.env.DATABASE_PATH || "chem_cache.db";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["*"];

let pythonProcess: ChildProcess | null = null;

async function ensurePythonEngine(engineUrl: string): Promise<void> {
  const client = new ChemistryEngineClient(engineUrl);
  const health = await client.checkHealth();
  if (health.healthy) {
    console.log(`[Python Engine] Already running at ${engineUrl} (RDKit v${health.rdkitVersion})`);
    return;
  }

  console.log(`[Python Engine] Starting local Python RDKit microservice...`);
  
  // Look for python executable in .venv or system
  const venvPython = process.platform === "win32"
    ? path.join(process.cwd(), ".venv", "Scripts", "python.exe")
    : path.join(process.cwd(), ".venv", "bin", "python");

  const pyExec = fs.existsSync(venvPython) ? venvPython : (process.platform === "win32" ? "py" : "python3");
  const engineMain = path.join(process.cwd(), "engine", "main.py");

  const args = pyExec === "py" ? ["-3.12", engineMain] : [engineMain];

  pythonProcess = spawn(pyExec, args, {
    stdio: "inherit",
    shell: false
  });

  pythonProcess.on("error", (err) => {
    console.error("[Python Engine Error]:", err);
  });

  pythonProcess.on("exit", (code) => {
    console.log(`[Python Engine] Process exited with code ${code}`);
  });

  // Poll until ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 400));
    const h = await client.checkHealth();
    if (h.healthy) {
      console.log(`[Python Engine] Ready and connected at ${engineUrl} (RDKit v${h.rdkitVersion})`);
      ready = true;
      break;
    }
  }

  if (!ready) {
    console.warn(`[Python Engine] Warning: Did not respond within 12s. Continuing startup...`);
  }
}

async function main() {
  console.log("==================================================");
  console.log("   Organic Chemistry Structure MCP Server (v1.0)  ");
  console.log("==================================================");

  // 1. Check/Start Python Chemistry Microservice
  await ensurePythonEngine(ENGINE_URL);

  // 2. Initialize Database
  const db = new ChemistryDatabase(DATABASE_PATH);
  const engine = new ChemistryEngineClient(ENGINE_URL);

  // 3. Build & Start Express Application
  const staticDir = path.join(process.cwd(), "dist", "public");
  const app = createExpressApp(db, engine, {
    allowedOrigins: ALLOWED_ORIGINS,
    staticDir
  });

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Chemistry MCP Server is LIVE on port ${PORT}`);
    console.log(`• MCP Streamable HTTP Endpoint: http://localhost:${PORT}/mcp`);
    console.log(`• Healthcheck Endpoint:         http://localhost:${PORT}/health`);
    console.log(`• Web Testing & Admin UI:       http://localhost:${PORT}/`);
    console.log(`• Preset Chemical Library:      http://localhost:${PORT}/api/compounds`);
    console.log(`• Stdio Mode Runner:            npm run stdio\n`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("\nShutting down Chemistry MCP Server...");
    server.close(() => {
      db.close();
      if (pythonProcess) {
        pythonProcess.kill();
      }
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
