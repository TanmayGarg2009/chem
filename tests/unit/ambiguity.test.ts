import { describe, it, expect } from "vitest";
import { checkAmbiguity } from "../../src/db/ambiguity.js";

describe("Ambiguity Detection Engine", () => {
  it("should flag ambiguous isomer names without positional indicators", () => {
    const cresol = checkAmbiguity("cresol");
    expect(cresol.isAmbiguous).toBe(true);
    expect(cresol.candidates?.length).toBe(3);
    expect(cresol.candidates?.map(c => c.name)).toContain("o-Cresol");

    const butanol = checkAmbiguity("butanol");
    expect(butanol.isAmbiguous).toBe(true);
    expect(butanol.candidates?.length).toBe(4);

    const xylene = checkAmbiguity("xylene");
    expect(xylene.isAmbiguous).toBe(true);
  });

  it("should NOT flag unambiguous specific compound names", () => {
    expect(checkAmbiguity("benzaldehyde").isAmbiguous).toBe(false);
    expect(checkAmbiguity("benzene").isAmbiguous).toBe(false);
    expect(checkAmbiguity("o-cresol").isAmbiguous).toBe(false);
    expect(checkAmbiguity("1-butanol").isAmbiguous).toBe(false);
  });
});
