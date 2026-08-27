"""
Organic Chemistry Structure Renderer using RDKit.
Generates publication-quality 2D chemical structure depictions.
"""

import base64
import io
from typing import Optional, Dict, Any, List, Tuple
from rdkit import Chem
from rdkit.Chem import Draw, rdMolDescriptors, AllChem, Descriptors
from rdkit.Chem.Draw import rdMolDraw2D
from PIL import Image, ImageDraw, ImageFont


def parse_structure(input_str: str) -> Optional[Chem.Mol]:
    """Parse a chemical structure from SMILES or InChI."""
    if not input_str or not input_str.strip():
        return None
    
    input_str = input_str.strip()
    
    # Try SMILES first
    mol = Chem.MolFromSmiles(input_str)
    if mol is not None:
        return mol
    
    # Try InChI
    if input_str.startswith("InChI="):
        mol = Chem.MolFromInchi(input_str)
        if mol is not None:
            return mol
            
    # Try CXSMILES or smarts
    try:
        mol = Chem.MolFromSmarts(input_str)
        if mol is not None:
            return mol
    except Exception:
        pass
        
    return None


def calculate_properties(mol: Chem.Mol) -> Dict[str, Any]:
    """Calculate standard chemical properties for a molecule."""
    try:
        canonical_smiles = Chem.MolToSmiles(mol, canonical=True)
        isomeric_smiles = Chem.MolToSmiles(mol, isomericSmiles=True)
        formula = rdMolDescriptors.CalcMolFormula(mol)
        mw = round(Descriptors.MolWt(mol), 3)
        inchi = Chem.MolToInchi(mol)
        inchikey = Chem.MolToInchiKey(mol)
        h_bond_donors = rdMolDescriptors.CalcNumHBD(mol)
        h_bond_acceptors = rdMolDescriptors.CalcNumHBA(mol)
        rotatable_bonds = rdMolDescriptors.CalcNumRotatableBonds(mol)
        tpsa = round(rdMolDescriptors.CalcTPSA(mol), 2)
        formal_charge = Chem.GetFormalCharge(mol)
        
        # Check stereocenters
        chiral_centers = Chem.FindMolChiralCenters(mol, includeUnassigned=True)
        
        return {
            "canonical_smiles": canonical_smiles,
            "isomeric_smiles": isomeric_smiles,
            "formula": formula,
            "molecular_weight": mw,
            "inchi": inchi,
            "inchikey": inchikey,
            "h_bond_donors": h_bond_donors,
            "h_bond_acceptors": h_bond_acceptors,
            "rotatable_bonds": rotatable_bonds,
            "tpsa": tpsa,
            "formal_charge": formal_charge,
            "chiral_centers": chiral_centers,
        }
    except Exception as e:
        return {"error": str(e)}


def render_mol_cairo(
    mol: Chem.Mol,
    width: int = 500,
    height: int = 350,
    highlight_atoms: Optional[List[int]] = None,
    highlight_bonds: Optional[List[int]] = None,
    atom_labels: Optional[Dict[int, str]] = None,
    kekulize: bool = True
) -> bytes:
    """Render a molecule to PNG bytes using RDKit's MolDraw2DCairo."""
    mol_copy = Chem.Mol(mol)
    if kekulize:
        try:
            Chem.Kekulize(mol_copy, clearAromaticFlags=True)
        except Exception:
            pass

    if not mol_copy.GetNumConformers():
        AllChem.Compute2DCoords(mol_copy)
        
    drawer = rdMolDraw2D.MolDraw2DCairo(width, height)
    opts = drawer.drawOptions()
    opts.clearBackground = True
    opts.setBackgroundColour((1.0, 1.0, 1.0, 1.0))
    opts.bondLineWidth = 2.0
    opts.additionalAtomLabelPadding = 0.15
    opts.minFontSize = 12
    opts.maxFontSize = 24
    opts.comicMode = False
    
    if atom_labels:
        for idx, label in atom_labels.items():
            opts.atomLabels[idx] = label

    if highlight_atoms or highlight_bonds:
        drawer.DrawMolecule(
            mol_copy,
            highlightAtoms=highlight_atoms or [],
            highlightBonds=highlight_bonds or []
        )
    else:
        drawer.DrawMolecule(mol_copy)
        
    drawer.FinishDrawing()
    return drawer.GetDrawingText()


def render_mol_svg(
    mol: Chem.Mol,
    width: int = 500,
    height: int = 350,
    highlight_atoms: Optional[List[int]] = None,
    highlight_bonds: Optional[List[int]] = None,
    kekulize: bool = True
) -> str:
    """Render a molecule to SVG string using RDKit."""
    mol_copy = Chem.Mol(mol)
    if kekulize:
        try:
            Chem.Kekulize(mol_copy, clearAromaticFlags=True)
        except Exception:
            pass

    if not mol_copy.GetNumConformers():
        AllChem.Compute2DCoords(mol_copy)
        
    drawer = rdMolDraw2D.MolDraw2DSVG(width, height)
    opts = drawer.drawOptions()
    opts.bondLineWidth = 2.0
    opts.additionalAtomLabelPadding = 0.15
    opts.minFontSize = 12
    opts.maxFontSize = 24
    
    if highlight_atoms or highlight_bonds:
        drawer.DrawMolecule(
            mol_copy,
            highlightAtoms=highlight_atoms or [],
            highlightBonds=highlight_bonds or []
        )
    else:
        drawer.DrawMolecule(mol_copy)
        
    drawer.FinishDrawing()
    return drawer.GetDrawingText()


def add_text_banner_to_image(
    png_bytes: bytes,
    title: Optional[str] = None,
    subtitle: Optional[str] = None,
    footer: Optional[str] = None,
    padding: int = 24
) -> bytes:
    """Annotate the rendered structure image with crisp chemical labels and formula."""
    img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    
    top_banner_height = 0
    bottom_banner_height = 0
    
    if title or subtitle:
        top_banner_height = 36 if (title and not subtitle) else 52
    if footer:
        bottom_banner_height = 28
        
    if top_banner_height == 0 and bottom_banner_height == 0:
        return png_bytes

    new_width = max(img.width, 360) + padding * 2
    new_height = img.height + top_banner_height + bottom_banner_height + padding
    
    new_img = Image.new("RGBA", (new_width, new_height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(new_img)
    
    # Paste molecule centered
    x_offset = (new_width - img.width) // 2
    new_img.paste(img, (x_offset, top_banner_height + (padding // 2)), img)
    
    try:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
    except Exception:
        font_title = None
        font_sub = None
        
    y_cursor = 10
    if title:
        draw.text((new_width // 2, y_cursor), title, fill=(20, 20, 20, 255), anchor="mt", font=font_title)
        y_cursor += 20
        
    if subtitle:
        draw.text((new_width // 2, y_cursor), subtitle, fill=(90, 90, 90, 255), anchor="mt", font=font_sub)
        
    if footer:
        draw.text((new_width // 2, new_height - 14), footer, fill=(140, 140, 140, 255), anchor="mb", font=font_sub)
        
    out = io.BytesIO()
    new_img.save(out, format="PNG", optimize=True)
    return out.getvalue()


def render_structure(
    smiles_or_inchi: str,
    name: Optional[str] = None,
    width: int = 500,
    height: int = 350,
    show_name: bool = True,
    show_formula: bool = True,
    format: str = "png"
) -> Dict[str, Any]:
    """High-level rendering function for a single compound."""
    mol = parse_structure(smiles_or_inchi)
    if mol is None:
        return {
            "success": False,
            "error": f"Invalid chemical structure representation: {smiles_or_inchi}"
        }
        
    props = calculate_properties(mol)
    
    if format.lower() == "svg":
        svg_content = render_mol_svg(mol, width=width, height=height)
        return {
            "success": True,
            "format": "svg",
            "svg": svg_content,
            "properties": props
        }
    
    # Render PNG
    png_raw = render_mol_cairo(mol, width=width, height=height)
    
    title = name if show_name else None
    subtitle_parts = []
    if show_formula and "formula" in props:
        subtitle_parts.append(props["formula"])
    if "molecular_weight" in props:
        subtitle_parts.append(f"MW: {props['molecular_weight']}")
    subtitle = " | ".join(subtitle_parts) if subtitle_parts else None
    
    final_png = add_text_banner_to_image(png_raw, title=title, subtitle=subtitle)
    b64_data = base64.b64encode(final_png).decode("utf-8")
    
    return {
        "success": True,
        "format": "png",
        "mime_type": "image/png",
        "base64": b64_data,
        "width": width,
        "height": height,
        "properties": props
    }
