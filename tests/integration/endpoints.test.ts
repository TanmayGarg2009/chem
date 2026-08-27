import { describe, it, expect, beforeAll } from "vitest";
import { ChemistryDatabase } from "../../src/db/database.js";
import { ChemistryEngineClient } from "../../src/services/chemistryEngineClient.js";
import { createExpressApp } from "../../src/api/index.js";
import express from "express";
import http from "http";

describe("API Endpoints Integration Test Suite", () => {
  let app: express.Express;
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const db = new ChemistryDatabase(":memory:");
    const engine = new ChemistryEngineClient("http://127.0.0.1:8000");
    app = createExpressApp(db, engine, { allowedOrigins: ["*"] });

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });

    return () => {
      server.close();
      db.close();
    };
  });

  it("GET /health returns 200 OK with server statuses", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(["healthy", "degraded"]).toContain(data.status);
    expect(data.mcp_server.status).toBe("running");
  });

  it("POST /api/render/structure renders single molecule structure", async () => {
    const res = await fetch(`${baseUrl}/api/render/structure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compound: "benzaldehyde" })
    });
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.success).toBe(true);
    expect(data.image_base64 || data.base64).toBeDefined();
    expect(data.compound.name).toBe("Benzaldehyde");
  });

  it("POST /api/render/reaction renders reaction diagram with reactants, conditions, products", async () => {
    const res = await fetch(`${baseUrl}/api/render/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reactants: ["benzene", "Br2"],
        products: ["bromobenzene", "HBr"],
        conditions: "FeBr3"
      })
    });
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.success).toBe(true);
    expect(data.base64).toBeDefined();
  });

  it("POST /api/render/mechanism renders multi-step mechanism diagram", async () => {
    const res = await fetch(`${baseUrl}/api/render/mechanism`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "sn1 hydrolysis of tert-butyl bromide" })
    });
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.success).toBe(true);
    expect(data.base64).toBeDefined();
    expect(data.title).toContain("SN1");
  });

  it("POST /api/render/resonance renders canonical resonance contributors", async () => {
    const res = await fetch(`${baseUrl}/api/render/resonance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compound: "phenoxide ion" })
    });
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.success).toBe(true);
    expect(data.base64).toBeDefined();
  });

  it("POST /api/render/stereochemistry renders stereochemistry projection", async () => {
    const res = await fetch(`${baseUrl}/api/render/stereochemistry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compound: "2-butanol", configuration: "R" })
    });
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.success).toBe(true);
    expect(data.base64).toBeDefined();
  });

  it("POST /api/render/compare renders side-by-side molecular comparison", async () => {
    const res = await fetch(`${baseUrl}/api/render/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compounds: ["ethanol", "ethanal", "ethanoic acid"],
        title: "Oxidation Series of Ethanol"
      })
    });
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.success).toBe(true);
    expect(data.base64).toBeDefined();
  });

  it("GET /api/compounds returns preset library", async () => {
    const res = await fetch(`${baseUrl}/api/compounds`);
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(50);
  });
});
