import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { ChemistryDatabase } from "../../src/db/database.js";
import { ChemistryEngineClient } from "../../src/services/chemistryEngineClient.js";
import { CompoundResolver } from "../../src/services/compoundResolver.js";
import { CacheService } from "../../src/services/cacheService.js";
import { handleShowStructure } from "../../src/mcp/tools/showStructure.js";
import { handleResolveCompound } from "../../src/mcp/tools/resolveCompound.js";
import { handleShowReaction } from "../../src/mcp/tools/showReaction.js";
import { handleShowMechanism } from "../../src/mcp/tools/showMechanism.js";
import { handleCompareStructures } from "../../src/mcp/tools/compareStructures.js";
import { handleShowResonance } from "../../src/mcp/tools/showResonance.js";
import { handleShowStereochemistry } from "../../src/mcp/tools/showStereochemistry.js";

let pythonProc: ChildProcess | null = null;
const ENGINE_URL = "http://127.0.0.1:8000";

describe("MCP Tools & Chemistry Pipeline Integration Tests", () => {
  let db: ChemistryDatabase;
  let engine: ChemistryEngineClient;
  let resolver: CompoundResolver;
  let cacheService: CacheService;

  beforeAll(async () => {
    db = new ChemistryDatabase(":memory:");
    engine = new ChemistryEngineClient(ENGINE_URL);

    // Check if python engine is already up, otherwise launch it
    const health = await engine.checkHealth();
    if (!health.healthy) {
      const venvPy = process.platform === "win32"
        ? path.join(process.cwd(), ".venv", "Scripts", "python.exe")
        : path.join(process.cwd(), ".venv", "bin", "python");

      const pyExec = fs.existsSync(venvPy) ? venvPy : (process.platform === "win32" ? "py" : "python3");
      const enginePath = path.join(process.cwd(), "engine", "main.py");
      const args = pyExec === "py" ? ["-3.12", enginePath] : [enginePath];

      pythonProc = spawn(pyExec, args, { stdio: "ignore" });

      // Wait up to 15s
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 500));
        const h = await engine.checkHealth();
        if (h.healthy) break;
      }
    }

    resolver = new CompoundResolver(db, engine);
    cacheService = new CacheService(db, engine);
  }, 20000);

  afterAll(() => {
    if (pythonProc) {
      pythonProc.kill();
    }
  });

  it("show_structure: should render benzaldehyde to native MCP image content", async () => {
    const res = await handleShowStructure(
      { compound: "benzaldehyde", format: "png", width: 500, height: 350, show_name: true, show_formula: true },
      resolver,
      cacheService
    );

    expect(res.content.length).toBe(2);
    const imgItem = res.content.find((c: any) => c.type === "image") as any;
    const txtItem = res.content.find((c: any) => c.type === "text") as any;

    expect(imgItem).toBeDefined();
    expect(imgItem.mimeType).toBe("image/png");
    expect(imgItem.data.startsWith("iVBORw0KGgo")).toBe(true);
    expect(txtItem.text).toContain("Benzaldehyde");
    expect(txtItem.text).toContain("C7H6O");
  });

  it("show_structure: should correctly resolve and render benzene, phenol, aniline, acetone, and CCO", async () => {
    for (const testCompound of ["benzene", "phenol", "aniline", "acetone", "CCO"]) {
      const res = await handleShowStructure(
        { compound: testCompound, format: "png", width: 400, height: 300, show_name: true, show_formula: true },
        resolver,
        cacheService
      );

      const imgItem = res.content.find((c: any) => c.type === "image") as any;
      expect(imgItem).toBeDefined();
      expect(imgItem.mimeType).toBe("image/png");
      expect(imgItem.data.length).toBeGreaterThan(100);
    }
  });

  it("show_structure: should detect ambiguous name 'cresol' and return disambiguation choices", async () => {
    const res = await handleShowStructure(
      { compound: "cresol", format: "png", width: 500, height: 350, show_name: true, show_formula: true },
      resolver,
      cacheService
    );

    const txtItem = res.content.find((c: any) => c.type === "text") as any;
    expect(txtItem.text).toContain("Ambiguous Chemical Query");
    expect(txtItem.text).toContain("o-Cresol");
    expect(txtItem.text).toContain("m-Cresol");
    expect(txtItem.text).toContain("p-Cresol");
  });

  it("resolve_compound: should return accurate chemical metadata JSON", async () => {
    const res = await handleResolveCompound({ query: "benzaldehyde" }, resolver);
    const parsed = JSON.parse((res.content[0] as any).text);

    expect(parsed.status).toBe("success");
    expect(parsed.compound.name).toBe("Benzaldehyde");
    expect(parsed.compound.formula).toBe("C7H6O");
    expect(parsed.compound.canonical_smiles).toBe("O=Cc1ccccc1");
  });

  it("show_reaction: should generate a reaction diagram for Benzene + Br2 -> Bromobenzene + HBr", async () => {
    const res = await handleShowReaction(
      {
        reactants: ["benzene", "Br2"],
        products: ["bromobenzene", "HBr"],
        conditions: "FeBr3"
      },
      resolver,
      engine
    );

    const imgItem = res.content.find((c: any) => c.type === "image") as any;
    expect(imgItem).toBeDefined();
    expect(imgItem.mimeType).toBe("image/png");
    expect(imgItem.data.startsWith("iVBORw0KGgo")).toBe(true);
  });

  it("show_mechanism: should render SN1 multi-step mechanism diagram", async () => {
    const res = await handleShowMechanism(
      { reaction: "SN1 hydrolysis of tert-butyl bromide", steps: "auto" },
      engine
    );

    const imgItem = res.content.find((c: any) => c.type === "image") as any;
    expect(imgItem).toBeDefined();
    expect(imgItem.data.startsWith("iVBORw0KGgo")).toBe(true);
  });

  it("show_resonance: should render canonical resonance forms of Phenoxide Ion", async () => {
    const res = await handleShowResonance(
      { compound: "phenoxide ion" },
      engine
    );

    const imgItem = res.content.find((c: any) => c.type === "image") as any;
    expect(imgItem).toBeDefined();
    expect(imgItem.data.startsWith("iVBORw0KGgo")).toBe(true);
  });

  it("show_stereochemistry: should render 2-butanol with (R) configuration", async () => {
    const res = await handleShowStereochemistry(
      { compound: "2-butanol", configuration: "R" },
      engine
    );

    const imgItem = res.content.find((c: any) => c.type === "image") as any;
    expect(imgItem).toBeDefined();
    expect(imgItem.data.startsWith("iVBORw0KGgo")).toBe(true);
  });

  it("compare_structures: should render ethanol, ethanal, ethanoic acid side-by-side", async () => {
    const res = await handleCompareStructures(
      { compounds: ["ethanol", "ethanal", "ethanoic acid"] },
      resolver,
      engine
    );

    const imgItem = res.content.find((c: any) => c.type === "image") as any;
    expect(imgItem).toBeDefined();
    expect(imgItem.data.startsWith("iVBORw0KGgo")).toBe(true);
  });
});
