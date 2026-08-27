import { z } from "zod";
import { CompoundResolver } from "../../services/compoundResolver.js";
import { ChemistryEngineClient } from "../../services/chemistryEngineClient.js";

export const compareStructuresSchema = {
  compounds: z.array(z.string()).min(2).max(8).describe("List of compound names or SMILES to compare (e.g. ['ethanol', 'ethanal', 'ethanoic acid'])"),
  title: z.string().optional().describe("Comparison diagram title")
};

export async function handleCompareStructures(
  args: z.infer<z.ZodObject<typeof compareStructuresSchema>>,
  resolver: CompoundResolver,
  engine: ChemistryEngineClient
) {
  const resolvedItems: Array<{ smiles: string; name: string; formula?: string; mw?: number }> = [];

  for (const c of args.compounds) {
    const res = await resolver.resolve(c);
    if (res.status === "resolved") {
      resolvedItems.push({
        smiles: res.compound.canonicalSmiles,
        name: res.compound.name,
        formula: res.compound.formula,
        mw: res.compound.molecularWeight
      });
    } else {
      resolvedItems.push({ smiles: c, name: c });
    }
  }

  try {
    const renderRes = await engine.renderCompare(
      resolvedItems.map(i => ({ smiles: i.smiles, name: i.name })),
      args.title || "Side-by-Side Structure Comparison"
    );

    const summaryTable = [
      `📊 **Structure Comparison Grid** (${resolvedItems.length} molecules)`,
      "",
      "| Compound | Formula | Mol. Weight | SMILES |",
      "| :--- | :--- | :--- | :--- |",
      ...resolvedItems.map(i => `| **${i.name}** | ${i.formula || "-"} | ${i.mw ? i.mw + " g/mol" : "-"} | \`${i.smiles}\` |`)
    ].join("\n");

    return {
      content: [
        {
          type: "image" as const,
          data: renderRes.base64,
          mimeType: renderRes.mime_type || "image/png"
        },
        {
          type: "text" as const,
          text: summaryTable
        }
      ]
    };
  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `❌ **Failed to compare structures**: ${err.message}`
        }
      ]
    };
  }
}
