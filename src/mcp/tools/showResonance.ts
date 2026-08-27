import { z } from "zod";
import { ChemistryEngineClient } from "../../services/chemistryEngineClient.js";

export const showResonanceSchema = {
  compound: z.string().describe("Compound name, ion, or query for resonance depiction (e.g. 'phenoxide ion', 'nitrobenzene', 'aniline', 'carboxylate', 'benzene', 'allyl cation')"),
  title: z.string().optional().describe("Optional custom title for the resonance diagram")
};

export async function handleShowResonance(
  args: z.infer<z.ZodObject<typeof showResonanceSchema>>,
  engine: ChemistryEngineClient
) {
  try {
    const renderRes = await engine.renderResonance({
      compound_query: args.compound,
      title: args.title
    });

    const infoText = [
      `⚡ **${renderRes.title || "Resonance Hybrid & Contributors"}**`,
      renderRes.explanation ? `• **Delocalization**: ${renderRes.explanation}` : null,
      `• **Canonical Structures**: Canonical resonance forms enclosed in brackets with double-headed (<-->) arrows showing electron delocalization and formal charge stability.`
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
          text: infoText
        }
      ]
    };
  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `❌ **Failed to render resonance**: ${err.message}`
        }
      ]
    };
  }
}
