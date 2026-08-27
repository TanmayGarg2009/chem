import { ChemistryDatabase, CachedCompound } from "../db/database.js";
import { checkAmbiguity, AmbiguityCheckResult } from "../db/ambiguity.js";
import { ChemistryEngineClient } from "./chemistryEngineClient.js";

export interface ResolvedCompound {
  name: string;
  iupacName?: string;
  canonicalSmiles: string;
  isomericSmiles?: string;
  formula: string;
  molecularWeight: number;
  inchi?: string;
  inchikey?: string;
  pubchemCid?: string;
  source: "preset" | "cache" | "smiles" | "pubchem" | "inchi";
}

export type ResolutionResult =
  | { status: "resolved"; compound: ResolvedCompound }
  | { status: "ambiguous"; ambiguity: AmbiguityCheckResult }
  | { status: "not_found"; query: string; message: string; suggestions?: string[] };

export class CompoundResolver {
  private db: ChemistryDatabase;
  private engine: ChemistryEngineClient;

  constructor(db: ChemistryDatabase, engine: ChemistryEngineClient) {
    this.db = db;
    this.engine = engine;
  }

  public async resolve(query: string): Promise<ResolutionResult> {
    const rawQuery = query.trim();
    if (!rawQuery) {
      return {
        status: "not_found",
        query,
        message: "Chemical query cannot be empty."
      };
    }

    // 1. Check for Ambiguity
    const ambCheck = checkAmbiguity(rawQuery);
    if (ambCheck.isAmbiguous) {
      return {
        status: "ambiguous",
        ambiguity: ambCheck
      };
    }

    // 2. Check Local Preset DB
    const preset = this.db.findPreset(rawQuery);
    if (preset) {
      return {
        status: "resolved",
        compound: {
          name: preset.name,
          iupacName: preset.iupacName,
          canonicalSmiles: preset.smiles,
          isomericSmiles: preset.smiles,
          formula: preset.formula,
          molecularWeight: preset.molecularWeight,
          pubchemCid: preset.pubchemCid,
          inchi: preset.inchi,
          inchikey: preset.inchikey,
          source: "preset"
        }
      };
    }

    // 3. Check SQLite Cache
    const cached = this.db.getCachedCompound(rawQuery);
    if (cached) {
      return {
        status: "resolved",
        compound: {
          name: cached.name,
          iupacName: cached.iupacName,
          canonicalSmiles: cached.canonicalSmiles,
          isomericSmiles: cached.isomericSmiles,
          formula: cached.formula,
          molecularWeight: cached.molecularWeight,
          inchi: cached.inchi,
          inchikey: cached.inchikey,
          pubchemCid: cached.pubchemCid,
          source: "cache"
        }
      };
    }

    // 4. Check if input is a valid SMILES / InChI directly via RDKit engine
    if (this.looksLikeStructureString(rawQuery)) {
      try {
        const renderRes = await this.engine.renderStructure({
          smilesOrInchi: rawQuery,
          name: rawQuery,
          showName: false,
          format: "png"
        });

        if (renderRes.success && renderRes.properties) {
          const props = renderRes.properties;
          const resolved: ResolvedCompound = {
            name: rawQuery,
            canonicalSmiles: props.canonical_smiles || rawQuery,
            isomericSmiles: props.isomeric_smiles || props.canonical_smiles,
            formula: props.formula || "Unknown",
            molecularWeight: props.molecular_weight || 0,
            inchi: props.inchi,
            inchikey: props.inchikey,
            source: rawQuery.startsWith("InChI=") ? "inchi" : "smiles"
          };

          // Cache for future lookups
          this.db.saveCachedCompound({
            queryKey: rawQuery,
            name: resolved.name,
            canonicalSmiles: resolved.canonicalSmiles,
            isomericSmiles: resolved.isomericSmiles,
            formula: resolved.formula,
            molecularWeight: resolved.molecularWeight,
            inchi: resolved.inchi,
            inchikey: resolved.inchikey,
            source: resolved.source
          });

          return { status: "resolved", compound: resolved };
        }
      } catch {
        // Not a direct SMILES string, proceed to external resolver
      }
    }

    // 5. Query PubChem PUG REST API
    try {
      const pubRes = await this.engine.resolvePubChem(rawQuery);
      if (pubRes && pubRes.success) {
        const resolved: ResolvedCompound = {
          name: pubRes.iupac_name || pubRes.query || rawQuery,
          iupacName: pubRes.iupac_name,
          canonicalSmiles: pubRes.canonical_smiles,
          isomericSmiles: pubRes.isomeric_smiles,
          formula: pubRes.formula,
          molecularWeight: parseFloat(pubRes.molecular_weight) || 0,
          inchi: pubRes.inchi,
          inchikey: pubRes.inchikey,
          pubchemCid: pubRes.pubchem_cid,
          source: "pubchem"
        };

        // Cache in SQLite
        this.db.saveCachedCompound({
          queryKey: rawQuery,
          name: resolved.name,
          iupacName: resolved.iupacName,
          canonicalSmiles: resolved.canonicalSmiles,
          isomericSmiles: resolved.isomericSmiles,
          formula: resolved.formula,
          molecularWeight: resolved.molecularWeight,
          inchi: resolved.inchi,
          inchikey: resolved.inchikey,
          pubchemCid: resolved.pubchemCid,
          source: "pubchem"
        });

        return { status: "resolved", compound: resolved };
      }
    } catch (pubErr: any) {
      // Fall through to not_found
    }

    // 6. Not Found
    return {
      status: "not_found",
      query: rawQuery,
      message: `Could not resolve '${rawQuery}' into a known chemical structure via local library, SMILES parsing, or PubChem API.`,
      suggestions: this.getSuggestions(rawQuery)
    };
  }

  private looksLikeStructureString(str: string): boolean {
    if (str.startsWith("InChI=")) return true;
    // SMILES characters usually contain rings (=,#,@,/,\\,[,],lowercase aromatic c,n,o,s)
    if (/[=\#@/\\\[\]]/.test(str)) return true;
    if (/[cno][1-9]/.test(str)) return true;
    if (/^[A-Z][a-z]?(\d+)?([A-Z][a-z]?(\d+)?)*$/.test(str) && str.length > 2) return true;
    return false;
  }

  private getSuggestions(query: string): string[] {
    const q = query.toLowerCase();
    const presets = this.db.getAllPresets();
    const matches: string[] = [];
    for (const p of presets) {
      if (p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) {
        matches.push(p.name);
        if (matches.length >= 4) break;
      }
    }
    return matches;
  }
}
