"""
Chemical Reaction Renderer.
Assembles accurate 2D reaction diagrams with reactants, reaction arrows, conditions, and products.
"""

import base64
import io
from typing import List, Optional, Dict, Any, Tuple
from rdkit import Chem
from rdkit.Chem import AllChem, rdMolDescriptors
from rdkit.Chem.Draw import rdMolDraw2D
from PIL import Image, ImageDraw, ImageFont

from renderer import parse_structure, render_mol_cairo


def render_molecule_tile(
    mol: Chem.Mol,
    name: Optional[str] = None,
    width: int = 220,
    height: int = 180,
    show_name: bool = True
) -> Image.Image:
    """Render a single molecule tile for a reaction or comparison grid."""
    png_bytes = render_mol_cairo(mol, width=width, height=height)
    img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    
    if show_name and name:
        banner_h = 24
        tile = Image.new("RGBA", (width, height + banner_h), (255, 255, 255, 255))
        tile.paste(img, (0, 0), img)
        draw = ImageDraw.Draw(tile)
        try:
            font = ImageFont.load_default()
        except Exception:
            font = None
        draw.text((width // 2, height + 2), name, fill=(50, 50, 50, 255), anchor="mt", font=font)
        return tile
        
    return img


def draw_reaction_arrow(
    width: int = 160,
    height: int = 180,
    conditions_above: Optional[str] = None,
    conditions_below: Optional[str] = None
) -> Image.Image:
    """Draw a clean chemical reaction arrow with conditions above and below."""
    img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    mid_y = height // 2
    start_x = 15
    end_x = width - 15
    
    # Draw arrow shaft
    draw.line([(start_x, mid_y), (end_x, mid_y)], fill=(30, 30, 30, 255), width=3)
    
    # Draw arrowhead
    arrow_size = 12
    draw.polygon([
        (end_x, mid_y),
        (end_x - arrow_size, mid_y - (arrow_size // 2 + 1)),
        (end_x - (arrow_size // 2), mid_y),
        (end_x - arrow_size, mid_y + (arrow_size // 2 + 1))
    ], fill=(30, 30, 30, 255))
    
    try:
        font_cond = ImageFont.load_default()
    except Exception:
        font_cond = None
        
    # Text above arrow
    if conditions_above:
        draw.text(
            (width // 2, mid_y - 12),
            conditions_above,
            fill=(10, 80, 160, 255),
            anchor="mb",
            font=font_cond
        )
        
    # Text below arrow
    if conditions_below:
        draw.text(
            (width // 2, mid_y + 12),
            conditions_below,
            fill=(80, 80, 80, 255),
            anchor="mt",
            font=font_cond
        )
        
    return img


def draw_plus_sign(width: int = 50, height: int = 180) -> Image.Image:
    """Draw a centered plus sign '+' between reactants or products."""
    img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    mid_x = width // 2
    mid_y = height // 2
    size = 10
    
    draw.line([(mid_x - size, mid_y), (mid_x + size, mid_y)], fill=(80, 80, 80, 255), width=3)
    draw.line([(mid_x, mid_y - size), (mid_x, mid_y + size)], fill=(80, 80, 80, 255), width=3)
    
    return img


def render_reaction(
    reactants: List[Dict[str, Any]],
    products: List[Dict[str, Any]],
    conditions: Optional[str] = None,
    title: Optional[str] = None,
    tile_width: int = 220,
    tile_height: int = 180
) -> Dict[str, Any]:
    """
    Renders a complete chemical reaction into an aligned publication-style diagram.
    
    reactants: List of {"smiles": "...", "name": "..."}
    products: List of {"smiles": "...", "name": "..."}
    """
    reactant_imgs: List[Image.Image] = []
    product_imgs: List[Image.Image] = []
    
    # Render all reactants
    for r in reactants:
        smiles = r.get("smiles") or r.get("structure") or ""
        name = r.get("name", "")
        mol = parse_structure(smiles)
        if mol is None:
            return {"success": False, "error": f"Could not parse reactant structure: '{smiles}'"}
        reactant_imgs.append(render_molecule_tile(mol, name=name, width=tile_width, height=tile_height))
        
    # Render all products
    for p in products:
        smiles = p.get("smiles") or p.get("structure") or ""
        name = p.get("name", "")
        mol = parse_structure(smiles)
        if mol is None:
            return {"success": False, "error": f"Could not parse product structure: '{smiles}'"}
        product_imgs.append(render_molecule_tile(mol, name=name, width=tile_width, height=tile_height))
        
    if not reactant_imgs or not product_imgs:
        return {"success": False, "error": "Reaction requires at least one reactant and one product"}

    # Parse conditions into above / below if separated by comma or slash
    cond_above = conditions
    cond_below = None
    if conditions and ("\n" in conditions or " / " in conditions or " | " in conditions):
        delim = "\n" if "\n" in conditions else (" / " if " / " in conditions else " | ")
        parts = conditions.split(delim, 1)
        cond_above = parts[0].strip()
        cond_below = parts[1].strip()

    arrow_w = max(160, (len(cond_above or "") * 9) + 40)
    arrow_img = draw_reaction_arrow(
        width=arrow_w,
        height=tile_height + 24,
        conditions_above=cond_above,
        conditions_below=cond_below
    )
    
    plus_img = draw_plus_sign(width=40, height=tile_height + 24)
    
    # Calculate total width
    elements: List[Image.Image] = []
    for idx, r_img in enumerate(reactant_imgs):
        if idx > 0:
            elements.append(plus_img)
        elements.append(r_img)
        
    elements.append(arrow_img)
    
    for idx, p_img in enumerate(product_imgs):
        if idx > 0:
            elements.append(plus_img)
        elements.append(p_img)
        
    total_w = sum(e.width for e in elements) + 40
    max_h = max(e.height for e in elements)
    
    header_h = 40 if title else 20
    final_h = max_h + header_h + 30
    
    canvas = Image.new("RGBA", (total_w, final_h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Title
    if title:
        try:
            font_title = ImageFont.load_default()
        except Exception:
            font_title = None
        draw.text((total_w // 2, 12), title, fill=(20, 20, 20, 255), anchor="mt", font=font_title)
        
    # Assemble horizontally
    cur_x = 20
    for e in elements:
        y_pos = header_h + (max_h - e.height) // 2
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
        "height": final_h,
        "reaction_summary": f"{' + '.join([r.get('name') or r.get('smiles') for r in reactants])} --[{conditions or ''}]--> {' + '.join([p.get('name') or p.get('smiles') for p in products])}"
    }
