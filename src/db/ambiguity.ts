export interface AmbiguityCandidate {
  name: string;
  smiles: string;
  iupacName?: string;
  description: string;
}

export interface AmbiguityCheckResult {
  isAmbiguous: boolean;
  query: string;
  message?: string;
  candidates?: AmbiguityCandidate[];
}

const AMBIGUOUS_FAMILIES: Record<string, { message: string; candidates: AmbiguityCandidate[] }> = {
  "cresol": {
    message: "The name 'cresol' is ambiguous as it refers to three positional isomers of methylphenol. Please specify which isomer you require.",
    candidates: [
      { name: "o-Cresol", smiles: "Cc1ccccc1O", iupacName: "2-methylphenol", description: "Ortho isomer (2-methylphenol)" },
      { name: "m-Cresol", smiles: "Cc1cccc(O)c1", iupacName: "3-methylphenol", description: "Meta isomer (3-methylphenol)" },
      { name: "p-Cresol", smiles: "Cc1ccc(O)cc1", iupacName: "4-methylphenol", description: "Para isomer (4-methylphenol)" }
    ]
  },
  "cresols": {
    message: "The name 'cresols' refers to positional isomers of methylphenol.",
    candidates: [
      { name: "o-Cresol", smiles: "Cc1ccccc1O", iupacName: "2-methylphenol", description: "Ortho isomer (2-methylphenol)" },
      { name: "m-Cresol", smiles: "Cc1cccc(O)c1", iupacName: "3-methylphenol", description: "Meta isomer (3-methylphenol)" },
      { name: "p-Cresol", smiles: "Cc1ccc(O)cc1", iupacName: "4-methylphenol", description: "Para isomer (4-methylphenol)" }
    ]
  },
  "xylene": {
    message: "The name 'xylene' refers to three dimethylbenzene positional isomers. Please specify ortho, meta, or para.",
    candidates: [
      { name: "o-Xylene", smiles: "Cc1ccccc1C", iupacName: "1,2-dimethylbenzene", description: "Ortho isomer (1,2-dimethylbenzene)" },
      { name: "m-Xylene", smiles: "Cc1cccc(C)c1", iupacName: "1,3-dimethylbenzene", description: "Meta isomer (1,3-dimethylbenzene)" },
      { name: "p-Xylene", smiles: "Cc1ccc(C)cc1", iupacName: "1,4-dimethylbenzene", description: "Para isomer (1,4-dimethylbenzene)" }
    ]
  },
  "butanol": {
    message: "The query 'butanol' is ambiguous as it could refer to four structural isomers of C4H9OH. Please specify the desired isomer.",
    candidates: [
      { name: "1-Butanol", smiles: "CCCCO", iupacName: "butan-1-ol", description: "Primary straight-chain alcohol (n-butanol)" },
      { name: "2-Butanol", smiles: "CCC(C)O", iupacName: "butan-2-ol", description: "Secondary alcohol (sec-butanol)" },
      { name: "Isobutanol", smiles: "CC(C)CO", iupacName: "2-methylpropan-1-ol", description: "Branched primary alcohol" },
      { name: "tert-Butanol", smiles: "CC(C)(C)O", iupacName: "2-methylpropan-2-ol", description: "Tertiary alcohol (t-butanol)" }
    ]
  },
  "butyl alcohol": {
    message: "The name 'butyl alcohol' refers to four constitutional isomers of C4H10O.",
    candidates: [
      { name: "1-Butanol", smiles: "CCCCO", iupacName: "butan-1-ol", description: "n-Butyl alcohol" },
      { name: "2-Butanol", smiles: "CCC(C)O", iupacName: "butan-2-ol", description: "sec-Butyl alcohol" },
      { name: "Isobutanol", smiles: "CC(C)CO", iupacName: "2-methylpropan-1-ol", description: "Isobutyl alcohol" },
      { name: "tert-Butanol", smiles: "CC(C)(C)O", iupacName: "2-methylpropan-2-ol", description: "tert-Butyl alcohol" }
    ]
  },
  "toluidine": {
    message: "The name 'toluidine' refers to three aminotoluene positional isomers.",
    candidates: [
      { name: "o-Toluidine", smiles: "Cc1ccccc1N", iupacName: "2-methylaniline", description: "Ortho isomer" },
      { name: "m-Toluidine", smiles: "Cc1cccc(N)c1", iupacName: "3-methylaniline", description: "Meta isomer" },
      { name: "p-Toluidine", smiles: "Cc1ccc(N)cc1", iupacName: "4-methylaniline", description: "Para isomer" }
    ]
  },
  "nitroaniline": {
    message: "The name 'nitroaniline' is ambiguous without specifying the position of the nitro group relative to the amino group.",
    candidates: [
      { name: "2-Nitroaniline", smiles: "Nc1ccccc1[N+](=O)[O-]", iupacName: "2-nitroaniline", description: "o-Nitroaniline" },
      { name: "3-Nitroaniline", smiles: "Nc1cccc([N+](=O)[O-])c1", iupacName: "3-nitroaniline", description: "m-Nitroaniline" },
      { name: "4-Nitroaniline", smiles: "Nc1ccc([N+](=O)[O-])cc1", iupacName: "4-nitroaniline", description: "p-Nitroaniline" }
    ]
  },
  "hydroxybenzoic acid": {
    message: "The name 'hydroxybenzoic acid' is ambiguous. Please specify ortho (salicylic acid), meta, or para isomer.",
    candidates: [
      { name: "Salicylic acid", smiles: "O=C(O)c1ccccc1O", iupacName: "2-hydroxybenzoic acid", description: "o-Hydroxybenzoic acid" },
      { name: "3-Hydroxybenzoic acid", smiles: "O=C(O)c1cccc(O)c1", iupacName: "3-hydroxybenzoic acid", description: "m-Hydroxybenzoic acid" },
      { name: "4-Hydroxybenzoic acid", smiles: "O=C(O)c1ccc(O)cc1", iupacName: "4-hydroxybenzoic acid", description: "p-Hydroxybenzoic acid" }
    ]
  }
};

export function checkAmbiguity(query: string): AmbiguityCheckResult {
  const norm = query.toLowerCase().trim().replace(/[-_\s]+/g, " ");
  
  if (AMBIGUOUS_FAMILIES[norm]) {
    const fam = AMBIGUOUS_FAMILIES[norm];
    return {
      isAmbiguous: true,
      query,
      message: fam.message,
      candidates: fam.candidates
    };
  }
  
  return {
    isAmbiguous: false,
    query
  };
}
