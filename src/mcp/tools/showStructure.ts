import { z } from "zod";
import { CompoundResolver } from "../../services/compoundResolver.js";
import { CacheService } from "../../services/cacheService.js";

export const showStructureSchema = {
  compound: z.string().describe("Chemical compound name, IUPAC name, SMILES, InChI, InChIKey, or PubChem CID (e.g. 'benzaldehyde', 'phenol', 'aniline', 'CCO', 'O=Cc1ccccc1')"),
  format: z.enum(["png", "svg"]).optional().default("png").describe("Image rendering format (default: 'png')"),
  width: z.number().int().min(200).max(2000).optional().default(500).describe("Image width in pixels (default: 500)"),
  height: z.number().int().min(150).max(2000).optional().default(350).describe("Image height in pixels (default: 350)"),
  show_name: z.boolean().optional().default(true).describe("Whether to render the compound name header badge"),
  show_formula: z.boolean().optional().default(true).describe("Whether to render the molecular formula and MW subtitle")
};

export async function handleShowStructure(
  args: z.infer<z.ZodObject<typeof showStructureSchema>>,
  resolver: CompoundResolver,
  cacheService: CacheService
) {
  const query = args.compound.trim();
  const res = await resolver.resolve(query);

  if (res.status === "ambiguous") {
    const candidateList = res.ambiguity.candidates?.map(c => `- **${c.name}** (${c.iupacName || c.smiles}): ${c.description}`).join("\n") || "";
    return {
      content: [
        {
          type: "text" as const,
          text: `⚠️ **Ambiguous Chemical Query**: '${query}'\n\n${res.ambiguity.message}\n\n**Possible Isomers / Options:**\n${candidateList}\n\nPlease specify the exact isomer you would like to visualize.`
        }
      ]
    };
  }

  if (res.status === "not_found") {
    const sug = res.suggestions?.length ? `\n\nDid you mean: ${res.suggestions.join(", ")}?` : "";
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `❌ **Compound Not Found**: ${res.message}${sug}`
        }
      ]
    };
  }

  const compound = res.compound;
  const renderResult = await cacheService.getOrRenderStructure({
    smilesOrInchi: compound.canonicalSmiles,
    name: compound.name,
    width: args.width,
    height: args.height,
    showName: args.show_name,
    showFormula: args.show_formula,
    format: args.format
  });

  const metadataText = [
    `🧪 **${compound.name}**`,
    `• **Formula**: ${compound.formula}`,
    `• **Molecular Weight**: ${compound.molecularWeight} g/mol`,
    `• **Canonical SMILES**: \`${compound.canonicalSmiles}\``,
    compound.iupacName ? `• **IUPAC**: ${compound.iupacName}` : null,
    compound.pubchemCid ? `• **PubChem CID**: [${compound.pubchemCid}](https://pubchem.ncbi.nlm.nih.gov/compound/${compound.pubchemCid})` : null,
    `• **Source**: ${compound.source === "preset" ? "Local JEE Preset Database" : compound.source === "cache" ? "Fast SQLite Cache" : "PubChem PUG REST API"}`
  ].filter(Boolean).join("\n");

  return {
    content: [
      {
        type: "image" as const,
        data: renderResult.base64,
        mimeType: renderResult.mimeType
      },
      {
        type: "text" as const,
        text: metadataText
      }
    ]
  };
}
