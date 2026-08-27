"""
Resonance Structure Renderer.
Generates publication-quality resonance contributor diagrams with canonical forms,
double-headed resonance arrows (<-->), and formal charge localization.
"""

import base64
import io
from typing import List, Dict, Any, Optional
from rdkit import Chem
from PIL import Image, ImageDraw, ImageFont

from renderer import parse_structure, render_mol_cairo


RESONANCE_PRESETS: Dict[str, Dict[str, Any]] = {
    "phenoxide": {
        "title": "Resonance Structures of Phenoxide Ion (C6H5O⁻)",
        "explanation": "Negative charge on oxygen delocalizes into the ortho and para positions of the benzene ring.",
        "structures": [
            {"smiles": "[O-]c1ccccc1", "label": "Structure I (O⁻)"},
            {"smiles": "O=C1[CH-]CCCC1", "label": "Structure II (ortho⁻)"},
            {"smiles": "O=C1CC[CH-]CC1", "label": "Structure III (para⁻)"},
            {"smiles": "O=C1CCCC[CH-]1", "label": "Structure IV (ortho'⁻)"},
        ]
    },
    "phenoxide ion": {
        "title": "Resonance Structures of Phenoxide Ion (C6H5O⁻)",
        "explanation": "Negative charge on oxygen delocalizes into the ortho and para positions of the benzene ring.",
        "structures": [
            {"smiles": "[O-]c1ccccc1", "label": "Structure I (O⁻)"},
            {"smiles": "O=C1[CH-]CCCC1", "label": "Structure II (ortho⁻)"},
            {"smiles": "O=C1CC[CH-]CC1", "label": "Structure III (para⁻)"},
            {"smiles": "O=C1CCCC[CH-]1", "label": "Structure IV (ortho'⁻)"},
        ]
    },
    "nitrobenzene": {
        "title": "Resonance Structures of Nitrobenzene (C6H5NO2)",
        "explanation": "-M / -R group withdraws electron density, generating partial positive charges at ortho and para positions.",
        "structures": [
            {"smiles": "[O-][N+](=O)c1ccccc1", "label": "Neutral Form"},
            {"smiles": "O=[N+]([O-])=C1[CH+]CCCC1", "label": "ortho (+)"},
            {"smiles": "O=[N+]([O-])=C1CC[CH+]CC1", "label": "para (+)"},
            {"smiles": "O=[N+]([O-])=C1CCCC[CH+]1", "label": "ortho' (+)"},
        ]
    },
    "aniline": {
        "title": "Resonance Structures of Aniline (C6H5NH2)",
        "explanation": "Nitrogen lone pair delocalizes (+R effect) into the benzene ring, activating ortho and para positions.",
        "structures": [
            {"smiles": "Nc1ccccc1", "label": "Structure I"},
            {"smiles": "[NH2+]=C1[CH-]CCCC1", "label": "ortho (-)"},
            {"smiles": "[NH2+]=C1CC[CH-]CC1", "label": "para (-)"},
            {"smiles": "[NH2+]=C1CCCC[CH-]1", "label": "ortho' (-)"},
        ]
    },
    "carboxylate": {
        "title": "Resonance in Acetate / Carboxylate Ion (CH3COO⁻)",
        "explanation": "Equal energy resonance structures account for equivalent C-O bond lengths and high stability.",
        "structures": [
            {"smiles": "CC(=O)[O-]", "label": "Structure A"},
            {"smiles": "CC([O-])=O", "label": "Structure B"},
        ]
    },
    "acetate ion": {
        "title": "Resonance in Acetate Ion (CH3COO⁻)",
        "explanation": "Equal energy resonance structures account for equivalent C-O bond lengths and high stability.",
        "structures": [
            {"smiles": "CC(=O)[O-]", "label": "Structure A"},
            {"smiles": "CC([O-])=O", "label": "Structure B"},
        ]
    },
    "benzene": {
        "title": "Kekulé Resonance Structures of Benzene (C6H6)",
        "explanation": "Delocalized 6 pi-electrons create uniform C-C bond lengths (1.39 Å) and aromatic stability.",
        "structures": [
            {"smiles": "C1=CC=CC=C1", "label": "Kekulé Form I"},
            {"smiles": "C1=C-C=C-C=C1", "label": "Kekulé Form II"},
        ]
    },
    "allyl cation": {
        "title": "Allyl Cation Resonance (CH2=CH-CH2⁺)",
        "explanation": "Positive charge is shared equally between the two terminal carbons.",
        "structures": [
            {"smiles": "C=C[CH2+]", "label": "Structure I"},
            {"smiles": "[CH2+]C=C", "label": "Structure II"},
        ]
    },
    "carbonate ion": {
        "title": "Carbonate Ion Resonance (CO3²⁻)",
        "explanation": "Three equivalent resonance contributors with 4/3 bond order for each C-O bond.",
        "structures": [
            {"smiles": "C(=O)([O-])[O-]", "label": "Form I"},
            {"smiles": "C([O-])(=O)[O-]", "label": "Form II"},
            {"smiles": "C([O-])([O-])=O", "label": "Form III"},
        ]
    }
}


def draw_resonance_arrow(width: int = 80, height: int = 200) -> Image.Image:
    """Draw a double-headed resonance arrow (<--->)."""
    img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    mid_y = height // 2
    x_start = 12
    x_end = width - 12
    
    # Line
    draw.line([(x_start, mid_y), (x_end, mid_y)], fill=(40, 40, 40, 255), width=2)
    
    # Left arrowhead
    head = 8
    draw.polygon([
        (x_start, mid_y),
        (x_start + head, mid_y - 4),
        (x_start + head - 2, mid_y),
        (x_start + head, mid_y + 4)
    ], fill=(40, 40, 40, 255))
    
    # Right arrowhead
    draw.polygon([
        (x_end, mid_y),
        (x_end - head, mid_y - 4),
        (x_end - head + 2, mid_y),
        (x_end - head, mid_y + 4)
    ], fill=(40, 40, 40, 255))
    
    return img


def render_resonance_diagram(
    compound_query: Optional[str] = None,
    structures: Optional[List[Dict[str, str]]] = None,
    title: Optional[str] = None,
    tile_width: int = 220,
    tile_height: int = 180
) -> Dict[str, Any]:
    """
    Renders resonance canonical structures separated by <--> double-headed arrows
    enclosed in resonance brackets.
    """
    explanation = None
    diag_title = title
    
    # Check preset
    if compound_query:
        norm_key = compound_query.lower().strip()
        if norm_key in RESONANCE_PRESETS:
            preset = RESONANCE_PRESETS[norm_key]
            structures = preset["structures"]
            diag_title = diag_title or preset["title"]
            explanation = preset.get("explanation")
            
    if not structures or len(structures) < 2:
        return {
            "success": False,
            "error": f"Resonance rendering requires at least 2 canonical structures. Preset '{compound_query}' was not found, and custom structures were insufficient."
        }
        
    mol_tiles: List[Image.Image] = []
    for s in structures:
        smiles = s.get("smiles", "")
        label = s.get("label", "")
        mol = parse_structure(smiles)
        if mol is None:
            return {"success": False, "error": f"Invalid resonance structure SMILES: '{smiles}'"}
            
        png_bytes = render_mol_cairo(mol, width=tile_width, height=tile_height)
        tile_img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
        
        # Add label under tile
        labeled = Image.new("RGBA", (tile_width, tile_height + 28), (255, 255, 255, 255))
        labeled.paste(tile_img, (0, 0), tile_img)
        draw = ImageDraw.Draw(labeled)
        try:
            font = ImageFont.load_default()
        except Exception:
            font = None
        draw.text((tile_width // 2, tile_height + 4), label, fill=(70, 70, 70, 255), anchor="mt", font=font)
        mol_tiles.append(labeled)

    arrow_img = draw_resonance_arrow(width=70, height=tile_height + 28)
    
    # Sequence elements
    elements: List[Image.Image] = []
    for idx, t in enumerate(mol_tiles):
        if idx > 0:
            elements.append(arrow_img)
        elements.append(t)
        
    total_inner_w = sum(e.width for e in elements)
    max_inner_h = max(e.height for e in elements)
    
    # Add space for brackets and padding
    bracket_w = 20
    padding_x = 30
    total_w = total_inner_w + (bracket_w * 2) + (padding_x * 2)
    
    header_h = 50 if (diag_title or explanation) else 20
    total_h = max_inner_h + header_h + 30
    
    canvas = Image.new("RGBA", (total_w, total_h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    try:
        font_main = ImageFont.load_default()
        font_sub = ImageFont.load_default()
    except Exception:
        font_main = None
        font_sub = None
        
    # Draw Title & Explanation
    if diag_title:
        draw.text((total_w // 2, 12), diag_title, fill=(20, 20, 20, 255), anchor="mt", font=font_main)
    if explanation:
        draw.text((total_w // 2, 30), explanation, fill=(100, 100, 100, 255), anchor="mt", font=font_sub)
        
    # Draw large brackets [ ... ]
    bracket_top = header_h + 5
    bracket_bottom = header_h + max_inner_h - 5
    b_color = (120, 120, 120, 255)
    b_thick = 2
    
    # Left bracket [
    left_x = padding_x
    draw.line([(left_x + 10, bracket_top), (left_x, bracket_top)], fill=b_color, width=b_thick)
    draw.line([(left_x, bracket_top), (left_x, bracket_bottom)], fill=b_color, width=b_thick)
    draw.line([(left_x, bracket_bottom), (left_x + 10, bracket_bottom)], fill=b_color, width=b_thick)
    
    # Right bracket ]
    right_x = total_w - padding_x
    draw.line([(right_x - 10, bracket_top), (right_x, bracket_top)], fill=b_color, width=b_thick)
    draw.line([(right_x, bracket_top), (right_x, bracket_bottom)], fill=b_color, width=b_thick)
    draw.line([(right_x, bracket_bottom), (right_x - 10, bracket_bottom)], fill=b_color, width=b_thick)
    
    # Paste elements inside brackets
    cur_x = left_x + bracket_w
    for e in elements:
        y_pos = header_h + (max_inner_h - e.height) // 2
        canvas.paste(e, (cur_x, y_pos), e)
        cur_x += e.width
        
    out = io.BytesIO()
    canvas.save(out, format="PNG", optimize=True)
    b64_data = base64.b64encode(out.getvalue()).decode("utf-8")
    
    return {
        "success": True,
        "format": "png",
        "mime_type": "image/png",
        "base64": b64_data,
        "width": total_w,
        "height": total_h,
        "title": diag_title,
        "explanation": explanation
    }
