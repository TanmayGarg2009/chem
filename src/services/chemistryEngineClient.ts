import { DiagramComposer, MECHANISMS_DB, RESONANCE_DB } from "./diagramComposer.js";

export interface StructureRenderOptions {
  smilesOrInchi: string;
  name?: string;
  width?: number;
  height?: number;
  showName?: boolean;
  showFormula?: boolean;
  format?: "png" | "svg";
}

export interface StructureRenderResponse {
  success: boolean;
  format: string;
  mime_type?: string;
  base64?: string;
  svg?: string;
  width?: number;
  height?: number;
  properties?: {
    canonical_smiles?: string;
    isomeric_smiles?: string;
    formula?: string;
    molecular_weight?: number;
    inchi?: string;
    inchikey?: string;
    h_bond_donors?: number;
    h_bond_acceptors?: number;
    rotatable_bonds?: number;
    tpsa?: number;
    formal_charge?: number;
    chiral_centers?: Array<[number, string]>;
  };
  error?: string;
}

export interface ReactionRenderPayload {
  reactants: Array<{ smiles: string; name?: string }>;
  products: Array<{ smiles: string; name?: string }>;
  conditions?: string;
  title?: string;
}

export interface ResonanceRenderPayload {
  compound_query?: string;
  structures?: Array<{ smiles: string; label?: string }>;
  title?: string;
}

export interface StereochemistryRenderPayload {
  compound: string;
  configuration?: string;
  width?: number;
  height?: number;
}

export class ChemistryEngineClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.PYTHON_ENGINE_URL || "http://127.0.0.1:8000") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  public async checkHealth(): Promise<{ healthy: boolean; rdkitVersion?: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const resp = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(1500) });
      if (resp.ok) {
        const data = await resp.json() as any;
        return {
          healthy: true,
          rdkitVersion: data.rdkit_version,
          latencyMs: Date.now() - start
        };
      }
    } catch {
      // ignore
    }
    return { healthy: false, latencyMs: Date.now() - start };
  }

  public async renderStructure(opts: StructureRenderOptions): Promise<StructureRenderResponse> {
    const payload = {
      smiles_or_inchi: opts.smilesOrInchi,
      name: opts.name,
      width: opts.width || 500,
      height: opts.height || 350,
      show_name: opts.showName ?? true,
      show_formula: opts.showFormula ?? true,
      format: opts.format || "png"
    };

    // Try local Python RDKit engine first
    try {
      const resp = await fetch(`${this.baseUrl}/render/structure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2000)
      });

      if (resp.ok) {
        return await resp.json() as StructureRenderResponse;
      }
    } catch {
      // Fall through to direct PubChem 2D depiction fallback
    }

    // Direct PubChem 2D Depiction Fallback (for Vercel / serverless without local python)
    return await this.renderViaPubchemFallback(opts);
  }

  private async renderViaPubchemFallback(opts: StructureRenderOptions): Promise<StructureRenderResponse> {
    try {
      const identifier = opts.name || opts.smilesOrInchi;
      const isSmiles = !opts.name && /[=\#@/\\\[\]cno]/.test(opts.smilesOrInchi);
      const url = isSmiles
        ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(opts.smilesOrInchi)}/PNG?image_size=large`
        : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(identifier)}/PNG?image_size=large`;

      const imgResp = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (imgResp.ok) {
        const arrayBuf = await imgResp.arrayBuffer();
        const base64 = Buffer.from(arrayBuf).toString("base64");
        return {
          success: true,
          format: "png",
          mime_type: "image/png",
          base64: base64,
          width: opts.width || 500,
          height: opts.height || 350,
          properties: {
            canonical_smiles: opts.smilesOrInchi
          }
        };
      }
    } catch {
      // ignore
    }

    throw new Error(`Failed to render structure for ${opts.name || opts.smilesOrInchi}`);
  }

  public async renderReaction(payload: ReactionRenderPayload): Promise<any> {
    try {
      const resp = await fetch(`${this.baseUrl}/render/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000)
      });

      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // Fallback
    }

    // Fallback: Fetch images for reactants and products and compose diagram
    const reactantsWithImages = await Promise.all(
      payload.reactants.map(async (r) => {
        const struct = await this.renderStructure({ smilesOrInchi: r.smiles, name: r.name }).catch(() => null);
        return { name: r.name || r.smiles, smiles: r.smiles, imgBase64: struct?.base64 };
      })
    );

    const productsWithImages = await Promise.all(
      payload.products.map(async (p) => {
        const struct = await this.renderStructure({ smilesOrInchi: p.smiles, name: p.name }).catch(() => null);
        return { name: p.name || p.smiles, smiles: p.smiles, imgBase64: struct?.base64 };
      })
    );

    const svg = DiagramComposer.createReactionSvg(
      reactantsWithImages,
      productsWithImages,
      payload.conditions,
      payload.title || "Chemical Reaction Diagram"
    );

    const base64Svg = Buffer.from(svg).toString("base64");
    const summary = `${payload.reactants.map(r => r.name || r.smiles).join(" + ")} --[${payload.conditions || ""}]--> ${payload.products.map(p => p.name || p.smiles).join(" + ")}`;

    return {
      success: true,
      format: "svg",
      mime_type: "image/svg+xml",
      base64: base64Svg,
      svg: svg,
      reaction_summary: summary
    };
  }

  public async renderMechanism(reactionQuery: string): Promise<any> {
    try {
      const resp = await fetch(`${this.baseUrl}/render/mechanism`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction_query: reactionQuery }),
        signal: AbortSignal.timeout(4000)
      });

      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // Fallback
    }

    // Fallback: Match mechanism query to built-in mechanism templates
    const q = reactionQuery.toLowerCase().trim();
    let mechKey = "sn1";
    if (q.includes("sn2") || q.includes("walden") || q.includes("bimolecular")) mechKey = "sn2";
    else if (q.includes("eas") || q.includes("bromination") || q.includes("aromatic") || q.includes("benzene")) mechKey = "eas";
    else if (q.includes("hydration") || q.includes("alkene") || q.includes("ethene")) mechKey = "hydration";
    else if (q.includes("aldol") || q.includes("enolate")) mechKey = "aldol";

    const mechData = MECHANISMS_DB[mechKey] || MECHANISMS_DB["sn1"];
    const svg = DiagramComposer.createMechanismSvg(mechData);
    const base64Svg = Buffer.from(svg).toString("base64");

    return {
      success: true,
      format: "svg",
      mime_type: "image/svg+xml",
      base64: base64Svg,
      svg: svg,
      title: mechData.title,
      description: mechData.description,
      steps_count: mechData.steps.length
    };
  }

  public async renderResonance(payload: ResonanceRenderPayload): Promise<any> {
    try {
      const resp = await fetch(`${this.baseUrl}/render/resonance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000)
      });

      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // Fallback
    }

    const q = (payload.compound_query || "phenoxide").toLowerCase().trim();
    let resKey = "phenoxide";
    if (q.includes("nitro")) resKey = "nitrobenzene";
    else if (q.includes("aniline")) resKey = "aniline";
    else if (q.includes("acetate") || q.includes("carboxylate")) resKey = "carboxylate";
    else if (q.includes("benzene")) resKey = "benzene";

    const resData = RESONANCE_DB[resKey] || RESONANCE_DB["phenoxide"];
    const svg = DiagramComposer.createResonanceSvg(resData);
    const base64Svg = Buffer.from(svg).toString("base64");

    return {
      success: true,
      format: "svg",
      mime_type: "image/svg+xml",
      base64: base64Svg,
      svg: svg,
      title: resData.title,
      explanation: resData.explanation
    };
  }

  public async renderStereochemistry(payload: StereochemistryRenderPayload): Promise<any> {
    try {
      const resp = await fetch(`${this.baseUrl}/render/stereochemistry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000)
      });

      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // Fallback
    }

    const struct = await this.renderStructure({ smilesOrInchi: payload.compound, name: payload.compound });
    return {
      success: true,
      format: "png",
      mime_type: "image/png",
      base64: struct.base64,
      isomeric_smiles: payload.compound,
      stereocenters_count: 1
    };
  }

  public async renderCompare(compounds: Array<{ smiles: string; name?: string }>, title?: string): Promise<any> {
    try {
      const resp = await fetch(`${this.baseUrl}/render/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compounds, title }),
        signal: AbortSignal.timeout(3000)
      });

      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // Fallback
    }

    const compoundsWithImages = await Promise.all(
      compounds.map(async (c) => {
        const struct = await this.renderStructure({ smilesOrInchi: c.smiles, name: c.name }).catch(() => null);
        return {
          name: c.name || c.smiles,
          smiles: c.smiles,
          imgBase64: struct?.base64
        };
      })
    );

    const svg = DiagramComposer.createComparisonSvg(compoundsWithImages, title || "Structure Comparison");
    const base64Svg = Buffer.from(svg).toString("base64");

    return {
      success: true,
      format: "svg",
      mime_type: "image/svg+xml",
      base64: base64Svg,
      svg: svg,
      count: compounds.length
    };
  }

  public async resolvePubChem(nameOrCid: string): Promise<any> {
    // Try local Python engine first
    try {
      const isCid = /^\d+$/.test(nameOrCid.trim());
      const param = isCid ? `cid=${nameOrCid.trim()}` : `name=${encodeURIComponent(nameOrCid.trim())}`;
      const resp = await fetch(`${this.baseUrl}/resolve/pubchem?${param}`, { signal: AbortSignal.timeout(2000) });
      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // Fall through to direct PubChem REST query
    }

    // Direct PubChem REST API
    const isCid = /^\d+$/.test(nameOrCid.trim());
    const encoded = encodeURIComponent(nameOrCid.trim());
    const url = isCid
      ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${nameOrCid.trim()}/property/CanonicalSMILES,IsomericSMILES,MolecularFormula,MolecularWeight,InChI,InChIKey,IUPACName/JSON`
      : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encoded}/property/CanonicalSMILES,IsomericSMILES,MolecularFormula,MolecularWeight,InChI,InChIKey,IUPACName/JSON`;

    const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (resp.ok) {
      const data = await resp.json() as any;
      const props = data?.PropertyTable?.Properties?.[0];
      if (props) {
        return {
          success: true,
          query: nameOrCid,
          pubchem_cid: String(props.CID || ""),
          canonical_smiles: props.CanonicalSMILES || "",
          isomeric_smiles: props.IsomericSMILES || props.CanonicalSMILES || "",
          formula: props.MolecularFormula || "",
          molecular_weight: String(props.MolecularWeight || ""),
          inchi: props.InChI || "",
          inchikey: props.InChIKey || "",
          iupac_name: props.IUPACName || "",
          source: "PubChem API"
        };
      }
    }

    throw new Error(`PubChem lookup failed for '${nameOrCid}'`);
  }
}
