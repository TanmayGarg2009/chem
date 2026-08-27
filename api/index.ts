import { ChemistryDatabase } from "../src/db/database.js";
import { ChemistryEngineClient } from "../src/services/chemistryEngineClient.js";
import { createExpressApp } from "../src/api/index.js";

const db = new ChemistryDatabase(":memory:");
const engine = new ChemistryEngineClient(process.env.PYTHON_ENGINE_URL || "http://127.0.0.1:8000");

const app = createExpressApp(db, engine, {
  allowedOrigins: ["*"]
});

export default app;
