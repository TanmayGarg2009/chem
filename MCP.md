# MCP Protocol & Tools Specification (`MCP.md`)

This document specifies the Model Context Protocol tools exposed by the Organic Chemistry Structure MCP Server.

---

## 1. `show_structure`
Use this tool whenever a chemical compound, reagent, intermediate, functional group, or organic molecule needs to be visually represented in the conversation.

### Input Schema
```json
{
  "compound": "benzaldehyde",
  "format": "png",
  "width": 500,
  "height": 350,
  "show_name": true,
  "show_formula": true
}
```

### Result Schema
Returns an MCP Image Content Item (`type: "image", mimeType: "image/png", data: "<base64>"`) + text metadata.

---

## 2. `resolve_compound`
Use this tool when you need accurate chemical metadata (IUPAC name, formula, canonical SMILES, InChI, InChIKey, PubChem CID, molecular weight) for a compound without rendering an image.

### Input Schema
```json
{
  "query": "benzaldehyde"
}
```

### Result Schema
```json
{
  "status": "success",
  "compound": {
    "name": "Benzaldehyde",
    "iupac_name": "benzaldehyde",
    "formula": "C7H6O",
    "molecular_weight": 106.124,
    "canonical_smiles": "O=Cc1ccccc1",
    "isomeric_smiles": "O=Cc1ccccc1",
    "inchi": "InChI=1S/C7H6O/c8-6-7-4-2-1-3-5-7/h1-6H",
    "inchikey": "HUMVFWGFLDYGHG-UHFFFAOYSA-N",
    "pubchem_cid": "240",
    "source": "preset"
  }
}
```

---

## 3. `show_reaction`
Use this tool whenever explaining a chemical reaction, synthesis step, or transformation that would benefit from displaying reactants, products, reaction arrows, and conditions visually.

### Input Schema
```json
{
  "reactants": ["benzene", "Br2"],
  "products": ["bromobenzene", "HBr"],
  "conditions": "FeBr3",
  "title": "EAS Bromination of Benzene"
}
```

---

## 4. `show_mechanism`
Use this tool to display detailed multi-step organic reaction mechanisms with step-by-step intermediate panels, formal charges, and curved electron-movement arrows.

### Input Schema
```json
{
  "reaction": "SN1 hydrolysis of tert-butyl bromide",
  "steps": "auto"
}
```

---

## 5. `compare_structures`
Use this tool to display a side-by-side comparison diagram of multiple chemical structures (e.g. comparing functional groups, homologous series, constitutional isomers, acidities, or basicities).

### Input Schema
```json
{
  "compounds": ["ethanol", "ethanal", "ethanoic acid"],
  "title": "Oxidation Series of Ethanol"
}
```

---

## 6. `show_resonance`
Use this tool to display resonance structures, delocalized pi-systems, and canonical contributors with double-headed ($\leftrightarrow$) resonance arrows and formal charges.

### Input Schema
```json
{
  "compound": "phenoxide ion",
  "title": "Resonance in Phenoxide Ion"
}
```

---

## 7. `show_stereochemistry`
Use this tool to display 3D stereochemical structures with wedge-and-dash bonds, chiral centers, and R/S or E/Z stereochemical configurations.

### Input Schema
```json
{
  "compound": "2-butanol",
  "configuration": "R"
}
```
