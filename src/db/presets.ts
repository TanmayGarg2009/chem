export interface ChemicalPreset {
  id: string;
  name: string;
  synonyms: string[];
  smiles: string;
  formula: string;
  molecularWeight: number;
  category: "Hydrocarbon" | "Haloalkane/Haloarene" | "Alcohol/Phenol" | "Ether" | "Aldehyde/Ketone" | "Carboxylic Acid/Derivative" | "Amine/Nitro" | "Biomolecule" | "Reagent";
  iupacName?: string;
  pubchemCid?: string;
  inchi?: string;
  inchikey?: string;
  description?: string;
}

export const CHEMICAL_PRESETS: ChemicalPreset[] = [
  // --- HYDROCARBONS ---
  {
    id: "methane",
    name: "Methane",
    synonyms: ["marsh gas", "ch4"],
    smiles: "C",
    formula: "CH4",
    molecularWeight: 16.043,
    category: "Hydrocarbon",
    iupacName: "methane",
    pubchemCid: "297"
  },
  {
    id: "ethane",
    name: "Ethane",
    synonyms: ["c2h6"],
    smiles: "CC",
    formula: "C2H6",
    molecularWeight: 30.07,
    category: "Hydrocarbon",
    iupacName: "ethane",
    pubchemCid: "6324"
  },
  {
    id: "propane",
    name: "Propane",
    synonyms: ["c3h8"],
    smiles: "CCC",
    formula: "C3H8",
    molecularWeight: 44.097,
    category: "Hydrocarbon",
    iupacName: "propane",
    pubchemCid: "6334"
  },
  {
    id: "butane",
    name: "Butane",
    synonyms: ["n-butane", "c4h10"],
    smiles: "CCCC",
    formula: "C4H10",
    molecularWeight: 58.124,
    category: "Hydrocarbon",
    iupacName: "butane",
    pubchemCid: "7843"
  },
  {
    id: "isobutane",
    name: "Isobutane",
    synonyms: ["2-methylpropane", "i-butane"],
    smiles: "CC(C)C",
    formula: "C4H10",
    molecularWeight: 58.124,
    category: "Hydrocarbon",
    iupacName: "2-methylpropane",
    pubchemCid: "6360"
  },
  {
    id: "ethene",
    name: "Ethene",
    synonyms: ["ethylene", "c2h4"],
    smiles: "C=C",
    formula: "C2H4",
    molecularWeight: 28.054,
    category: "Hydrocarbon",
    iupacName: "ethene",
    pubchemCid: "6325"
  },
  {
    id: "propene",
    name: "Propene",
    synonyms: ["propylene", "c3h6"],
    smiles: "CC=C",
    formula: "C3H6",
    molecularWeight: 42.081,
    category: "Hydrocarbon",
    iupacName: "prop-1-ene",
    pubchemCid: "8252"
  },
  {
    id: "but-1-ene",
    name: "But-1-ene",
    synonyms: ["1-butene", "alpha-butylene"],
    smiles: "CCC=C",
    formula: "C4H8",
    molecularWeight: 56.108,
    category: "Hydrocarbon",
    iupacName: "but-1-ene",
    pubchemCid: "7844"
  },
  {
    id: "but-2-ene",
    name: "But-2-ene",
    synonyms: ["2-butene", "beta-butylene"],
    smiles: "CC=CC",
    formula: "C4H8",
    molecularWeight: 56.108,
    category: "Hydrocarbon",
    iupacName: "but-2-ene",
    pubchemCid: "62695"
  },
  {
    id: "ethyne",
    name: "Ethyne",
    synonyms: ["acetylene", "c2h2"],
    smiles: "C#C",
    formula: "C2H2",
    molecularWeight: 26.038,
    category: "Hydrocarbon",
    iupacName: "ethyne",
    pubchemCid: "6326"
  },
  {
    id: "propyne",
    name: "Propyne",
    synonyms: ["methylacetylene", "c3h4"],
    smiles: "CC#C",
    formula: "C3H4",
    molecularWeight: 40.065,
    category: "Hydrocarbon",
    iupacName: "prop-1-yne",
    pubchemCid: "6335"
  },
  {
    id: "benzene",
    name: "Benzene",
    synonyms: ["c6h6", "benzol", "[6]annulene"],
    smiles: "c1ccccc1",
    formula: "C6H6",
    molecularWeight: 78.114,
    category: "Hydrocarbon",
    iupacName: "benzene",
    pubchemCid: "241"
  },
  {
    id: "toluene",
    name: "Toluene",
    synonyms: ["methylbenzene", "phenylmethane", "c7h8"],
    smiles: "Cc1ccccc1",
    formula: "C7H8",
    molecularWeight: 92.141,
    category: "Hydrocarbon",
    iupacName: "methylbenzene",
    pubchemCid: "1140"
  },
  {
    id: "o-xylene",
    name: "o-Xylene",
    synonyms: ["1,2-dimethylbenzene", "ortho-xylene"],
    smiles: "Cc1ccccc1C",
    formula: "C8H10",
    molecularWeight: 106.168,
    category: "Hydrocarbon",
    iupacName: "1,2-dimethylbenzene",
    pubchemCid: "7237"
  },
  {
    id: "m-xylene",
    name: "m-Xylene",
    synonyms: ["1,3-dimethylbenzene", "meta-xylene"],
    smiles: "Cc1cccc(C)c1",
    formula: "C8H10",
    molecularWeight: 106.168,
    category: "Hydrocarbon",
    iupacName: "1,3-dimethylbenzene",
    pubchemCid: "7929"
  },
  {
    id: "p-xylene",
    name: "p-Xylene",
    synonyms: ["1,4-dimethylbenzene", "para-xylene"],
    smiles: "Cc1ccc(C)cc1",
    formula: "C8H10",
    molecularWeight: 106.168,
    category: "Hydrocarbon",
    iupacName: "1,4-dimethylbenzene",
    pubchemCid: "7809"
  },
  {
    id: "ethylbenzene",
    name: "Ethylbenzene",
    synonyms: ["phenylethane"],
    smiles: "CCc1ccccc1",
    formula: "C8H10",
    molecularWeight: 106.168,
    category: "Hydrocarbon",
    iupacName: "ethylbenzene",
    pubchemCid: "7500"
  },
  {
    id: "styrene",
    name: "Styrene",
    synonyms: ["vinylbenzene", "phenylethene"],
    smiles: "C=Cc1ccccc1",
    formula: "C8H8",
    molecularWeight: 104.152,
    category: "Hydrocarbon",
    iupacName: "ethenylbenzene",
    pubchemCid: "7501"
  },
  {
    id: "cumene",
    name: "Cumene",
    synonyms: ["isopropylbenzene", "2-phenylpropane"],
    smiles: "CC(C)c1ccccc1",
    formula: "C9H12",
    molecularWeight: 120.195,
    category: "Hydrocarbon",
    iupacName: "propan-2-ylbenzene",
    pubchemCid: "7406"
  },
  {
    id: "naphthalene",
    name: "Naphthalene",
    synonyms: ["c10h8", "tar camphor"],
    smiles: "c1ccc2ccccc2c1",
    formula: "C10H8",
    molecularWeight: 128.174,
    category: "Hydrocarbon",
    iupacName: "naphthalene",
    pubchemCid: "931"
  },
  {
    id: "anthracene",
    name: "Anthracene",
    synonyms: ["c14h10"],
    smiles: "c1ccc2cc3ccccc3cc2c1",
    formula: "C14H10",
    molecularWeight: 178.234,
    category: "Hydrocarbon",
    iupacName: "anthracene",
    pubchemCid: "8418"
  },

  // --- ALCOHOLS & PHENOLS ---
  {
    id: "methanol",
    name: "Methanol",
    synonyms: ["methyl alcohol", "wood alcohol", "ch3oh"],
    smiles: "CO",
    formula: "CH4O",
    molecularWeight: 32.042,
    category: "Alcohol/Phenol",
    iupacName: "methanol",
    pubchemCid: "887"
  },
  {
    id: "ethanol",
    name: "Ethanol",
    synonyms: ["ethyl alcohol", "grain alcohol", "c2h5oh", "cco"],
    smiles: "CCO",
    formula: "C2H6O",
    molecularWeight: 46.069,
    category: "Alcohol/Phenol",
    iupacName: "ethanol",
    pubchemCid: "702"
  },
  {
    id: "1-propanol",
    name: "1-Propanol",
    synonyms: ["propan-1-ol", "n-propyl alcohol", "propyl alcohol"],
    smiles: "CCCO",
    formula: "C3H8O",
    molecularWeight: 60.096,
    category: "Alcohol/Phenol",
    iupacName: "propan-1-ol",
    pubchemCid: "1031"
  },
  {
    id: "isopropanol",
    name: "Isopropanol",
    synonyms: ["isopropyl alcohol", "propan-2-ol", "2-propanol", "ipa"],
    smiles: "CC(O)C",
    formula: "C3H8O",
    molecularWeight: 60.096,
    category: "Alcohol/Phenol",
    iupacName: "propan-2-ol",
    pubchemCid: "3776"
  },
  {
    id: "1-butanol",
    name: "1-Butanol",
    synonyms: ["butan-1-ol", "n-butyl alcohol", "n-butanol"],
    smiles: "CCCCO",
    formula: "C4H10O",
    molecularWeight: 74.123,
    category: "Alcohol/Phenol",
    iupacName: "butan-1-ol",
    pubchemCid: "263"
  },
  {
    id: "2-butanol",
    name: "2-Butanol",
    synonyms: ["butan-2-ol", "sec-butanol", "sec-butyl alcohol"],
    smiles: "CCC(C)O",
    formula: "C4H10O",
    molecularWeight: 74.123,
    category: "Alcohol/Phenol",
    iupacName: "butan-2-ol",
    pubchemCid: "6568"
  },
  {
    id: "isobutanol",
    name: "Isobutanol",
    synonyms: ["2-methylpropan-1-ol", "isobutyl alcohol"],
    smiles: "CC(C)CO",
    formula: "C4H10O",
    molecularWeight: 74.123,
    category: "Alcohol/Phenol",
    iupacName: "2-methylpropan-1-ol",
    pubchemCid: "5167"
  },
  {
    id: "tert-butanol",
    name: "tert-Butanol",
    synonyms: ["2-methylpropan-2-ol", "tert-butyl alcohol", "t-butanol"],
    smiles: "CC(C)(C)O",
    formula: "C4H10O",
    molecularWeight: 74.123,
    category: "Alcohol/Phenol",
    iupacName: "2-methylpropan-2-ol",
    pubchemCid: "6386"
  },
  {
    id: "ethylene glycol",
    name: "Ethylene Glycol",
    synonyms: ["ethane-1,2-diol", "1,2-ethanediol", "glycol"],
    smiles: "OCCO",
    formula: "C2H6O2",
    molecularWeight: 62.068,
    category: "Alcohol/Phenol",
    iupacName: "ethane-1,2-diol",
    pubchemCid: "174"
  },
  {
    id: "glycerol",
    name: "Glycerol",
    synonyms: ["glycerin", "propane-1,2,3-triol", "1,2,3-propanetriol"],
    smiles: "OCC(O)CO",
    formula: "C3H8O3",
    molecularWeight: 92.094,
    category: "Alcohol/Phenol",
    iupacName: "propane-1,2,3-triol",
    pubchemCid: "753"
  },
  {
    id: "phenol",
    name: "Phenol",
    synonyms: ["carbolic acid", "hydroxybenzene", "c6h5oh"],
    smiles: "Oc1ccccc1",
    formula: "C6H6O",
    molecularWeight: 94.113,
    category: "Alcohol/Phenol",
    iupacName: "phenol",
    pubchemCid: "996"
  },
  {
    id: "o-cresol",
    name: "o-Cresol",
    synonyms: ["2-methylphenol", "ortho-cresol"],
    smiles: "Cc1ccccc1O",
    formula: "C7H8O",
    molecularWeight: 108.14,
    category: "Alcohol/Phenol",
    iupacName: "2-methylphenol",
    pubchemCid: "335"
  },
  {
    id: "m-cresol",
    name: "m-Cresol",
    synonyms: ["3-methylphenol", "meta-cresol"],
    smiles: "Cc1cccc(O)c1",
    formula: "C7H8O",
    molecularWeight: 108.14,
    category: "Alcohol/Phenol",
    iupacName: "3-methylphenol",
    pubchemCid: "342"
  },
  {
    id: "p-cresol",
    name: "p-Cresol",
    synonyms: ["4-methylphenol", "para-cresol"],
    smiles: "Cc1ccc(O)cc1",
    formula: "C7H8O",
    molecularWeight: 108.14,
    category: "Alcohol/Phenol",
    iupacName: "4-methylphenol",
    pubchemCid: "2879"
  },
  {
    id: "catechol",
    name: "Catechol",
    synonyms: ["benzene-1,2-diol", "1,2-dihydroxybenzene", "pyrocatechol"],
    smiles: "Oc1ccccc1O",
    formula: "C6H6O2",
    molecularWeight: 110.112,
    category: "Alcohol/Phenol",
    iupacName: "benzene-1,2-diol",
    pubchemCid: "289"
  },
  {
    id: "resorcinol",
    name: "Resorcinol",
    synonyms: ["benzene-1,3-diol", "1,3-dihydroxybenzene"],
    smiles: "Oc1cccc(O)c1",
    formula: "C6H6O2",
    molecularWeight: 110.112,
    category: "Alcohol/Phenol",
    iupacName: "benzene-1,3-diol",
    pubchemCid: "5054"
  },
  {
    id: "hydroquinone",
    name: "Hydroquinone",
    synonyms: ["benzene-1,4-diol", "1,4-dihydroxybenzene", "quinol"],
    smiles: "Oc1ccc(O)cc1",
    formula: "C6H6O2",
    molecularWeight: 110.112,
    category: "Alcohol/Phenol",
    iupacName: "benzene-1,4-diol",
    pubchemCid: "785"
  },
  {
    id: "picric acid",
    name: "Picric Acid",
    synonyms: ["2,4,6-trinitrophenol", "tnp"],
    smiles: "Oc1c(cc(cc1[N+](=O)[O-])[N+](=O)[O-])[N+](=O)[O-]",
    formula: "C6H3N3O7",
    molecularWeight: 229.104,
    category: "Alcohol/Phenol",
    iupacName: "2,4,6-trinitrophenol",
    pubchemCid: "6954"
  },

  // --- ALDEHYDES & KETONES ---
  {
    id: "formaldehyde",
    name: "Formaldehyde",
    synonyms: ["methanal", "formalin", "hcho"],
    smiles: "C=O",
    formula: "CH2O",
    molecularWeight: 30.026,
    category: "Aldehyde/Ketone",
    iupacName: "methanal",
    pubchemCid: "712"
  },
  {
    id: "acetaldehyde",
    name: "Acetaldehyde",
    synonyms: ["ethanal", "ch3cho"],
    smiles: "CC=O",
    formula: "C2H4O",
    molecularWeight: 44.053,
    category: "Aldehyde/Ketone",
    iupacName: "ethanal",
    pubchemCid: "177"
  },
  {
    id: "propionaldehyde",
    name: "Propionaldehyde",
    synonyms: ["propanal", "propyl aldehyde"],
    smiles: "CCC=O",
    formula: "C3H6O",
    molecularWeight: 58.08,
    category: "Aldehyde/Ketone",
    iupacName: "propanal",
    pubchemCid: "527"
  },
  {
    id: "benzaldehyde",
    name: "Benzaldehyde",
    synonyms: ["benzoic aldehyde", "oil of bitter almond", "c6h5cho", "O=Cc1ccccc1"],
    smiles: "O=Cc1ccccc1",
    formula: "C7H6O",
    molecularWeight: 106.124,
    category: "Aldehyde/Ketone",
    iupacName: "benzaldehyde",
    pubchemCid: "240"
  },
  {
    id: "cinnamaldehyde",
    name: "Cinnamaldehyde",
    synonyms: ["cinnamic aldehyde", "3-phenylprop-2-enal"],
    smiles: "O=CC=Cc1ccccc1",
    formula: "C9H8O",
    molecularWeight: 132.162,
    category: "Aldehyde/Ketone",
    iupacName: "(2E)-3-phenylprop-2-enal",
    pubchemCid: "637511"
  },
  {
    id: "salicylaldehyde",
    name: "Salicylaldehyde",
    synonyms: ["2-hydroxybenzaldehyde"],
    smiles: "O=Cc1ccccc1O",
    formula: "C7H6O2",
    molecularWeight: 122.123,
    category: "Aldehyde/Ketone",
    iupacName: "2-hydroxybenzaldehyde",
    pubchemCid: "6998"
  },
  {
    id: "acetone",
    name: "Acetone",
    synonyms: ["propan-2-one", "propanone", "dimethyl ketone", "ch3coch3"],
    smiles: "CC(=O)C",
    formula: "C3H6O",
    molecularWeight: 58.08,
    category: "Aldehyde/Ketone",
    iupacName: "propan-2-one",
    pubchemCid: "180"
  },
  {
    id: "butanone",
    name: "Butanone",
    synonyms: ["butan-2-one", "methyl ethyl ketone", "mek"],
    smiles: "CCC(=O)C",
    formula: "C4H8O",
    molecularWeight: 72.107,
    category: "Aldehyde/Ketone",
    iupacName: "butan-2-one",
    pubchemCid: "6569"
  },
  {
    id: "acetophenone",
    name: "Acetophenone",
    synonyms: ["1-phenylethan-1-one", "methyl phenyl ketone"],
    smiles: "CC(=O)c1ccccc1",
    formula: "C8H8O",
    molecularWeight: 120.151,
    category: "Aldehyde/Ketone",
    iupacName: "1-phenylethan-1-one",
    pubchemCid: "7410"
  },
  {
    id: "benzophenone",
    name: "Benzophenone",
    synonyms: ["diphenylmethanone", "diphenyl ketone"],
    smiles: "O=C(c1ccccc1)c2ccccc2",
    formula: "C13H10O",
    molecularWeight: 182.222,
    category: "Aldehyde/Ketone",
    iupacName: "diphenylmethanone",
    pubchemCid: "3102"
  },
  {
    id: "cyclohexanone",
    name: "Cyclohexanone",
    synonyms: ["pimelic ketone", "anona"],
    smiles: "O=C1CCCCC1",
    formula: "C6H10O",
    molecularWeight: 98.144,
    category: "Aldehyde/Ketone",
    iupacName: "cyclohexanone",
    pubchemCid: "7967"
  },

  // --- CARBOXYLIC ACIDS & DERIVATIVES ---
  {
    id: "formic acid",
    name: "Formic Acid",
    synonyms: ["methanoic acid", "hcooh"],
    smiles: "C(=O)O",
    formula: "CH2O2",
    molecularWeight: 46.025,
    category: "Carboxylic Acid/Derivative",
    iupacName: "methanoic acid",
    pubchemCid: "280"
  },
  {
    id: "acetic acid",
    name: "Acetic Acid",
    synonyms: ["ethanoic acid", "vinegar acid", "ch3cooh"],
    smiles: "CC(=O)O",
    formula: "C2H4O2",
    molecularWeight: 60.052,
    category: "Carboxylic Acid/Derivative",
    iupacName: "ethanoic acid",
    pubchemCid: "176"
  },
  {
    id: "propionic acid",
    name: "Propionic Acid",
    synonyms: ["propanoic acid", "ch3ch2cooh"],
    smiles: "CCC(=O)O",
    formula: "C3H6O2",
    molecularWeight: 74.079,
    category: "Carboxylic Acid/Derivative",
    iupacName: "propanoic acid",
    pubchemCid: "1032"
  },
  {
    id: "benzoic acid",
    name: "Benzoic Acid",
    synonyms: ["benzenecarboxylic acid", "c6h5cooh"],
    smiles: "O=C(O)c1ccccc1",
    formula: "C7H6O2",
    molecularWeight: 122.123,
    category: "Carboxylic Acid/Derivative",
    iupacName: "benzoic acid",
    pubchemCid: "243"
  },
  {
    id: "salicylic acid",
    name: "Salicylic Acid",
    synonyms: ["2-hydroxybenzoic acid"],
    smiles: "O=C(O)c1ccccc1O",
    formula: "C7H6O3",
    molecularWeight: 138.122,
    category: "Carboxylic Acid/Derivative",
    iupacName: "2-hydroxybenzoic acid",
    pubchemCid: "338"
  },
  {
    id: "oxalic acid",
    name: "Oxalic Acid",
    synonyms: ["ethanedioic acid", "hooc-cooh"],
    smiles: "O=C(O)C(=O)O",
    formula: "C2H2O4",
    molecularWeight: 90.034,
    category: "Carboxylic Acid/Derivative",
    iupacName: "ethanedioic acid",
    pubchemCid: "971"
  },
  {
    id: "phthalic acid",
    name: "Phthalic Acid",
    synonyms: ["benzene-1,2-dicarboxylic acid"],
    smiles: "O=C(O)c1ccccc1C(=O)O",
    formula: "C8H6O4",
    molecularWeight: 166.132,
    category: "Carboxylic Acid/Derivative",
    iupacName: "benzene-1,2-dicarboxylic acid",
    pubchemCid: "1017"
  },
  {
    id: "acetyl chloride",
    name: "Acetyl Chloride",
    synonyms: ["ethanoyl chloride", "ch3cocl"],
    smiles: "CC(=O)Cl",
    formula: "C2H3ClO",
    molecularWeight: 78.497,
    category: "Carboxylic Acid/Derivative",
    iupacName: "ethanoyl chloride",
    pubchemCid: "6338"
  },
  {
    id: "acetic anhydride",
    name: "Acetic Anhydride",
    synonyms: ["ethanoic anhydride", "(ch3co)2o"],
    smiles: "CC(=O)OC(=O)C",
    formula: "C4H6O3",
    molecularWeight: 102.09,
    category: "Carboxylic Acid/Derivative",
    iupacName: "acetyl acetate",
    pubchemCid: "7918"
  },
  {
    id: "ethyl acetate",
    name: "Ethyl Acetate",
    synonyms: ["ethyl ethanoate", "ch3cooc2h5"],
    smiles: "CCOC(=O)C",
    formula: "C4H8O2",
    molecularWeight: 88.106,
    category: "Carboxylic Acid/Derivative",
    iupacName: "ethyl acetate",
    pubchemCid: "8857"
  },
  {
    id: "acetamide",
    name: "Acetamide",
    synonyms: ["ethanamide", "ch3conh2"],
    smiles: "CC(=O)N",
    formula: "C2H5NO",
    molecularWeight: 59.068,
    category: "Carboxylic Acid/Derivative",
    iupacName: "acetamide",
    pubchemCid: "178"
  },

  // --- AMINES & NITRO ---
  {
    id: "methylamine",
    name: "Methylamine",
    synonyms: ["methanamine", "ch3nh2"],
    smiles: "CN",
    formula: "CH5N",
    molecularWeight: 31.057,
    category: "Amine/Nitro",
    iupacName: "methanamine",
    pubchemCid: "6329"
  },
  {
    id: "ethylamine",
    name: "Ethylamine",
    synonyms: ["ethanamine", "c2h5nh2"],
    smiles: "CCN",
    formula: "C2H7N",
    molecularWeight: 45.084,
    category: "Amine/Nitro",
    iupacName: "ethanamine",
    pubchemCid: "6341"
  },
  {
    id: "dimethylamine",
    name: "Dimethylamine",
    synonyms: ["n-methylmethanamine", "(ch3)2nh"],
    smiles: "CNC",
    formula: "C2H7N",
    molecularWeight: 45.084,
    category: "Amine/Nitro",
    iupacName: "N-methylmethanamine",
    pubchemCid: "674"
  },
  {
    id: "trimethylamine",
    name: "Trimethylamine",
    synonyms: ["n,n-dimethylmethanamine", "(ch3)3n"],
    smiles: "CN(C)C",
    formula: "C3H9N",
    molecularWeight: 59.112,
    category: "Amine/Nitro",
    iupacName: "N,N-dimethylmethanamine",
    pubchemCid: "1146"
  },
  {
    id: "aniline",
    name: "Aniline",
    synonyms: ["aminobenzene", "phenylamine", "c6h5nh2"],
    smiles: "Nc1ccccc1",
    formula: "C6H7N",
    molecularWeight: 93.129,
    category: "Amine/Nitro",
    iupacName: "aniline",
    pubchemCid: "6115"
  },
  {
    id: "nitrobenzene",
    name: "Nitrobenzene",
    synonyms: ["oil of mirbane", "c6h5no2"],
    smiles: "[O-][N+](=O)c1ccccc1",
    formula: "C6H5NO2",
    molecularWeight: 123.111,
    category: "Amine/Nitro",
    iupacName: "nitrobenzene",
    pubchemCid: "7416"
  },
  {
    id: "acetanilide",
    name: "Acetanilide",
    synonyms: ["n-phenylacetamide", "antifebrin"],
    smiles: "CC(=O)Nc1ccccc1",
    formula: "C8H9NO",
    molecularWeight: 135.166,
    category: "Amine/Nitro",
    iupacName: "N-phenylacetamide",
    pubchemCid: "904"
  },

  // --- HALOALKANES & HALOARENES ---
  {
    id: "chloromethane",
    name: "Chloromethane",
    synonyms: ["methyl chloride", "ch3cl"],
    smiles: "CCl",
    formula: "CH3Cl",
    molecularWeight: 50.487,
    category: "Haloalkane/Haloarene",
    iupacName: "chloromethane",
    pubchemCid: "6327"
  },
  {
    id: "chloroethane",
    name: "Chloroethane",
    synonyms: ["ethyl chloride", "c2h5cl"],
    smiles: "CCCl",
    formula: "C2H5Cl",
    molecularWeight: 64.514,
    category: "Haloalkane/Haloarene",
    iupacName: "chloroethane",
    pubchemCid: "6339"
  },
  {
    id: "bromoethane",
    name: "Bromoethane",
    synonyms: ["ethyl bromide", "c2h5br"],
    smiles: "CCBr",
    formula: "C2H5Br",
    molecularWeight: 108.965,
    category: "Haloalkane/Haloarene",
    iupacName: "bromoethane",
    pubchemCid: "6332"
  },
  {
    id: "iodoethane",
    name: "Iodoethane",
    synonyms: ["ethyl iodide", "c2h5i"],
    smiles: "CCI",
    formula: "C2H5I",
    molecularWeight: 155.966,
    category: "Haloalkane/Haloarene",
    iupacName: "iodoethane",
    pubchemCid: "7749"
  },
  {
    id: "chlorobenzene",
    name: "Chlorobenzene",
    synonyms: ["phenyl chloride", "c6h5cl"],
    smiles: "Clc1ccccc1",
    formula: "C6H5Cl",
    molecularWeight: 112.556,
    category: "Haloalkane/Haloarene",
    iupacName: "chlorobenzene",
    pubchemCid: "7964"
  },
  {
    id: "bromobenzene",
    name: "Bromobenzene",
    synonyms: ["phenyl bromide", "c6h5br"],
    smiles: "Brc1ccccc1",
    formula: "C6H5Br",
    molecularWeight: 157.01,
    category: "Haloalkane/Haloarene",
    iupacName: "bromobenzene",
    pubchemCid: "7961"
  },
  {
    id: "iodobenzene",
    name: "Iodobenzene",
    synonyms: ["phenyl iodide", "c6h5i"],
    smiles: "Ic1ccccc1",
    formula: "C6H5I",
    molecularWeight: 204.01,
    category: "Haloalkane/Haloarene",
    iupacName: "iodobenzene",
    pubchemCid: "11575"
  },
  {
    id: "dichloromethane",
    name: "Dichloromethane",
    synonyms: ["methylene chloride", "dcm", "ch2cl2"],
    smiles: "ClCCl",
    formula: "CH2Cl2",
    molecularWeight: 84.93,
    category: "Haloalkane/Haloarene",
    iupacName: "dichloromethane",
    pubchemCid: "6344"
  },
  {
    id: "chloroform",
    name: "Chloroform",
    synonyms: ["trichloromethane", "chcl3"],
    smiles: "ClC(Cl)Cl",
    formula: "CHCl3",
    molecularWeight: 119.37,
    category: "Haloalkane/Haloarene",
    iupacName: "trichloromethane",
    pubchemCid: "6212"
  },
  {
    id: "carbon tetrachloride",
    name: "Carbon Tetrachloride",
    synonyms: ["tetrachloromethane", "ccl4"],
    smiles: "ClC(Cl)(Cl)Cl",
    formula: "CCl4",
    molecularWeight: 153.81,
    category: "Haloalkane/Haloarene",
    iupacName: "tetrachloromethane",
    pubchemCid: "5943"
  },

  // --- JEE REAGENTS & INORGANIC/ORGANIC PARTNERS ---
  {
    id: "naoh",
    name: "Sodium Hydroxide",
    synonyms: ["caustic soda", "naoh"],
    smiles: "[Na+].[OH-]",
    formula: "HNaO",
    molecularWeight: 39.997,
    category: "Reagent",
    pubchemCid: "14798"
  },
  {
    id: "koh",
    name: "Potassium Hydroxide",
    synonyms: ["caustic potash", "koh", "alc. koh"],
    smiles: "[K+].[OH-]",
    formula: "HKO",
    molecularWeight: 56.106,
    category: "Reagent",
    pubchemCid: "4873"
  },
  {
    id: "hcl",
    name: "Hydrochloric Acid",
    synonyms: ["hydrogen chloride", "hcl", "muriatic acid"],
    smiles: "Cl",
    formula: "HCl",
    molecularWeight: 36.458,
    category: "Reagent",
    pubchemCid: "313"
  },
  {
    id: "hbr",
    name: "Hydrobromic Acid",
    synonyms: ["hydrogen bromide", "hbr"],
    smiles: "Br",
    formula: "HBr",
    molecularWeight: 80.912,
    category: "Reagent",
    pubchemCid: "260"
  },
  {
    id: "hi",
    name: "Hydroiodic Acid",
    synonyms: ["hydrogen iodide", "hi"],
    smiles: "I",
    formula: "HI",
    molecularWeight: 127.912,
    category: "Reagent",
    pubchemCid: "24841"
  },
  {
    id: "h2so4",
    name: "Sulfuric Acid",
    synonyms: ["sulphuric acid", "oil of vitriol", "h2so4", "conc. h2so4"],
    smiles: "OS(=O)(=O)O",
    formula: "H2O4S",
    molecularWeight: 98.072,
    category: "Reagent",
    pubchemCid: "1118"
  },
  {
    id: "hno3",
    name: "Nitric Acid",
    synonyms: ["aqua fortis", "hno3", "conc. hno3"],
    smiles: "O[N+](=O)[O-]",
    formula: "HNO3",
    molecularWeight: 63.013,
    category: "Reagent",
    pubchemCid: "944"
  },
  {
    id: "kmno4",
    name: "Potassium Permanganate",
    synonyms: ["baeyer's reagent", "kmno4"],
    smiles: "[K+].[O-][Mn](=O)(=O)=O",
    formula: "KMnO4",
    molecularWeight: 158.034,
    category: "Reagent",
    pubchemCid: "516875"
  },
  {
    id: "pcc",
    name: "Pyridinium Chlorochromate (PCC)",
    synonyms: ["corey's reagent", "pcc"],
    smiles: "c1cc[nH+]cc1.[O-][Cr](=O)(=O)Cl",
    formula: "C5H6ClCrNO3",
    molecularWeight: 215.55,
    category: "Reagent",
    pubchemCid: "80153"
  },
  {
    id: "pcl5",
    name: "Phosphorus Pentachloride",
    synonyms: ["pcl5"],
    smiles: "P(Cl)(Cl)(Cl)(Cl)Cl",
    formula: "Cl5P",
    molecularWeight: 208.22,
    category: "Reagent",
    pubchemCid: "24819"
  },
  {
    id: "pcl3",
    name: "Phosphorus Trichloride",
    synonyms: ["pcl3"],
    smiles: "P(Cl)(Cl)Cl",
    formula: "Cl3P",
    molecularWeight: 137.32,
    category: "Reagent",
    pubchemCid: "24387"
  },
  {
    id: "socl2",
    name: "Thionyl Chloride",
    synonyms: ["socl2", "darzens reagent"],
    smiles: "O=S(Cl)Cl",
    formula: "Cl2OS",
    molecularWeight: 118.96,
    category: "Reagent",
    pubchemCid: "24439"
  },
  {
    id: "br2",
    name: "Bromine",
    synonyms: ["br2", "liquid bromine", "bromine water"],
    smiles: "BrBr",
    formula: "Br2",
    molecularWeight: 159.808,
    category: "Reagent",
    pubchemCid: "24408"
  },
  {
    id: "cl2",
    name: "Chlorine",
    synonyms: ["cl2", "chlorine gas"],
    smiles: "ClCl",
    formula: "Cl2",
    molecularWeight: 70.906,
    category: "Reagent",
    pubchemCid: "24526"
  },
  {
    id: "febr3",
    name: "Iron(III) Bromide",
    synonyms: ["ferric bromide", "febr3"],
    smiles: "Fe(Br)(Br)Br",
    formula: "Br3Fe",
    molecularWeight: 295.55,
    category: "Reagent",
    pubchemCid: "25554"
  },
  {
    id: "alcl3",
    name: "Aluminium Chloride",
    synonyms: ["aluminum trichloride", "alcl3", "anhydrous alcl3"],
    smiles: "Al(Cl)(Cl)Cl",
    formula: "AlCl3",
    molecularWeight: 133.33,
    category: "Reagent",
    pubchemCid: "24012"
  },
  {
    id: "bf3",
    name: "Boron Trifluoride",
    synonyms: ["bf3"],
    smiles: "FB(F)F",
    formula: "BF3",
    molecularWeight: 67.81,
    category: "Reagent",
    pubchemCid: "6356"
  },
  {
    id: "nh3",
    name: "Ammonia",
    synonyms: ["nh3", "azane"],
    smiles: "N",
    formula: "H3N",
    molecularWeight: 17.031,
    category: "Reagent",
    pubchemCid: "222"
  },
  {
    id: "nabh4",
    name: "Sodium Borohydride",
    synonyms: ["nabh4", "sodium tetrahydridoborate"],
    smiles: "[Na+].[BH4-]",
    formula: "H4BNa",
    molecularWeight: 37.83,
    category: "Reagent",
    pubchemCid: "22959485"
  },
  {
    id: "lialh4",
    name: "Lithium Aluminium Hydride",
    synonyms: ["lah", "lialh4", "lithium tetrahydridoaluminate"],
    smiles: "[Li+].[AlH4-]",
    formula: "H4AlLi",
    molecularWeight: 37.95,
    category: "Reagent",
    pubchemCid: "28112"
  },
  {
    id: "ch3mgbr",
    name: "Methylmagnesium Bromide",
    synonyms: ["methyl grignard", "ch3mgbr"],
    smiles: "C[Mg]Br",
    formula: "CH3BrMg",
    molecularWeight: 119.24,
    category: "Reagent",
    pubchemCid: "11985474"
  },
  {
    id: "c6h5mgbr",
    name: "Phenylmagnesium Bromide",
    synonyms: ["phenyl grignard", "c6h5mgbr"],
    smiles: "Br[Mg]c1ccccc1",
    formula: "C6H5BrMg",
    molecularWeight: 181.31,
    category: "Reagent",
    pubchemCid: "11985473"
  },

  // --- BIOMOLECULES & COMMON DRUGS ---
  {
    id: "aspirin",
    name: "Aspirin",
    synonyms: ["acetylsalicylic acid", "2-acetoxybenzoic acid"],
    smiles: "CC(=O)Oc1ccccc1C(=O)O",
    formula: "C9H8O4",
    molecularWeight: 180.158,
    category: "Biomolecule",
    iupacName: "2-acetyloxybenzoic acid",
    pubchemCid: "2244"
  },
  {
    id: "paracetamol",
    name: "Paracetamol",
    synonyms: ["acetaminophen", "4-acetamidophenol", "tylenol"],
    smiles: "CC(=O)Nc1ccc(O)cc1",
    formula: "C8H9NO2",
    molecularWeight: 151.165,
    category: "Biomolecule",
    iupacName: "N-(4-hydroxyphenyl)acetamide",
    pubchemCid: "1983"
  },
  {
    id: "glycine",
    name: "Glycine",
    synonyms: ["2-aminoacetic acid", "gly"],
    smiles: "NCC(=O)O",
    formula: "C2H5NO2",
    molecularWeight: 75.067,
    category: "Biomolecule",
    iupacName: "2-aminoacetic acid",
    pubchemCid: "750"
  },
  {
    id: "alanine",
    name: "Alanine",
    synonyms: ["2-aminopropanoic acid", "ala"],
    smiles: "CC(N)C(=O)O",
    formula: "C3H7NO2",
    molecularWeight: 89.094,
    category: "Biomolecule",
    iupacName: "2-aminopropanoic acid",
    pubchemCid: "5950"
  }
];
