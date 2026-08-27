import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { ChemistryDatabase } from "../db/database.js";
import { ChemistryEngineClient } from "../services/chemistryEngineClient.js";
import { CompoundResolver } from "../services/compoundResolver.js";
import { CacheService } from "../services/cacheService.js";
import { createMcpHttpRouter } from "../mcp/transports/httpTransport.js";

export function createExpressApp(
  db: ChemistryDatabase,
  engine: ChemistryEngineClient,
  options: {
    allowedOrigins?: string[];
    rateLimitMax?: number;
    staticDir?: string;
  } = {}
) {
  const app = express();
  const resolver = new CompoundResolver(db, engine);
  const cacheService = new CacheService(db, engine);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow inline images & data: URIs in testing dashboard
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS
  app.use(
    cors({
      origin: options.allowedOrigins || "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "mcp-session-id"]
    })
  );

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: options.rateLimitMax || 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Rate limit exceeded. Please slow down." }
  });
  app.use(limiter);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // --- 1. Healthcheck Endpoint ---
  app.get("/health", async (_req: Request, res: Response) => {
    const engineHealth = await engine.checkHealth();
    const stats = db.getStats();

    res.json({
      status: engineHealth.healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      mcp_server: {
        status: "running",
        protocol_version: "2024-11-05",
        endpoint: "/mcp"
      },
      chemistry_engine: {
        status: engineHealth.healthy ? "connected" : "disconnected",
        rdkit_version: engineHealth.rdkitVersion || "unavailable",
        latency_ms: engineHealth.latencyMs
      },
      database: {
        status: "connected",
        cached_compounds: stats.cachedCompoundsCount,
        cached_renders: stats.cachedRendersCount,
        presets_count: stats.presetCompoundsCount
      }
    });
  });

  // --- 2. MCP Streamable HTTP Transport (/mcp) ---
  app.use("/mcp", createMcpHttpRouter(db, engine, options.allowedOrigins));

  // --- 3. Dashboard API Endpoints ---
  // Stats
  app.get("/api/stats", (_req: Request, res: Response) => {
    res.json(db.getStats());
  });

  // Logs
  app.get("/api/logs", (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 30;
    res.json(db.getRecentLogs(limit));
  });

  // Presets Library
  app.get("/api/compounds", (req: Request, res: Response) => {
    const category = req.query.category as string;
    const search = (req.query.search as string || "").toLowerCase();
    
    let list = db.getAllPresets();
    if (category && category !== "All") {
      list = list.filter(p => p.category === category);
    }
    if (search) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.formula.toLowerCase().includes(search) ||
        p.smiles.toLowerCase().includes(search) ||
        p.synonyms.some(s => s.toLowerCase().includes(search))
      );
    }
    res.json(list);
  });

  // Resolve Compound
  app.get("/api/resolve", async (req: Request, res: Response) => {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: "Missing query parameter 'q'" });
      return;
    }
    const result = await resolver.resolve(query);
    res.json(result);
  });

  // Direct Render: Structure
  app.post("/api/render/structure", async (req: Request, res: Response) => {
    try {
      const { compound, width, height, show_name, show_formula, format } = req.body;
      if (!compound) {
        res.status(400).json({ error: "Missing 'compound' field" });
        return;
      }
      const resolved = await resolver.resolve(compound);
      if (resolved.status === "ambiguous") {
        res.status(422).json(resolved);
        return;
      }
      if (resolved.status === "not_found") {
        res.status(404).json(resolved);
        return;
      }

      const render = await cacheService.getOrRenderStructure({
        smilesOrInchi: resolved.compound.canonicalSmiles,
        name: resolved.compound.name,
        width: width || 500,
        height: height || 350,
        showName: show_name ?? true,
        showFormula: show_formula ?? true,
        format: format || "png"
      });

      res.json({
        success: true,
        compound: resolved.compound,
        image_base64: render.base64,
        mime_type: render.mimeType,
        from_cache: render.fromCache
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Direct Render: Reaction
  app.post("/api/render/reaction", async (req: Request, res: Response) => {
    try {
      const { reactants, products, conditions, title } = req.body;
      const resReactants = [];
      for (const r of (reactants || [])) {
        const res = await resolver.resolve(typeof r === "string" ? r : r.name || r.smiles);
        if (res.status === "resolved") {
          resReactants.push({ smiles: res.compound.canonicalSmiles, name: res.compound.name });
        } else {
          resReactants.push({ smiles: typeof r === "string" ? r : r.smiles, name: typeof r === "string" ? r : r.name });
        }
      }

      const resProducts = [];
      for (const p of (products || [])) {
        const res = await resolver.resolve(typeof p === "string" ? p : p.name || p.smiles);
        if (res.status === "resolved") {
          resProducts.push({ smiles: res.compound.canonicalSmiles, name: res.compound.name });
        } else {
          resProducts.push({ smiles: typeof p === "string" ? p : p.smiles, name: typeof p === "string" ? p : p.name });
        }
      }

      const result = await engine.renderReaction({
        reactants: resReactants,
        products: resProducts,
        conditions,
        title
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Direct Render: Mechanism
  app.post("/api/render/mechanism", async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query) {
        res.status(400).json({ error: "Missing 'query' field" });
        return;
      }
      const result = await engine.renderMechanism(query);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Direct Render: Resonance
  app.post("/api/render/resonance", async (req: Request, res: Response) => {
    try {
      const { compound, title } = req.body;
      const result = await engine.renderResonance({ compound_query: compound, title });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Direct Render: Stereochemistry
  app.post("/api/render/stereochemistry", async (req: Request, res: Response) => {
    try {
      const { compound, configuration, width, height } = req.body;
      const result = await engine.renderStereochemistry({
        compound,
        configuration,
        width,
        height
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 4. Static Dashboard Serving ---
  const staticPath = options.staticDir || path.join(process.cwd(), "dist", "public");
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    app.get("*", (_req: Request, res: Response, next: NextFunction) => {
      if (_req.path.startsWith("/api") || _req.path.startsWith("/mcp") || _req.path.startsWith("/health")) {
        return next();
      }
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  return app;
}
