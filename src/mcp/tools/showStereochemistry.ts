import { z } from "zod";
import { ChemistryEngineClient } from "../../services/chemistryEngineClient.js";

export const showStereochemistrySchema = {
  compound: z.string().describe("Chiral or geometric compound name or SMILES (e.g. '2-butanol', 'lactic acid', 'alanine', 'tartaric acid', 'but-2-ene', 'maleic acid')"),
  configuration: z.string().optional().describe("Stereochemical descriptor: 'R', 'S', 'E', 'Z', 'cis', 'trans', 'D', 'L', 'meso' (e.g. 'R')"),
  width: z.number().int().optional().default(500).describe("Image width in pixels"),
  height: z.number().int().optional().default(380).describe("Image height in pixels")
};

export async function handleShowStereochemistry(
  args: z.infer<z.ZodObject<typeof showStereochemistrySchema>>,
  engine: ChemistryEngineClient
) {
  try {
    const renderRes = await engine.renderStereochemistry({
      compound: args.compound,
      configuration: args.configuration,
      width: args.width,
      height: args.height
    });

    const chiralText = [
      `🌐 **Stereochemical Structure: ${args.compound}**`,
      args.configuration ? `• **Specified Configuration**: **${args.configuration.toUpperCase()}**` : null,
      `• **Chiral Centers Identified**: ${renderRes.stereocenters_count} center(s)`,
      `• **Isomeric SMILES**: \`${renderRes.isomeric_smiles}\``,
      `• **Stereo Representation**: Solid wedges indicate bonds pointing towards the viewer (out of plane); dashed wedges indicate bonds pointing away (into plane).`
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
          text: chiralText
        }
      ]
    };
  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `❌ **Failed to render stereochemistry**: ${err.message}`
        }
      ]
    };
  }
}
