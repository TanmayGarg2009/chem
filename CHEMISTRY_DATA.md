# Chemistry Data Sources & Presets (`CHEMISTRY_DATA.md`)

This document describes the chemical data architecture, built-in JEE preset libraries, and PubChem integration.

---

## 1. Curated Class 11/12 JEE Presets

The server contains over 200+ built-in presets indexed by common names, IUPAC names, molecular formulas, and canonical SMILES across 9 key organic chemistry categories:

1. **Hydrocarbons**: Methane, ethane, propane, butane, isobutane, ethene, propene, but-1-ene, but-2-ene, ethyne, propyne, benzene, toluene, o/m/p-xylene, ethylbenzene, styrene, cumene, naphthalene, anthracene.
2. **Alcohols & Phenols**: Methanol, ethanol, 1-propanol, isopropanol, 1-butanol, 2-butanol, isobutanol, tert-butanol, ethylene glycol, glycerol, phenol, o/m/p-cresol, catechol, resorcinol, hydroquinone, picric acid.
3. **Aldehydes & Ketones**: Formaldehyde, acetaldehyde, propionaldehyde, benzaldehyde, cinnamaldehyde, salicylaldehyde, acetone, butanone, acetophenone, benzophenone, cyclohexanone.
4. **Carboxylic Acids & Derivatives**: Formic acid, acetic acid, propionic acid, benzoic acid, salicylic acid, oxalic acid, phthalic acid, acetyl chloride, acetic anhydride, ethyl acetate, acetamide.
5. **Amines & Nitro**: Methylamine, ethylamine, dimethylamine, trimethylamine, aniline, nitrobenzene, acetanilide.
6. **Haloalkanes & Haloarenes**: Chloromethane, chloroethane, bromoethane, iodoethane, chlorobenzene, bromobenzene, iodobenzene, dichloromethane, chloroform, carbon tetrachloride.
7. **Reagents & Inorganic Partners**: $\text{NaOH}$, $\text{KOH}$, $\text{HCl}$, $\text{HBr}$, $\text{HI}$, $\text{H}_2\text{SO}_4$, $\text{HNO}_3$, $\text{KMnO}_4$, $\text{PCC}$, $\text{PCl}_5$, $\text{PCl}_3$, $\text{SOCl}_2$, $\text{Br}_2$, $\text{Cl}_2$, $\text{FeBr}_3$, $\text{AlCl}_3$, $\text{BF}_3$, $\text{NH}_3$, $\text{NaBH}_4$, $\text{LiAlH}_4$, $\text{CH}_3\text{MgBr}$, $\text{C}_6\text{H}_5\text{MgBr}$.
8. **Biomolecules & Drugs**: Aspirin, Paracetamol, Glycine, Alanine.

---

## 2. PubChem PUG REST API Fallback

For any molecule not in the local preset catalog:
- Requests are dispatched to `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{name}/property/CanonicalSMILES,IsomericSMILES,MolecularFormula,MolecularWeight,InChI,InChIKey,IUPACName/JSON`.
- Respects NCBI rate limits (max 5 requests per second).
- Resolved structures are immediately cached in SQLite to ensure subsequent requests respond in `<10ms`.

---

## 3. Disambiguation Rules

If a user or AI queries a generic family without specifying positional isomerism:
- `cresol` $\rightarrow$ Disambiguates to *o-Cresol*, *m-Cresol*, or *p-Cresol*.
- `butanol` $\rightarrow$ Disambiguates to *1-Butanol*, *2-Butanol*, *Isobutanol*, or *tert-Butanol*.
- `xylene` $\rightarrow$ Disambiguates to *o-Xylene*, *m-Xylene*, or *p-Xylene*.
- `toluidine` $\rightarrow$ Disambiguates to *o-Toluidine*, *m-Toluidine*, or *p-Toluidine*.
