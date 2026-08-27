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

  constructor(baseUrl: string = "http://127.0.0.1:8000") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  public async checkHealth(): Promise<{ healthy: boolean; rdkitVersion?: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const resp = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
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

    const resp = await fetch(`${this.baseUrl}/render/structure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: "Engine error" })) as any;
      throw new Error(err.detail || `Structure render failed with HTTP ${resp.status}`);
    }

    return await resp.json() as StructureRenderResponse;
  }

  public async renderReaction(payload: ReactionRenderPayload): Promise<any> {
    const resp = await fetch(`${this.baseUrl}/render/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: "Engine error" })) as any;
      throw new Error(err.detail || `Reaction render failed with HTTP ${resp.status}`);
    }

    return await resp.json();
  }

  public async renderMechanism(reactionQuery: string): Promise<any> {
    const resp = await fetch(`${this.baseUrl}/render/mechanism`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction_query: reactionQuery }),
      signal: AbortSignal.timeout(7000)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: "Engine error" })) as any;
      throw new Error(err.detail || `Mechanism render failed with HTTP ${resp.status}`);
    }

    return await resp.json();
  }

  public async renderResonance(payload: ResonanceRenderPayload): Promise<any> {
    const resp = await fetch(`${this.baseUrl}/render/resonance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: "Engine error" })) as any;
      throw new Error(err.detail || `Resonance render failed with HTTP ${resp.status}`);
    }

    return await resp.json();
  }

  public async renderStereochemistry(payload: StereochemistryRenderPayload): Promise<any> {
    const resp = await fetch(`${this.baseUrl}/render/stereochemistry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: "Engine error" })) as any;
      throw new Error(err.detail || `Stereochemistry render failed with HTTP ${resp.status}`);
    }

    return await resp.json();
  }

  public async renderCompare(compounds: Array<{ smiles: string; name?: string }>, title?: string): Promise<any> {
    const resp = await fetch(`${this.baseUrl}/render/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compounds, title }),
      signal: AbortSignal.timeout(6000)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: "Engine error" })) as any;
      throw new Error(err.detail || `Comparison render failed with HTTP ${resp.status}`);
    }

    return await resp.json();
  }

  public async resolvePubChem(nameOrCid: string): Promise<any> {
    const isCid = /^\d+$/.test(nameOrCid.trim());
    const param = isCid ? `cid=${nameOrCid.trim()}` : `name=${encodeURIComponent(nameOrCid.trim())}`;
    
    const resp = await fetch(`${this.baseUrl}/resolve/pubchem?${param}`, {
      signal: AbortSignal.timeout(6000)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: "PubChem lookup failed" })) as any;
      throw new Error(err.detail || `PubChem lookup failed with HTTP ${resp.status}`);
    }

    return await resp.json();
  }
}
