"""
Stereochemistry Renderer.
Renders wedge/dash bonds, chiral centers, and CIP R/S and E/Z configuration annotations.
"""

import base64
import io
from typing import Dict, Any, Optional, List, Tuple
from rdkit import Chem
from rdkit.Chem import AllChem, rdMolDescriptors, Descriptors
from rdkit.Chem.Draw import rdMolDraw2D
from PIL import Image, ImageDraw, ImageFont

from renderer import parse_structure, render_mol_cairo, add_text_banner_to_image


STEREO_PRESETS: Dict[str, Dict[str, Any]] = {
    # 2-butanol
    ("2-butanol", "r"): "C[C@@H](O)CC",
    ("2-butanol", "s"): "C[C@H](O)CC",
    ("2-butanol", "2r"): "C[C@@H](O)CC",
    ("2-butanol", "2s"): "C[C@H](O)CC",
    ("butan-2-ol", "r"): "C[C@@H](O)CC",
    ("butan-2-ol", "s"): "C[C@H](O)CC",
    
    # Lactic acid
    ("lactic acid", "r"): "C[C@@H](O)C(=O)O",
    ("lactic acid", "s"): "C[C@H](O)C(=O)O",
    ("2-hydroxypropanoic acid", "r"): "C[C@@H](O)C(=O)O",
    ("2-hydroxypropanoic acid", "s"): "C[C@H](O)C(=O)O",
    
    # Alanine
    ("alanine", "l"): "N[C@@H](C)C(=O)O",
    ("alanine", "d"): "N[C@H](C)C(=O)O",
    ("alanine", "s"): "N[C@@H](C)C(=O)O",
    ("alanine", "r"): "N[C@H](C)C(=O)O",
    
    # Tartaric acid
    ("tartaric acid", "r,r"): "O=C(O)[C@@H](O)[C@@H](O)C(=O)O",
    ("tartaric acid", "s,s"): "O=C(O)[C@H](O)[C@H](O)C(=O)O",
    ("tartaric acid", "meso"): "O=C(O)[C@@H](O)[C@H](O)C(=O)O",
    
    # Geometric isomers
    ("but-2-ene", "e"): "C/C=C/C",
    ("but-2-ene", "trans"): "C/C=C/C",
    ("but-2-ene", "z"): r"C/C=C\C",
    ("but-2-ene", "cis"): r"C/C=C\C",
    
    ("1,2-dichloroethene", "e"): "Cl/C=C/Cl",
    ("1,2-dichloroethene", "trans"): "Cl/C=C/Cl",
    ("1,2-dichloroethene", "z"): r"Cl/C=C\Cl",
    ("1,2-dichloroethene", "cis"): r"Cl/C=C\Cl",
    
    ("maleic acid", "cis"): r"O=C(O)/C=C\C(=O)O",
    ("maleic acid", "z"): r"O=C(O)/C=C\C(=O)O",
    ("fumaric acid", "trans"): "O=C(O)/C=C/C(=O)O",
    ("fumaric acid", "e"): "O=C(O)/C=C/C(=O)O",
}


def render_stereochemistry_view(
    compound: str,
    configuration: Optional[str] = None,
    width: int = 500,
    height: int = 380
) -> Dict[str, Any]:
    """
    Renders a molecule with explicit stereochemical wedges/dashes,
    annotates chiral centers (R/S) and double bonds (E/Z).
    """
    # Check preset table first if specific configuration was requested
    smiles = None
    if configuration:
        preset_key = (compound.lower().strip(), configuration.lower().strip())
        if preset_key in STEREO_PRESETS:
            smiles = STEREO_PRESETS[preset_key]
            
    if smiles is None:
        smiles = compound
        
    mol = parse_structure(smiles)
    if mol is None:
        return {
            "success": False,
            "error": f"Could not parse structure for stereochemistry depiction: '{compound}'"
        }
        
    # Assign stereochemistry
    Chem.AssignStereochemistry(mol, cleanIt=True, force=True)
    chiral_centers = Chem.FindMolChiralCenters(mol, includeUnassigned=True)
    
    # Calculate 2D coordinates with wedge/dash preservation
    AllChem.Compute2DCoords(mol)
    
    # Highlight chiral centers if present
    highlight_atoms = [center[0] for center in chiral_centers]
    
    # Atom labels for chiral centers
    atom_labels = {}
    chiral_descriptions = []
    for idx, conf in chiral_centers:
        atom_labels[idx] = f"C* ({conf})"
        chiral_descriptions.append(f"C{idx+1}: {conf}")
        
    drawer = rdMolDraw2D.MolDraw2DCairo(width, height)
    opts = drawer.drawOptions()
    opts.clearBackground = True
    opts.setBackgroundColour((1.0, 1.0, 1.0, 1.0))
    opts.bondLineWidth = 2.4
    opts.additionalAtomLabelPadding = 0.2
    opts.minFontSize = 13
    opts.maxFontSize = 24
    
    # Draw
    drawer.DrawMolecule(
        mol,
        highlightAtoms=highlight_atoms,
        highlightBonds=[]
    )
    drawer.FinishDrawing()
    png_raw = drawer.GetDrawingText()
    
    title = f"Stereochemistry: {compound}" + (f" ({configuration.upper()})" if configuration else "")
    formula = rdMolDescriptors.CalcMolFormula(mol)
    chiral_info = ", ".join(chiral_descriptions) if chiral_descriptions else "No chiral centers detected"
    subtitle = f"Formula: {formula} | Stereocenters: {chiral_info}"
    
    final_png = add_text_banner_to_image(
        png_raw,
        title=title,
        subtitle=subtitle,
        footer="Wedges represent bonds coming out of page; Dashes represent bonds going into page."
    )
    b64_data = base64.b64encode(final_png).decode("utf-8")
    
    return {
        "success": True,
        "format": "png",
        "mime_type": "image/png",
        "base64": b64_data,
        "width": width,
        "height": height,
        "isomeric_smiles": Chem.MolToSmiles(mol, isomericSmiles=True),
        "chiral_centers": chiral_centers,
        "stereocenters_count": len(chiral_centers)
    }
