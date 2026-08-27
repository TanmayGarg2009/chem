import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ChemistryDatabase } from "../../db/database.js";
import { ChemistryEngineClient } from "../../services/chemistryEngineClient.js";
import { createChemistryMcpServer } from "../server.js";

async function runStdioServer() {
  const db = new ChemistryDatabase();
  const engine = new ChemistryEngineClient();

  const { server } = createChemistryMcpServer(db, engine);
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error("Chemistry Structure MCP Server running on stdio transport.");
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("stdioTransport.ts") || process.argv[1]?.endsWith("stdioTransport.js")) {
  runStdioServer().catch((err) => {
    console.error("Fatal error running stdio server:", err);
    process.exit(1);
  });
}
