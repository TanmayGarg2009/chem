import { z } from "zod";
import { ChemistryEngineClient } from "../../services/chemistryEngineClient.js";

export const showMechanismSchema = {
  reaction: z.string().describe("Reaction mechanism name or query (e.g. 'SN1 hydrolysis of tert-butyl bromide', 'SN2 substitution of bromomethane with hydroxide', 'EAS bromination of benzene', 'Acid-catalyzed hydration of ethene', 'Aldol addition')"),
  steps: z.string().optional().default("auto").describe("Steps mode: 'auto' or specific step number")
};

export async function handleShowMechanism(
  args: z.infer<z.ZodObject<typeof showMechanismSchema>>,
  engine: ChemistryEngineClient
) {
  try {
    const renderRes = await engine.renderMechanism(args.reaction);

    const descText = [
      `🔄 **${renderRes.title}**`,
      `• **Overview**: ${renderRes.description}`,
      `• **Steps**: ${renderRes.steps_count} distinct elementary steps rendered above.`,
      `• **Key Concepts**: Curved electron arrows, carbocation/intermediate stability, formal charge tracking, and regiochemical/stereochemical outcomes.`
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
          text: descText
        }
      ]
    };
  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `❌ **Failed to render mechanism**: ${err.message}`
        }
      ]
    };
  }
}
