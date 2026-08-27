import { describe, it, expect } from "vitest";
import { ChemistryDatabase } from "../../src/db/database.js";

describe("SQLite Cache and Analytics Database", () => {
  it("should cache and retrieve compound metadata with hit tracking", () => {
    const db = new ChemistryDatabase(":memory:");

    db.saveCachedCompound({
      queryKey: "custom-molecule",
      name: "Custom Molecule",
      canonicalSmiles: "CC(=O)N",
      formula: "C2H5NO",
      molecularWeight: 59.068,
      source: "test"
    });

    const hit1 = db.getCachedCompound("custom-molecule");
    expect(hit1).toBeDefined();
    expect(hit1?.name).toBe("Custom Molecule");
    expect(hit1?.hitCount).toBe(2);

    const hit2 = db.getCachedCompound("custom-molecule");
    expect(hit2?.hitCount).toBe(3);
  });

  it("should cache rendered images and record tool call logs", () => {
    const db = new ChemistryDatabase(":memory:");

    db.saveCachedRender({
      cacheKey: "test-render-key-123",
      smiles: "CCO",
      format: "png",
      mimeType: "image/png",
      dataBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      width: 500,
      height: 350
    });

    const render = db.getCachedRender("test-render-key-123");
    expect(render).toBeDefined();
    expect(render?.dataBase64.startsWith("iVBORw0KGgo")).toBe(true);

    db.logToolCall({
      requestId: "req-1",
      toolName: "show_structure",
      inputParams: JSON.stringify({ compound: "CCO" }),
      success: true,
      latencyMs: 42,
      timestamp: Date.now()
    });

    const stats = db.getStats();
    expect(stats.totalRequests).toBe(1);
    expect(stats.failedRequests).toBe(0);

    const logs = db.getRecentLogs(10);
    expect(logs.length).toBe(1);
    expect(logs[0].toolName).toBe("show_structure");
  });
});
