import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { v4 as uuidv4 } from "uuid";
import { ChemistryDatabase } from "../db/database.js";
import { ChemistryEngineClient } from "../services/chemistryEngineClient.js";
import { CompoundResolver } from "../services/compoundResolver.js";
import { CacheService } from "../services/cacheService.js";

import { showStructureSchema, handleShowStructure } from "./tools/showStructure.js";
import { resolveCompoundSchema, handleResolveCompound } from "./tools/resolveCompound.js";
import { showReactionSchema, handleShowReaction } from "./tools/showReaction.js";
import { showMechanismSchema, handleShowMechanism } from "./tools/showMechanism.js";
import { compareStructuresSchema, handleCompareStructures } from "./tools/compareStructures.js";
import { showResonanceSchema, handleShowResonance } from "./tools/showResonance.js";
import { showStereochemistrySchema, handleShowStereochemistry } from "./tools/showStereochemistry.js";

export function createChemistryMcpServer(
  db: ChemistryDatabase,
  engine: ChemistryEngineClient
) {
  const resolver = new CompoundResolver(db, engine);
  const cacheService = new CacheService(db, engine);

  const server = new McpServer(
    {
      name: "organic-chemistry-server",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // 1. Tool: show_structure
  server.tool(
    "show_structure",
    "Use this tool whenever a chemical compound, reagent, intermediate, functional group, or organic molecule needs to be visually represented in the conversation. Prefer this tool over attempting to describe a skeletal chemical structure using ASCII art or plain text.",
    showStructureSchema,
    async (args) => {
      const start = Date.now();
      const reqId = uuidv4();
      try {
        const res = await handleShowStructure(args, resolver, cacheService);
        db.logToolCall({
          requestId: reqId,
          toolName: "show_structure",
          inputParams: JSON.stringify(args),
          success: !res.isError,
          latencyMs: Date.now() - start,
          timestamp: Date.now()
        });
        return res;
      } catch (err: any) {
        db.logToolCall({
          requestId: reqId,
          toolName: "show_structure",
          inputParams: JSON.stringify(args),
          success: false,
          latencyMs: Date.now() - start,
          errorMessage: err.message,
          timestamp: Date.now()
        });
        return {
          isError: true,
          content: [{ type: "text" as const, text: `❌ Error in show_structure: ${err.message}` }]
        };
      }
    }
  );

  // 2. Tool: resolve_compound
  server.tool(
    "resolve_compound",
    "Use this tool when you need accurate chemical metadata (IUPAC name, formula, canonical SMILES, InChI, InChIKey, PubChem CID, molecular weight) for a compound without rendering an image.",
    resolveCompoundSchema,
    async (args) => {
      const start = Date.now();
      const reqId = uuidv4();
      try {
        const res = await handleResolveCompound(args, resolver);
        db.logToolCall({
          requestId: reqId,
          toolName: "resolve_compound",
          inputParams: JSON.stringify(args),
          success: !res.isError,
          latencyMs: Date.now() - start,
          timestamp: Date.now()
        });
        return res;
      } catch (err: any) {
        db.logToolCall({
          requestId: reqId,
          toolName: "resolve_compound",
          inputParams: JSON.stringify(args),
          success: false,
          latencyMs: Date.now() - start,
          errorMessage: err.message,
          timestamp: Date.now()
        });
        return {
          isError: true,
          content: [{ type: "text" as const, text: `❌ Error in resolve_compound: ${err.message}` }]
        };
      }
    }
  );

  // 3. Tool: show_reaction
  server.tool(
    "show_reaction",
    "Use this tool whenever explaining a chemical reaction, synthesis step, or transformation that would benefit from displaying reactants, products, reaction arrows, and conditions visually.",
    showReactionSchema,
    async (args) => {
      const start = Date.now();
      const reqId = uuidv4();
      try {
        const res = await handleShowReaction(args, resolver, engine);
        db.logToolCall({
          requestId: reqId,
          toolName: "show_reaction",
          inputParams: JSON.stringify(args),
          success: !res.isError,
          latencyMs: Date.now() - start,
          timestamp: Date.now()
        });
        return res;
      } catch (err: any) {
        db.logToolCall({
          requestId: reqId,
          toolName: "show_reaction",
          inputParams: JSON.stringify(args),
          success: false,
          latencyMs: Date.now() - start,
          errorMessage: err.message,
          timestamp: Date.now()
        });
        return {
          isError: true,
          content: [{ type: "text" as const, text: `❌ Error in show_reaction: ${err.message}` }]
        };
      }
    }
  );

  // 4. Tool: show_mechanism
  server.tool(
    "show_mechanism",
    "Use this tool to display detailed multi-step organic reaction mechanisms (such as SN1, SN2, EAS bromination/nitration, alkene hydration, aldol addition) with step-by-step intermediate panels, formal charges, and curved electron-movement arrows.",
    showMechanismSchema,
    async (args) => {
      const start = Date.now();
      const reqId = uuidv4();
      try {
        const res = await handleShowMechanism(args, engine);
        db.logToolCall({
          requestId: reqId,
          toolName: "show_mechanism",
          inputParams: JSON.stringify(args),
          success: !res.isError,
          latencyMs: Date.now() - start,
          timestamp: Date.now()
        });
        return res;
      } catch (err: any) {
        db.logToolCall({
          requestId: reqId,
          toolName: "show_mechanism",
          inputParams: JSON.stringify(args),
          success: false,
          latencyMs: Date.now() - start,
          errorMessage: err.message,
          timestamp: Date.now()
        });
        return {
          isError: true,
          content: [{ type: "text" as const, text: `❌ Error in show_mechanism: ${err.message}` }]
        };
      }
    }
  );

  // 5. Tool: compare_structures
  server.tool(
    "compare_structures",
    "Use this tool to display a side-by-side comparison diagram of multiple chemical structures (e.g. comparing functional groups, homologous series, constitutional isomers, acidities, or basicities).",
    compareStructuresSchema,
    async (args) => {
      const start = Date.now();
      const reqId = uuidv4();
      try {
        const res = await handleCompareStructures(args, resolver, engine);
        db.logToolCall({
          requestId: reqId,
          toolName: "compare_structures",
          inputParams: JSON.stringify(args),
          success: !res.isError,
          latencyMs: Date.now() - start,
          timestamp: Date.now()
        });
        return res;
      } catch (err: any) {
        db.logToolCall({
          requestId: reqId,
          toolName: "compare_structures",
          inputParams: JSON.stringify(args),
          success: false,
          latencyMs: Date.now() - start,
          errorMessage: err.message,
          timestamp: Date.now()
        });
        return {
          isError: true,
          content: [{ type: "text" as const, text: `❌ Error in compare_structures: ${err.message}` }]
        };
      }
    }
  );

  // 6. Tool: show_resonance
  server.tool(
    "show_resonance",
    "Use this tool to display resonance structures, delocalized pi-systems, and canonical contributors (e.g. phenoxide ion, nitrobenzene, carboxylate, aniline, benzene) with double-headed (<-->) resonance arrows and formal charges.",
    showResonanceSchema,
    async (args) => {
      const start = Date.now();
      const reqId = uuidv4();
      try {
        const res = await handleShowResonance(args, engine);
        db.logToolCall({
          requestId: reqId,
          toolName: "show_resonance",
          inputParams: JSON.stringify(args),
          success: !res.isError,
          latencyMs: Date.now() - start,
          timestamp: Date.now()
        });
        return res;
      } catch (err: any) {
        db.logToolCall({
          requestId: reqId,
          toolName: "show_resonance",
          inputParams: JSON.stringify(args),
          success: false,
          latencyMs: Date.now() - start,
          errorMessage: err.message,
          timestamp: Date.now()
        });
        return {
          isError: true,
          content: [{ type: "text" as const, text: `❌ Error in show_resonance: ${err.message}` }]
        };
      }
    }
  );

  // 7. Tool: show_stereochemistry
  server.tool(
    "show_stereochemistry",
    "Use this tool to display 3D stereochemical structures with wedge-and-dash bonds, chiral centers, and R/S or E/Z stereochemical configurations.",
    showStereochemistrySchema,
    async (args) => {
      const start = Date.now();
      const reqId = uuidv4();
      try {
        const res = await handleShowStereochemistry(args, engine);
        db.logToolCall({
          requestId: reqId,
          toolName: "show_stereochemistry",
          inputParams: JSON.stringify(args),
          success: !res.isError,
          latencyMs: Date.now() - start,
          timestamp: Date.now()
        });
        return res;
      } catch (err: any) {
        db.logToolCall({
          requestId: reqId,
          toolName: "show_stereochemistry",
          inputParams: JSON.stringify(args),
          success: false,
          latencyMs: Date.now() - start,
          errorMessage: err.message,
          timestamp: Date.now()
        });
        return {
          isError: true,
          content: [{ type: "text" as const, text: `❌ Error in show_stereochemistry: ${err.message}` }]
        };
      }
    }
  );

  return { server, resolver, cacheService };
}
