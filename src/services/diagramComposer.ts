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
    description: "Unimolecular nucleophilic substitution proceeding via a planar carbocation intermediate with racemization.",
    steps: [
      {
        stepNum: 1,
        title: "Step 1: Heterolytic C–Br Bond Cleavage (Rate Determining Step)",
        reactants: ["tert-Butyl Bromide", "((CH3)3C-Br)"],
        conditions: "Slow (r.d.s)\nPolar protic solvent",
        products: ["Planar 3° Carbocation ((CH3)3C⁺)", "+ Bromide Leaving Group (Br⁻)"],
        note: "C-Br bond cleaves heterolytically. The tertiary carbocation achieves sp2 planar trigonal geometry."
      },
      {
        stepNum: 2,
        title: "Step 2: Nucleophilic Attack of Water",
        reactants: ["(CH3)3C⁺ Carbocation", "H2O (Nucleophile)"],
        conditions: "Fast\nFront/Back attack (50:50)",
        products: ["Protonated tert-Butanol", "((CH3)3C-OH2⁺)"],
        note: "H2O lone pair attacks the empty p-orbital equally from top or bottom face, resulting in racemization."
      },
      {
        stepNum: 3,
        title: "Step 3: Deprotonation to Neutral Alcohol",
        reactants: ["(CH3)3C-OH2⁺", "H2O (Solvent Base)"],
        conditions: "Fast acid-base transfer\n- H3O⁺",
        products: ["tert-Butanol ((CH3)3C-OH)", "+ Hydronium Ion (H3O⁺)"],
        note: "Solvent water molecule abstracts the proton to yield the neutral tertiary alcohol product."
      }
    ]
  },
  sn2: {
    title: "SN2 Mechanism: Hydroxide Substitution of Bromomethane",
    description: "Bimolecular concerted nucleophilic substitution with 100% inversion of configuration (Walden Inversion).",
    steps: [
      {
        stepNum: 1,
        title: "Concerted Backside Attack & Walden Inversion",
        reactants: ["Hydroxide Ion (OH⁻)", "Bromomethane (CH3-Br)"],
        conditions: "180° Backside Attack\nTransition State: [HO···CH3···Br]‡",
        products: ["Methanol (CH3-OH, Inverted)", "+ Bromide Ion (Br⁻)"],
        note: "Nucleophile attacks at 180° to leaving group through a pentacoordinated transition state with 100% configuration inversion."
      }
    ]
  },
  eas: {
    title: "Electrophilic Aromatic Substitution (EAS): Bromination of Benzene",
    description: "Electrophilic aromatic substitution proceeding via Arenium ion (Wheland / Sigma complex) resonance hybrid.",
    steps: [
      {
        stepNum: 1,
        title: "Step 1: Generation of Strong Electrophile (Br⁺)",
        reactants: ["Bromine (Br2)", "FeBr3 (Lewis Acid Catalyst)"],
        conditions: "Lewis Acid Complexation\nPolarization",
        products: ["Bromonium Electrophile (Br⁺)", "+ [FeBr4]⁻ Counterion"],
        note: "Lewis acid FeBr3 coordinates with Br2, polarizing the Br-Br bond and generating the reactive electrophilic Br+ species."
      },
      {
        stepNum: 2,
        title: "Step 2: Attack on Benzene Ring (Sigma Complex Formation)",
        reactants: ["Benzene Ring (C6H6)", "Br⁺ Electrophile"],
        conditions: "Slow (r.d.s)\nTemporary loss of aromaticity",
        products: ["Arenium Ion / Wheland Intermediate", "(Sigma Complex, C6H6Br⁺)"],
        note: "Aromatic pi-electrons attack Br+, forming a resonance-stabilized non-aromatic cyclohexadienyl cation intermediate."
      },
      {
        stepNum: 3,
        title: "Step 3: Deprotonation & Restoration of Aromaticity",
        reactants: ["Arenium Sigma Complex", "[FeBr4]⁻ Base"],
        conditions: "Fast proton abstraction\n- H⁺",
        products: ["Bromobenzene (C6H5Br)", "+ HBr + FeBr3 (Catalyst regenerated)"],
        note: "[FeBr4]- abstracts the sp3 proton, returning the electron pair to restore the 6 pi aromatic sextet."
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
        conditions: "Electrophilic attack (Slow)\nr.d.s",
        products: ["Ethyl Carbocation (CH3-CH2⁺)", "+ H2O"],
        note: "Pi-bond electrons attack H+ from hydronium, generating the carbocation intermediate."
      },
      {
        stepNum: 2,
        title: "Step 2: Nucleophilic Attack of Water & Deprotonation",
        reactants: ["CH3-CH2⁺ Carbocation", "H2O (Nucleophile)"],
        conditions: "Fast attack &\nproton loss",
        products: ["Ethanol (CH3-CH2-OH)", "+ H3O⁺ (Catalyst regenerated)"],
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
        conditions: "Acid-base equilibrium\nKa ~ 10⁻²⁰",
        products: ["Enolate Nucleophile (⁻CH2-CH=O)", "+ H2O"],
        note: "Base abstracts weakly acidic alpha-hydrogen forming resonance-stabilized enolate."
      },
      {
        stepNum: 2,
        title: "Step 2: Nucleophilic Addition to 2nd Carbonyl Molecule",
        reactants: ["Enolate Ion (⁻CH2-CH=O)", "Acetaldehyde (CH3-CH=O)"],
        conditions: "C–C Bond Formation\nNucleophilic Addition",
        products: ["Alkoxide Intermediate", "(CH3-CH(O⁻)-CH2-CH=O)"],
        note: "Enolate carbon attacks the electrophilic carbonyl carbon of 2nd aldehyde forming a new C-C bond."
      },
      {
        stepNum: 3,
        title: "Step 3: Protonation to Form Aldol Product",
        reactants: ["Alkoxide Intermediate", "H2O"],
        conditions: "Protonation\nRegenerates catalyst",
        products: ["3-Hydroxybutanal (Aldol)", "+ OH⁻ (Regenerated)"],
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
   * Generates a giant, ultra-high-resolution, easily readable SVG reaction diagram
   */
  public static createReactionSvg(
    reactants: Array<{ name: string; smiles?: string; imgBase64?: string }>,
    products: Array<{ name: string; smiles?: string; imgBase64?: string }>,
    conditions?: string,
    title: string = "Chemical Reaction Diagram"
  ): string {
    const tileW = 380;
    const tileH = 300;
    const plusW = 70;
    const arrowW = Math.max(280, (conditions?.length || 0) * 14 + 80);

    const reactantWidth = reactants.length * tileW + (reactants.length - 1) * plusW;
    const productWidth = products.length * tileW + (products.length - 1) * plusW;
    const totalW = reactantWidth + arrowW + productWidth + 140;
    const totalH = tileH + 160;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" style="background-color:#ffffff; font-family:system-ui,-apple-system,sans-serif;">
      <!-- Title -->
      <text x="${totalW / 2}" y="44" font-size="26" font-weight="bold" fill="#0f172a" text-anchor="middle">${escapeXml(title)}</text>
    `;

    let curX = 70;
    const midY = 70 + tileH / 2;

    // Reactants
    reactants.forEach((r, i) => {
      if (i > 0) {
        svg += `
          <!-- Plus Sign -->
          <line x1="${curX + plusW / 2 - 18}" y1="${midY}" x2="${curX + plusW / 2 + 18}" y2="${midY}" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
          <line x1="${curX + plusW / 2}" y1="${midY - 18}" x2="${curX + plusW / 2}" y2="${midY + 18}" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
        `;
        curX += plusW;
      }

      svg += `
        <!-- Reactant Card -->
        <rect x="${curX}" y="70" width="${tileW}" height="${tileH}" rx="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>
      `;

      if (r.imgBase64) {
        svg += `<image href="data:image/png;base64,${r.imgBase64}" x="${curX + 20}" y="82" width="${tileW - 40}" height="${tileH - 85}" preserveAspectRatio="xMidYMid meet"/>`;
      } else {
        svg += `
          <rect x="${curX + 25}" y="95" width="${tileW - 50}" height="${tileH - 130}" rx="12" fill="#e2e8f0"/>
          <text x="${curX + tileW / 2}" y="${midY}" font-size="20" font-weight="bold" font-family="monospace" fill="#1e293b" text-anchor="middle">${escapeXml(r.smiles || r.name)}</text>
        `;
      }

      svg += `
        <text x="${curX + tileW / 2}" y="${70 + tileH - 20}" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle">${escapeXml(r.name)}</text>
      `;
      curX += tileW;
    });

    // Arrow
    const arrowStartX = curX + 30;
    const arrowEndX = curX + arrowW - 30;
    const arrowMidX = curX + arrowW / 2;

    svg += `
      <!-- Reaction Arrow -->
      <line x1="${arrowStartX}" y1="${midY}" x2="${arrowEndX}" y2="${midY}" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
      <polygon points="${arrowEndX},${midY} ${arrowEndX - 20},${midY - 10} ${arrowEndX - 10},${midY} ${arrowEndX - 20},${midY + 10}" fill="#0f172a"/>
    `;

    if (conditions) {
      const condLines = conditions.split(/[\n/|]/);
      svg += `<text x="${arrowMidX}" y="${midY - 20}" font-size="18" font-weight="bold" fill="#0284c7" text-anchor="middle">${escapeXml(condLines[0]?.trim() || "")}</text>`;
      if (condLines[1]) {
        svg += `<text x="${arrowMidX}" y="${midY + 36}" font-size="16" font-weight="bold" fill="#64748b" text-anchor="middle">${escapeXml(condLines[1]?.trim() || "")}</text>`;
      }
    }
    curX += arrowW;

    // Products
    products.forEach((p, i) => {
      if (i > 0) {
        svg += `
          <!-- Plus Sign -->
          <line x1="${curX + plusW / 2 - 18}" y1="${midY}" x2="${curX + plusW / 2 + 18}" y2="${midY}" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
          <line x1="${curX + plusW / 2}" y1="${midY - 18}" x2="${curX + plusW / 2}" y2="${midY + 18}" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
        `;
        curX += plusW;
      }

      svg += `
        <!-- Product Card -->
        <rect x="${curX}" y="70" width="${tileW}" height="${tileH}" rx="18" fill="#f0fdf4" stroke="#86efac" stroke-width="2.5"/>
      `;

      if (p.imgBase64) {
        svg += `<image href="data:image/png;base64,${p.imgBase64}" x="${curX + 20}" y="82" width="${tileW - 40}" height="${tileH - 85}" preserveAspectRatio="xMidYMid meet"/>`;
      } else {
        svg += `
          <rect x="${curX + 25}" y="95" width="${tileW - 50}" height="${tileH - 130}" rx="12" fill="#dcfce7"/>
          <text x="${curX + tileW / 2}" y="${midY}" font-size="20" font-weight="bold" font-family="monospace" fill="#166534" text-anchor="middle">${escapeXml(p.smiles || p.name)}</text>
        `;
      }

      svg += `
        <text x="${curX + tileW / 2}" y="${70 + tileH - 20}" font-size="20" font-weight="bold" fill="#14532d" text-anchor="middle">${escapeXml(p.name)}</text>
      `;
      curX += tileW;
    });

    svg += `</svg>`;
    return svg;
  }

  /**
   * Generates a giant, textbook-quality multi-step mechanism diagram with zero text overlaps
   */
  public static createMechanismSvg(mechData: MechanismData): string {
    const width = 1280;
    const stepH = 230;
    const totalH = 120 + mechData.steps.length * (stepH + 28);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalH}" width="${width}" height="${totalH}" style="background-color:#ffffff; font-family:system-ui,-apple-system,sans-serif;">
      <!-- Title & Description Header -->
      <text x="${width / 2}" y="42" font-size="26" font-weight="bold" fill="#0f172a" text-anchor="middle">${escapeXml(mechData.title)}</text>
      <text x="${width / 2}" y="74" font-size="16" fill="#64748b" text-anchor="middle">${escapeXml(mechData.description)}</text>
    `;

    let curY = 105;
    mechData.steps.forEach((step) => {
      const cardW = width - 100;
      const rectX = 50;
      const boxReactantW = 430;
      const arrowW = 230;
      const boxProductW = 480;

      svg += `
        <!-- Step Panel Container -->
        <g transform="translate(${rectX}, ${curY})">
          <rect x="0" y="0" width="${cardW}" height="${stepH}" rx="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>
          
          <!-- Step Header Ribbon -->
          <rect x="0" y="0" width="${cardW}" height="44" rx="18" fill="#e0f2fe"/>
          <rect x="0" y="26" width="${cardW}" height="18" fill="#e0f2fe"/>
          <text x="24" y="29" font-size="17" font-weight="bold" fill="#0369a1">${escapeXml(step.title)}</text>
          
          <!-- Reactants Card -->
          <g transform="translate(28, 62)">
            <rect x="0" y="0" width="${boxReactantW}" height="84" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
            <text x="${boxReactantW / 2}" y="${step.reactants.length > 1 ? 36 : 48}" font-size="17" font-weight="bold" fill="#1e293b" text-anchor="middle">${escapeXml(step.reactants[0] || "")}</text>
            ${step.reactants[1] ? `<text x="${boxReactantW / 2}" y="64" font-size="15" font-weight="bold" font-family="monospace" fill="#475569" text-anchor="middle">${escapeXml(step.reactants.slice(1).join(" + "))}</text>` : ""}
          </g>
          
          <!-- Arrow & Reaction Conditions -->
          <g transform="translate(${28 + boxReactantW + 20}, 104)">
            <line x1="0" y1="0" x2="${arrowW - 40}" y2="0" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
            <polygon points="${arrowW - 40},0 ${arrowW - 58},-9 ${arrowW - 48},0 ${arrowW - 58},9" fill="#0f172a"/>
            <text x="${(arrowW - 40) / 2}" y="-16" font-size="15" font-weight="bold" fill="#0284c7" text-anchor="middle">${escapeXml(step.conditions.split("\n")[0] || "")}</text>
            ${step.conditions.split("\n")[1] ? `<text x="${(arrowW - 40) / 2}" y="26" font-size="14" font-weight="bold" fill="#64748b" text-anchor="middle">${escapeXml(step.conditions.split("\n")[1])}</text>` : ""}
          </g>
          
          <!-- Products Card -->
          <g transform="translate(${28 + boxReactantW + arrowW + 10}, 62)">
            <rect x="0" y="0" width="${boxProductW}" height="84" rx="14" fill="#f0fdf4" stroke="#86efac" stroke-width="2"/>
            <text x="${boxProductW / 2}" y="${step.products.length > 1 ? 36 : 48}" font-size="17" font-weight="bold" fill="#166534" text-anchor="middle">${escapeXml(step.products[0] || "")}</text>
            ${step.products[1] ? `<text x="${boxProductW / 2}" y="64" font-size="15" font-weight="bold" font-family="monospace" fill="#15803d" text-anchor="middle">${escapeXml(step.products.slice(1).join(" "))}</text>` : ""}
          </g>
          
          <!-- Curved Arrow & Intermediate Note Box -->
          <g transform="translate(28, 160)">
            <rect x="0" y="0" width="${cardW - 56}" height="52" rx="10" fill="#f1f5f9" stroke="#e2e8f0"/>
            <text x="18" y="32" font-size="15" fill="#1e293b">
              <tspan font-weight="bold" fill="#0284c7">⚡ Electron Movement &amp; Intermediate: </tspan>${escapeXml(step.note)}
            </text>
          </g>
        </g>
      `;
      curY += stepH + 28;
    });

    svg += `</svg>`;
    return svg;
  }

  /**
   * Generates a giant resonance contributor SVG diagram
   */
  public static createResonanceSvg(resData: { title: string; explanation: string; forms: Array<{ name: string; formula: string; charge: string }> }): string {
    const tileW = 270;
    const tileH = 220;
    const arrowW = 100;
    const count = resData.forms.length;
    const totalW = 100 + count * tileW + (count - 1) * arrowW + 100;
    const totalH = 380;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" style="background-color:#ffffff; font-family:system-ui,-apple-system,sans-serif;">
      <!-- Title -->
      <text x="${totalW / 2}" y="44" font-size="26" font-weight="bold" fill="#0f172a" text-anchor="middle">${escapeXml(resData.title)}</text>
      <text x="${totalW / 2}" y="76" font-size="16" fill="#64748b" text-anchor="middle">${escapeXml(resData.explanation)}</text>
      
      <!-- Brackets [ ... ] -->
      <path d="M 60,105 L 35,105 L 35,${totalH - 45} L 60,${totalH - 45}" fill="none" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
      <path d="M ${totalW - 60},105 L ${totalW - 35},105 L ${totalW - 35},${totalH - 45} L ${totalW - 60},${totalH - 45}" fill="none" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
    `;

    let curX = 80;
    const midY = 105 + tileH / 2;

    resData.forms.forEach((f, i) => {
      if (i > 0) {
        // Double headed arrow <-->
        svg += `
          <line x1="${curX + 15}" y1="${midY}" x2="${curX + arrowW - 15}" y2="${midY}" stroke="#0f172a" stroke-width="4"/>
          <polygon points="${curX + 15},${midY} ${curX + 30},${midY - 8} ${curX + 30},${midY + 8}" fill="#0f172a"/>
          <polygon points="${curX + arrowW - 15},${midY} ${curX + arrowW - 30},${midY - 8} ${curX + arrowW - 30},${midY + 8}" fill="#0f172a"/>
        `;
        curX += arrowW;
      }

      svg += `
        <!-- Form Tile -->
        <rect x="${curX}" y="105" width="${tileW}" height="${tileH}" rx="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>
        <text x="${curX + tileW / 2}" y="145" font-size="19" font-weight="bold" fill="#0369a1" text-anchor="middle">${escapeXml(f.name)}</text>
        <rect x="${curX + 24}" y="165" width="${tileW - 48}" height="80" rx="10" fill="#e2e8f0"/>
        <text x="${curX + tileW / 2}" y="212" font-size="17" font-weight="bold" font-family="monospace" fill="#1e293b" text-anchor="middle">${escapeXml(f.formula)}</text>
        <text x="${curX + tileW / 2}" y="295" font-size="15" font-weight="bold" fill="#dc2626" text-anchor="middle">${escapeXml(f.charge)}</text>
      `;
      curX += tileW;
    });

    svg += `</svg>`;
    return svg;
  }

  /**
   * Generates a giant side-by-side molecular comparison SVG grid
   */
  public static createComparisonSvg(compounds: Array<{ name: string; formula?: string; mw?: number; smiles?: string; imgBase64?: string }>, title: string = "Structure Comparison"): string {
    const tileW = 360;
    const tileH = 340;
    const gap = 36;
    const cols = compounds.length;
    const totalW = 80 + cols * tileW + (cols - 1) * gap + 80;
    const totalH = tileH + 130;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" style="background-color:#ffffff; font-family:system-ui,-apple-system,sans-serif;">
      <!-- Title -->
      <text x="${totalW / 2}" y="44" font-size="26" font-weight="bold" fill="#0f172a" text-anchor="middle">${escapeXml(title)}</text>
    `;

    let curX = 80;
    compounds.forEach((c) => {
      svg += `
        <!-- Molecule Card -->
        <rect x="${curX}" y="70" width="${tileW}" height="${tileH}" rx="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>
        <text x="${curX + tileW / 2}" y="106" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle">${escapeXml(c.name)}</text>
        <text x="${curX + tileW / 2}" y="132" font-size="15" font-weight="bold" fill="#0284c7" text-anchor="middle">${c.formula ? `Formula: ${c.formula}` : ""}${c.mw ? ` | MW: ${c.mw}` : ""}</text>
      `;

      if (c.imgBase64) {
        svg += `<image href="data:image/png;base64,${c.imgBase64}" x="${curX + 24}" y="145" width="${tileW - 48}" height="170" preserveAspectRatio="xMidYMid meet"/>`;
      } else {
        svg += `
          <rect x="${curX + 24}" y="145" width="${tileW - 48}" height="170" rx="12" fill="#e2e8f0"/>
          <text x="${curX + tileW / 2}" y="240" font-size="18" font-weight="bold" font-family="monospace" fill="#334155" text-anchor="middle">${escapeXml(c.smiles || c.name)}</text>
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
