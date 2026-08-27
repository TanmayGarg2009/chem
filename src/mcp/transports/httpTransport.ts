import { Request, Response, Router } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { ChemistryDatabase } from "../../db/database.js";
import { ChemistryEngineClient } from "../../services/chemistryEngineClient.js";
import { createChemistryMcpServer } from "../server.js";

export function createMcpHttpRouter(
  db: ChemistryDatabase,
  engine: ChemistryEngineClient,
  allowedOrigins: string[] = ["*"]
): Router {
  const router = Router();
  const sessions = new Map<string, SSEServerTransport>();

  // Helper to validate origin
  const checkOrigin = (req: Request, res: Response): boolean => {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return true;
    }
    res.status(403).json({ error: "Forbidden: Origin not allowed" });
    return false;
  };

  // MCP Streamable HTTP / SSE Endpoint (GET /mcp)
  router.get("/", (req: Request, res: Response) => {
    if (!checkOrigin(req, res)) return;

    // Create a new MCP Server instance per session
    const { server } = createChemistryMcpServer(db, engine);
    
    // Set up SSE transport
    const transport = new SSEServerTransport("/mcp/messages", res);
    const sessionId = transport.sessionId;
    sessions.set(sessionId, transport);

    transport.onclose = () => {
      sessions.delete(sessionId);
    };

    server.connect(transport).catch((err) => {
      console.error("Error connecting MCP server to transport:", err);
    });
  });

  // MCP Message Posting Endpoint (POST /mcp/messages)
  router.post("/messages", async (req: Request, res: Response) => {
    if (!checkOrigin(req, res)) return;

    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      res.status(400).json({ error: "Missing sessionId query parameter" });
      return;
    }

    const transport = sessions.get(sessionId);
    if (!transport) {
      res.status(404).json({ error: `Session not found: ${sessionId}` });
      return;
    }

    try {
      await transport.handlePostMessage(req, res);
    } catch (err: any) {
      console.error("Error handling MCP post message:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "Internal server error" });
      }
    }
  });

  return router;
}
