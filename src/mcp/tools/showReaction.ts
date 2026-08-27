import { z } from "zod";
import { CompoundResolver } from "../../services/compoundResolver.js";
import { ChemistryEngineClient } from "../../services/chemistryEngineClient.js";

export const showReactionSchema = {
  reactants: z.array(z.string()).min(1).describe("List of reactant names or SMILES (e.g. ['benzene', 'Br2'])"),
  products: z.array(z.string()).min(1).describe("List of product names or SMILES (e.g. ['bromobenzene', 'HBr'])"),
  conditions: z.string().optional().describe("Reaction conditions, catalysts, temperature, or solvents (e.g. 'FeBr3', 'H2SO4, heat', 'alc. KOH, Δ')"),
  title: z.string().optional().describe("Optional diagram title")
};

export async function handleShowReaction(
  args: z.infer<z.ZodObject<typeof showReactionSchema>>,
  resolver: CompoundResolver,
  engine: ChemistryEngineClient
) {
  // Resolve all reactants
  const resolvedReactants: Array<{ smiles: string; name: string }> = [];
  for (const r of args.reactants) {
    const res = await resolver.resolve(r);
    if (res.status === "resolved") {
      resolvedReactants.push({ smiles: res.compound.canonicalSmiles, name: res.compound.name });
    } else {
      resolvedReactants.push({ smiles: r, name: r });
    }
  }

  // Resolve all products
  const resolvedProducts: Array<{ smiles: string; name: string }> = [];
  for (const p of args.products) {
    const res = await resolver.resolve(p);
    if (res.status === "resolved") {
      resolvedProducts.push({ smiles: res.compound.canonicalSmiles, name: res.compound.name });
    } else {
      resolvedProducts.push({ smiles: p, name: p });
    }
  }

  try {
    const renderRes = await engine.renderReaction({
      reactants: resolvedReactants,
      products: resolvedProducts,
      conditions: args.conditions,
      title: args.title || "Organic Reaction Diagram"
    });

    const summaryText = [
      `⚗️ **Reaction**: \`${renderRes.reaction_summary}\``,
      args.conditions ? `• **Conditions / Reagents**: ${args.conditions}` : null,
      `• **Reactants**: ${resolvedReactants.map(r => r.name).join(", ")}`,
      `• **Products**: ${resolvedProducts.map(p => p.name).join(", ")}`
    ].filter(Boolean).join("\n");

    return {
      content: [
        {
          type: "image" as const,
          data: renderRes.base64,
          mimeType: renderRes.mime_type || "image/png"
        },
        {
          type: "text" as const,
          text: summaryText
        }
      ]
    };
  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `❌ **Failed to render reaction**: ${err.message}`
        }
      ]
    };
  }
}
