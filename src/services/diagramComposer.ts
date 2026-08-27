import { CHEMICAL_PRESETS } from "../db/presets.js";

export interface CompoundTile {
  name: string;
  smiles: string;
  formula?: string;
  mw?: number;
  svgOrBase64?: string;
}

export interface MechanismStep {
  stepNum: number;
  title: string;
  reactants: string[];
  conditions: string;
  products: string[];
  note: string;
}

export interface MechanismData {
  title: string;
  description: string;
  steps: MechanismStep[];
}

export const MECHANISMS_DB: Record<string, MechanismData> = {
  sn1: {
    title: "SN1 Mechanism: Hydrolysis of tert-Butyl Bromide",
    description: "Unimolecular nucleophilic substitution proceeding via a planar carbocation intermediate.",
    steps: [
      {
        stepNum: 1,
        title: "Step 1: Heterolytic C–Br Bond Cleavage (Rate Determining Step)",
        reactants: ["tert-Butyl Bromide ((CH3)3C-Br)"],
        conditions: "Slow (r.d.s)\nPolar protic solvent",
        products: ["Planar 3° Carbocation ((CH3)3C⁺)", "Bromide Leaving Group (Br⁻)"],
        note: "C-Br bond breaks heterolytically. The tertiary carbocation achieves sp2 planar geometry."
      },
      {
        stepNum: 2,
        title: "Step 2: Nucleophilic Attack of Water",
        reactants: ["(CH3)3C⁺ Carbocation", "H2O (Nucleophile)"],
        conditions: "Fast\nFront/Back attack",
        products: ["Protonated tert-Butanol ((CH3)3C-OH2⁺)"],
        note: "H2O lone pair attacks the empty p-orbital equally from top or bottom face (racemization)."
      },
      {
        stepNum: 3,
        title: "Step 3: Deprotonation to Neutral Alcohol",
        reactants: ["(CH3)3C-OH2⁺", "H2O"],
        conditions: "Fast acid-base transfer",
        products: ["tert-Butanol ((CH3)3C-OH)", "Hydronium Ion (H3O⁺)"],
        note: "Solvent water molecule abstracts proton to yield neutral tert-butyl alcohol product."
      }
    ]
  },
  sn2: {
    title: "SN2 Mechanism: Hydroxide Substitution of Bromomethane",
    description: "Bimolecular concerted nucleophilic substitution with complete inversion of configuration (Walden Inversion).",
    steps: [
      {
        stepNum: 1,
        title: "Concerted Backside Attack & Walden Inversion",
        reactants: ["Hydroxide Ion (OH⁻)", "Bromomethane (CH3-Br)"],
        conditions: "180° Backside Attack\nTransition State: [HO···CH3···Br]‡",
        products: ["Methanol (CH3-OH, Inverted)", "Bromide Ion (Br⁻)"],
        note: "Nucleophile attacks at 180° to leaving group through a pentacoordinated transition state with 100% inversion."
      }
    ]
  },
  eas: {
    title: "Electrophilic Aromatic Substitution (EAS): Bromination of Benzene",
    description: "Electrophilic aromatic substitution via Arenium ion (Wheland / Sigma complex) resonance hybrid.",
    steps: [
      {
        stepNum: 1,
        title: "Step 1: Generation of Strong Electrophile (Br⁺)",
        reactants: ["Bromine (Br2)", "FeBr3 (Lewis Acid Catalyst)"],
        conditions: "Complexation & Polarization",
        products: ["Bromonium Ion (Br⁺)", "[FeBr4]⁻ Complex"],
        note: "Lewis acid FeBr3 coordinates with Br2, generating the reactive electrophilic Br+ species."
      },
      {
        stepNum: 2,
        title: "Step 2: Attack on Benzene Ring (Sigma Complex Formation)",
        reactants: ["Benzene (C6H6)", "Br⁺ Electrophile"],
        conditions: "Slow (r.d.s)\nLoss of aromaticity",
        products: ["Arenium Ion / Sigma Complex (C6H6Br⁺)"],
        note: "Aromatic pi-electrons attack Br+, forming a resonance-stabilized non-aromatic carbocation intermediate."
      },
      {
        stepNum: 3,
        title: "Step 3: Deprotonation & Restoration of Aromaticity",
        reactants: ["Arenium Sigma Complex", "[FeBr4]⁻ Base"],
        conditions: "Fast\n- H⁺",
        products: ["Bromobenzene (C6H5Br)", "HBr", "FeBr3 (Catalyst regenerated)"],
        note: "[FeBr4]- abstracts sp3 proton, returning the electron pair to restore the 6-pi aromatic system."
      }
    ]
  },
  hydration: {
    title: "Acid-Catalyzed Hydration of Alkene (Ethene)",
    description: "Electrophilic addition of water across double bond following Markovnikov regioselectivity.",
    steps: [
      {
        stepNum: 1,
        title: "Step 1: Electrophilic Protonation of Double Bond",
        reactants: ["Ethene (CH2=CH2)", "Hydronium (H3O⁺)"],
        conditions: "Electrophilic attack (Slow)",
        products: ["Ethyl Carbocation (CH3-CH2⁺)", "H2O"],
        note: "Pi-bond electrons attack H+ from hydronium, generating the carbocation intermediate."
      },
      {
        stepNum: 2,
        title: "Step 2: Nucleophilic Attack of Water & Deprotonation",
        reactants: ["CH3-CH2⁺", "H2O"],
        conditions: "Fast attack & proton loss",
        products: ["Ethanol (CH3-CH2-OH)", "H3O⁺ (Regenerated)"],
        note: "Water lone pair attacks carbocation followed by rapid proton transfer yielding ethanol."
      }
    ]
  },
  aldol: {
    title: "Aldol Addition: Base-Catalyzed Self-Addition of Acetaldehyde",
    description: "Enolate formation followed by nucleophilic addition to carbonyl carbon.",
    steps: [
      {
        stepNum: 1,
        title: "Step 1: Enolate Formation (Alpha-deprotonation)",
        reactants: ["Acetaldehyde (CH3-CH=O)", "Hydroxide (OH⁻)"],
        conditions: "Acid-base equilibrium",
        products: ["Enolate Nucleophile (⁻CH2-CH=O)", "H2O"],
        note: "Base abstracts weakly acidic alpha-hydrogen forming resonance-stabilized enolate."
      },
      {
        stepNum: 2,
        title: "Step 2: Nucleophilic Addition to 2nd Carbonyl Molecule",
        reactants: ["Enolate Ion (⁻CH2-CH=O)", "Acetaldehyde (CH3-CH=O)"],
        conditions: "C–C Bond Formation",
        products: ["Alkoxide Intermediate (CH3-CH(O⁻)-CH2-CH=O)"],
        note: "Enolate carbon attacks the electrophilic carbonyl carbon of 2nd aldehyde forming new C-C bond."
      },
      {
        stepNum: 3,
        title: "Step 3: Protonation to Form Aldol Product",
        reactants: ["Alkoxide Intermediate", "H2O"],
        conditions: "Protonation",
        products: ["3-Hydroxybutanal (Aldol)", "OH⁻ (Regenerated)"],
        note: "Protonation of alkoxide yields beta-hydroxyaldehyde (aldol) and regenerates base catalyst."
      }
    ]
  }
};

export const RESONANCE_DB: Record<string, { title: string; explanation: string; forms: Array<{ name: string; formula: string; charge: string }> }> = {
  phenoxide: {
    title: "Resonance Structures of Phenoxide Ion (C6H5O⁻)",
    explanation: "The negative charge on oxygen delocalizes into the ortho and para positions of the benzene ring through +M / +R resonance.",
    forms: [
      { name: "Structure I", formula: "C6H5O⁻", charge: "Negative on Oxygen" },
      { name: "Structure II", formula: "ortho-delocalized", charge: "Negative on C2 (ortho)" },
      { name: "Structure III", formula: "para-delocalized", charge: "Negative on C4 (para)" },
      { name: "Structure IV", formula: "ortho'-delocalized", charge: "Negative on C6 (ortho')" }
    ]
  },
  nitrobenzene: {
    title: "Resonance Structures of Nitrobenzene (C6H5NO2)",
    explanation: "-M / -R group withdraws electron density, generating partial positive charges at ortho and para positions.",
    forms: [
      { name: "Structure I", formula: "C6H5NO2 (Neutral)", charge: "N⁺ = O / O⁻" },
      { name: "Structure II", formula: "ortho-positive", charge: "Positive on C2 (ortho)" },
      { name: "Structure III", formula: "para-positive", charge: "Positive on C4 (para)" },
      { name: "Structure IV", formula: "ortho'-positive", charge: "Positive on C6 (ortho')" }
    ]
  },
  aniline: {
    title: "Resonance Structures of Aniline (C6H5NH2)",
    explanation: "Nitrogen lone pair delocalizes (+R effect) into the benzene ring, activating ortho and para positions.",
    forms: [
      { name: "Structure I", formula: "C6H5NH2", charge: "Neutral lone pair on N" },
      { name: "Structure II", formula: "ortho-negative", charge: "=NH2⁺ with C2 (ortho)⁻" },
      { name: "Structure III", formula: "para-negative", charge: "=NH2⁺ with C4 (para)⁻" },
      { name: "Structure IV", formula: "ortho'-negative", charge: "=NH2⁺ with C6 (ortho')⁻" }
    ]
  },
  carboxylate: {
    title: "Resonance in Acetate / Carboxylate Ion (CH3COO⁻)",
    explanation: "Two equivalent resonance contributors with identical energy account for equivalent C-O bond lengths (1.27 Å).",
    forms: [
      { name: "Canonical Form A", formula: "CH3-C(=O)-O⁻", charge: "Negative on O(1)" },
      { name: "Canonical Form B", formula: "CH3-C(O⁻)=O", charge: "Negative on O(2)" }
    ]
  },
  benzene: {
    title: "Kekulé Resonance Forms of Benzene (C6H6)",
    explanation: "Delocalized 6 pi-electron aromatic sextet produces equal C-C bond lengths (1.39 Å) and 36 kcal/mol resonance energy.",
    forms: [
      { name: "Kekulé Form I", formula: "C6H6 (1,3,5-triene)", charge: "Aromatic Sextet" },
      { name: "Kekulé Form II", formula: "C6H6 (2,4,6-triene)", charge: "Aromatic Sextet" }
    ]
  }
};

export class DiagramComposer {
  /**
   * Generates a publication-quality SVG reaction diagram
   */
  public static createReactionSvg(
    reactants: Array<{ name: string; smiles?: string; imgBase64?: string }>,
    products: Array<{ name: string; smiles?: string; imgBase64?: string }>,
    conditions?: string,
    title: string = "Chemical Reaction Diagram"
  ): string {
    const tileW = 200;
    const tileH = 160;
    const plusW = 40;
    const arrowW = Math.max(160, (conditions?.length || 0) * 9 + 40);

    const reactantWidth = reactants.length * tileW + (reactants.length - 1) * plusW;
    const productWidth = products.length * tileW + (products.length - 1) * plusW;
    const totalW = reactantWidth + arrowW + productWidth + 80;
    const totalH = tileH + 110;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" style="background-color:#ffffff; font-family:system-ui,-apple-system,sans-serif;">
      <!-- Title -->
      <text x="${totalW / 2}" y="28" font-size="16" font-weight="bold" fill="#1e293b" text-anchor="middle">${escapeXml(title)}</text>
    `;

    let curX = 40;
    const midY = 45 + tileH / 2;

    // Reactants
    reactants.forEach((r, i) => {
      if (i > 0) {
        svg += `
          <!-- Plus Sign -->
          <line x1="${curX + plusW / 2 - 8}" y1="${midY}" x2="${curX + plusW / 2 + 8}" y2="${midY}" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
          <line x1="${curX + plusW / 2}" y1="${midY - 8}" x2="${curX + plusW / 2}" y2="${midY + 8}" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
        `;
        curX += plusW;
      }

      svg += `
        <!-- Reactant Card -->
        <rect x="${curX}" y="45" width="${tileW}" height="${tileH}" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      `;

      if (r.imgBase64) {
        svg += `<image href="data:image/png;base64,${r.imgBase64}" x="${curX + 10}" y="52" width="${tileW - 20}" height="${tileH - 45}" preserveAspectRatio="xMidYMid meet"/>`;
      } else {
        svg += `
          <rect x="${curX + 20}" y="65" width="${tileW - 40}" height="${tileH - 70}" rx="8" fill="#e2e8f0"/>
          <text x="${curX + tileW / 2}" y="${midY}" font-size="13" font-family="monospace" fill="#334155" text-anchor="middle">${escapeXml(r.smiles || r.name)}</text>
        `;
      }

      svg += `
        <text x="${curX + tileW / 2}" y="${45 + tileH - 12}" font-size="13" font-weight="600" fill="#0f172a" text-anchor="middle">${escapeXml(r.name)}</text>
      `;
      curX += tileW;
    });

    // Arrow
    const arrowStartX = curX + 15;
    const arrowEndX = curX + arrowW - 15;
    const arrowMidX = curX + arrowW / 2;

    svg += `
      <!-- Reaction Arrow -->
      <line x1="${arrowStartX}" y1="${midY}" x2="${arrowEndX}" y2="${midY}" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
      <polygon points="${arrowEndX},${midY} ${arrowEndX - 12},${midY - 6} ${arrowEndX - 6},${midY} ${arrowEndX - 12},${midY + 6}" fill="#0f172a"/>
    `;

    if (conditions) {
      const condLines = conditions.split(/[\n/|]/);
      svg += `<text x="${arrowMidX}" y="${midY - 12}" font-size="13" font-weight="bold" fill="#0284c7" text-anchor="middle">${escapeXml(condLines[0]?.trim() || "")}</text>`;
      if (condLines[1]) {
        svg += `<text x="${arrowMidX}" y="${midY + 22}" font-size="12" fill="#64748b" text-anchor="middle">${escapeXml(condLines[1]?.trim() || "")}</text>`;
      }
    }
    curX += arrowW;

    // Products
    products.forEach((p, i) => {
      if (i > 0) {
        svg += `
          <!-- Plus Sign -->
          <line x1="${curX + plusW / 2 - 8}" y1="${midY}" x2="${curX + plusW / 2 + 8}" y2="${midY}" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
          <line x1="${curX + plusW / 2}" y1="${midY - 8}" x2="${curX + plusW / 2}" y2="${midY + 8}" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
        `;
        curX += plusW;
      }

      svg += `
        <!-- Product Card -->
        <rect x="${curX}" y="45" width="${tileW}" height="${tileH}" rx="12" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
      `;

      if (p.imgBase64) {
        svg += `<image href="data:image/png;base64,${p.imgBase64}" x="${curX + 10}" y="52" width="${tileW - 20}" height="${tileH - 45}" preserveAspectRatio="xMidYMid meet"/>`;
      } else {
        svg += `
          <rect x="${curX + 20}" y="65" width="${tileW - 40}" height="${tileH - 70}" rx="8" fill="#dcfce7"/>
          <text x="${curX + tileW / 2}" y="${midY}" font-size="13" font-family="monospace" fill="#166534" text-anchor="middle">${escapeXml(p.smiles || p.name)}</text>
        `;
      }

      svg += `
        <text x="${curX + tileW / 2}" y="${45 + tileH - 12}" font-size="13" font-weight="600" fill="#14532d" text-anchor="middle">${escapeXml(p.name)}</text>
      `;
      curX += tileW;
    });

    svg += `</svg>`;
    return svg;
  }

  /**
   * Generates a multi-step mechanism diagram SVG
   */
  public static createMechanismSvg(mechData: MechanismData): string {
    const width = 820;
    const stepH = 140;
    const totalH = 80 + mechData.steps.length * (stepH + 20);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalH}" width="${width}" height="${totalH}" style="background-color:#ffffff; font-family:system-ui,-apple-system,sans-serif;">
      <!-- Title & Description Header -->
      <text x="${width / 2}" y="28" font-size="17" font-weight="bold" fill="#0f172a" text-anchor="middle">${escapeXml(mechData.title)}</text>
      <text x="${width / 2}" y="48" font-size="12" fill="#64748b" text-anchor="middle">${escapeXml(mechData.description)}</text>
    `;

    let curY = 65;
    mechData.steps.forEach((step) => {
      svg += `
        <!-- Step Panel -->
        <g transform="translate(30, ${curY})">
          <rect x="0" y="0" width="${width - 60}" height="${stepH}" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          
          <!-- Step Header Badge -->
          <rect x="0" y="0" width="${width - 60}" height="32" rx="12" fill="#e0f2fe"/>
          <rect x="0" y="20" width="${width - 60}" height="12" fill="#e0f2fe"/>
          <text x="16" y="21" font-size="13" font-weight="bold" fill="#0369a1">${escapeXml(step.title)}</text>
          
          <!-- Reactants Box -->
          <g transform="translate(20, 44)">
            <rect x="0" y="0" width="220" height="52" rx="8" fill="#ffffff" stroke="#e2e8f0"/>
            <text x="110" y="31" font-size="12" font-weight="600" fill="#1e293b" text-anchor="middle">${escapeXml(step.reactants.join(" + "))}</text>
          </g>
          
          <!-- Arrow with conditions -->
          <g transform="translate(260, 70)">
            <line x1="0" y1="0" x2="160" y2="0" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
            <polygon points="160,0 148,-5 152,0 148,5" fill="#0f172a"/>
            <text x="80" y="-8" font-size="11" font-weight="bold" fill="#0284c7" text-anchor="middle">${escapeXml(step.conditions.split("\n")[0] || "")}</text>
            ${step.conditions.split("\n")[1] ? `<text x="80" y="16" font-size="10" fill="#64748b" text-anchor="middle">${escapeXml(step.conditions.split("\n")[1])}</text>` : ""}
          </g>
          
          <!-- Products Box -->
          <g transform="translate(440, 44)">
            <rect x="0" y="0" width="280" height="52" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
            <text x="140" y="31" font-size="12" font-weight="600" fill="#166534" text-anchor="middle">${escapeXml(step.products.join(" + "))}</text>
          </g>
          
          <!-- Note / Electron movement -->
          <text x="16" y="122" font-size="11" fill="#475569">
            <tspan font-weight="bold" fill="#0284c7">Curved Arrow &amp; Intermediate: </tspan>${escapeXml(step.note)}
          </text>
        </g>
      `;
      curY += stepH + 16;
    });

    svg += `</svg>`;
    return svg;
  }

  /**
   * Generates a resonance contributor SVG diagram
   */
  public static createResonanceSvg(resData: { title: string; explanation: string; forms: Array<{ name: string; formula: string; charge: string }> }): string {
    const tileW = 160;
    const tileH = 130;
    const arrowW = 60;
    const count = resData.forms.length;
    const totalW = 60 + count * tileW + (count - 1) * arrowW + 60;
    const totalH = 220;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" style="background-color:#ffffff; font-family:system-ui,-apple-system,sans-serif;">
      <!-- Title -->
      <text x="${totalW / 2}" y="28" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">${escapeXml(resData.title)}</text>
      <text x="${totalW / 2}" y="48" font-size="12" fill="#64748b" text-anchor="middle">${escapeXml(resData.explanation)}</text>
      
      <!-- Brackets [ ... ] -->
      <path d="M 40,65 L 25,65 L 25,${totalH - 25} L 40,${totalH - 25}" fill="none" stroke="#94a3b8" stroke-width="3"/>
      <path d="M ${totalW - 40},65 L ${totalW - 25},65 L ${totalW - 25},${totalH - 25} L ${totalW - 40},${totalH - 25}" fill="none" stroke="#94a3b8" stroke-width="3"/>
    `;

    let curX = 45;
    const midY = 65 + tileH / 2;

    resData.forms.forEach((f, i) => {
      if (i > 0) {
        // Double headed arrow <-->
        svg += `
          <line x1="${curX + 8}" y1="${midY}" x2="${curX + arrowW - 8}" y2="${midY}" stroke="#334155" stroke-width="2"/>
          <polygon points="${curX + 8},${midY} ${curX + 16},${midY - 4} ${curX + 16},${midY + 4}" fill="#334155"/>
          <polygon points="${curX + arrowW - 8},${midY} ${curX + arrowW - 16},${midY - 4} ${curX + arrowW - 16},${midY + 4}" fill="#334155"/>
        `;
        curX += arrowW;
      }

      svg += `
        <!-- Form Tile -->
        <rect x="${curX}" y="65" width="${tileW}" height="${tileH}" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="${curX + tileW / 2}" y="92" font-size="13" font-weight="bold" fill="#0369a1" text-anchor="middle">${escapeXml(f.name)}</text>
        <rect x="${curX + 15}" y="105" width="${tileW - 30}" height="45" rx="6" fill="#e2e8f0"/>
        <text x="${curX + tileW / 2}" y="132" font-size="12" font-family="monospace" fill="#1e293b" text-anchor="middle">${escapeXml(f.formula)}</text>
        <text x="${curX + tileW / 2}" y="178" font-size="10" font-weight="600" fill="#dc2626" text-anchor="middle">${escapeXml(f.charge)}</text>
      `;
      curX += tileW;
    });

    svg += `</svg>`;
    return svg;
  }

  /**
   * Generates a side-by-side molecular comparison SVG grid
   */
  public static createComparisonSvg(compounds: Array<{ name: string; formula?: string; mw?: number; smiles?: string; imgBase64?: string }>, title: string = "Structure Comparison"): string {
    const tileW = 220;
    const tileH = 220;
    const gap = 24;
    const cols = compounds.length;
    const totalW = 40 + cols * tileW + (cols - 1) * gap + 40;
    const totalH = tileH + 80;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" style="background-color:#ffffff; font-family:system-ui,-apple-system,sans-serif;">
      <!-- Title -->
      <text x="${totalW / 2}" y="28" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">${escapeXml(title)}</text>
    `;

    let curX = 40;
    compounds.forEach((c) => {
      svg += `
        <!-- Molecule Card -->
        <rect x="${curX}" y="45" width="${tileW}" height="${tileH}" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="${curX + tileW / 2}" y="70" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">${escapeXml(c.name)}</text>
        <text x="${curX + tileW / 2}" y="88" font-size="11" font-weight="600" fill="#0284c7" text-anchor="middle">${c.formula ? `Formula: ${c.formula}` : ""}${c.mw ? ` | MW: ${c.mw}` : ""}</text>
      `;

      if (c.imgBase64) {
        svg += `<image href="data:image/png;base64,${c.imgBase64}" x="${curX + 15}" y="98" width="${tileW - 30}" height="110" preserveAspectRatio="xMidYMid meet"/>`;
      } else {
        svg += `
          <rect x="${curX + 15}" y="98" width="${tileW - 30}" height="110" rx="8" fill="#e2e8f0"/>
          <text x="${curX + tileW / 2}" y="158" font-size="12" font-family="monospace" fill="#334155" text-anchor="middle">${escapeXml(c.smiles || c.name)}</text>
        `;
      }

      curX += tileW + gap;
    });

    svg += `</svg>`;
    return svg;
  }
}

function escapeXml(unsafe: string): string {
  return (unsafe || "").replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
