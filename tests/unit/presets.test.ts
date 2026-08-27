import { describe, it, expect } from "vitest";
import { CHEMICAL_PRESETS } from "../../src/db/presets.js";
import { ChemistryDatabase } from "../../src/db/database.js";

describe("Chemical Presets & Database", () => {
  const db = new ChemistryDatabase(":memory:");

  it("should contain over 50 curated JEE and Class 11/12 chemical presets", () => {
    expect(CHEMICAL_PRESETS.length).toBeGreaterThan(50);
  });

  it("should correctly find presets by name, synonym, and formula", () => {
    const benzaldehyde = db.findPreset("benzaldehyde");
    expect(benzaldehyde).toBeDefined();
    expect(benzaldehyde?.formula).toBe("C7H6O");
    expect(benzaldehyde?.smiles).toBe("O=Cc1ccccc1");

    const phenol = db.findPreset("carbolic acid");
    expect(phenol).toBeDefined();
    expect(phenol?.name).toBe("Phenol");

    const acetone = db.findPreset("ch3coch3");
    expect(acetone).toBeDefined();
    expect(acetone?.name).toBe("Acetone");

    const cco = db.findPreset("cco");
    expect(cco).toBeDefined();
    expect(cco?.name).toBe("Ethanol");
  });

  it("should support case-insensitive preset lookup", () => {
    expect(db.findPreset("BENZENE")?.formula).toBe("C6H6");
    expect(db.findPreset("AnILiNe")?.name).toBe("Aniline");
    expect(db.findPreset("Toluene")?.smiles).toBe("Cc1ccccc1");
  });
});
