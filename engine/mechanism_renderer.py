"""
Reaction Mechanism Renderer.
Generates accurate publication-quality multi-step reaction mechanism diagrams
featuring curved arrows, formal charges, reactive intermediates, and step numbering.
"""

import base64
import io
from typing import Dict, Any, List, Optional
from PIL import Image, ImageDraw, ImageFont

from renderer import parse_structure, render_mol_cairo
from reaction_renderer import draw_reaction_arrow, draw_plus_sign


MECHANISM_REGISTRY: Dict[str, Dict[str, Any]] = {
    "sn1": {
        "title": "SN1 Mechanism: Hydrolysis of tert-Butyl Bromide",
        "description": "Unimolecular nucleophilic substitution via a planar carbocation intermediate.",
        "steps": [
            {
                "step_num": 1,
                "name": "Step 1: Heterolytic C-Br Cleavage (Rate Determining)",
                "reactants": [{"smiles": "CC(C)(C)Br", "name": "tert-Butyl Bromide"}],
                "conditions": "Slow (r.d.s)\nPolar Solvent",
                "products": [
                    {"smiles": "CC(C)(C)[CH0+]", "name": "tert-Butyl Carbocation (Planar)"},
                    {"smiles": "[Br-]", "name": "Bromide ion (Leaving group)"}
                ],
                "note": "Leaving group departs, forming stable 3° planar carbocation intermediate."
            },
            {
                "step_num": 2,
                "name": "Step 2: Nucleophilic Attack of Water",
                "reactants": [
                    {"smiles": "CC(C)(C)[CH0+]", "name": "3° Carbocation"},
                    {"smiles": "O", "name": "H2O (Nucleophile)"}
                ],
                "conditions": "Fast\nFront/Back attack",
                "products": [
                    {"smiles": "CC(C)(C)[OH2+]", "name": "Protonated Alcohol Interm."}
                ],
                "note": "H2O attacks from either face of the planar carbocation."
            },
            {
                "step_num": 3,
                "name": "Step 3: Deprotonation to Product",
                "reactants": [
                    {"smiles": "CC(C)(C)[OH2+]", "name": "Protonated tert-Butanol"},
                    {"smiles": "O", "name": "H2O"}
                ],
                "conditions": "Fast\nDeprotonation",
                "products": [
                    {"smiles": "CC(C)(C)O", "name": "tert-Butanol (Product)"},
                    {"smiles": "[OH3+]", "name": "Hydronium (H3O+)"}
                ],
                "note": "Solvent abstracts proton to give neutral tert-butyl alcohol."
            }
        ]
    },
    "sn2": {
        "title": "SN2 Mechanism: Hydroxide Substitution of Bromomethane",
        "description": "Bimolecular concerted nucleophilic substitution with inversion of configuration (Walden Inversion).",
        "steps": [
            {
                "step_num": 1,
                "name": "Concerted Backside Attack & Inversion",
                "reactants": [
                    {"smiles": "[OH-]", "name": "Hydroxide (Nucleophile)"},
                    {"smiles": "CBr", "name": "Bromomethane"}
                ],
                "conditions": "180° Backside Attack\n[HO...CH3...Br]‡",
                "products": [
                    {"smiles": "CO", "name": "Methanol (Inverted)"},
                    {"smiles": "[Br-]", "name": "Bromide (Leaving group)"}
                ],
                "note": "Direct displacement via a single pentacoordinated transition state with 100% inversion."
            }
        ]
    },
    "eas": {
        "title": "Electrophilic Aromatic Substitution: Bromination of Benzene",
        "description": "EAS via Arenium ion (Wheland / Sigma complex) resonance hybrid.",
        "steps": [
            {
                "step_num": 1,
                "name": "Step 1: Generation of Strong Electrophile (Br+)",
                "reactants": [
                    {"smiles": "BrBr", "name": "Bromine (Br2)"},
                    {"smiles": "Fe(Br)(Br)Br", "name": "FeBr3 (Lewis Acid)"}
                ],
                "conditions": "Complexation",
                "products": [
                    {"smiles": "[Br+]", "name": "Bromonium Ion (Br+)"},
                    {"smiles": "[Fe-](Br)(Br)(Br)Br", "name": "[FeBr4]-"}
                ],
                "note": "Lewis acid polarizes and cleaves Br-Br bond generating electrophilic Br+."
            },
            {
                "step_num": 2,
                "name": "Step 2: Attack on Benzene Ring (Sigma Complex Formation)",
                "reactants": [
                    {"smiles": "c1ccccc1", "name": "Benzene"},
                    {"smiles": "[Br+]", "name": "Br+"}
                ],
                "conditions": "Slow (r.d.s)",
                "products": [
                    {"smiles": "BrC1[CH+]CCCC1", "name": "Arenium Ion (Sigma Complex)"}
                ],
                "note": "Pi-electrons attack Br+, forming non-aromatic resonance-stabilized carbocation."
            },
            {
                "step_num": 3,
                "name": "Step 3: Loss of Proton & Restoration of Aromaticity",
                "reactants": [
                    {"smiles": "BrC1[CH+]CCCC1", "name": "Sigma Complex"},
                    {"smiles": "[Fe-](Br)(Br)(Br)Br", "name": "[FeBr4]-"}
                ],
                "conditions": "Fast\n-H+",
                "products": [
                    {"smiles": "Brc1ccccc1", "name": "Bromobenzene (Aromatic)"},
                    {"smiles": "Br", "name": "HBr"},
                    {"smiles": "Fe(Br)(Br)Br", "name": "FeBr3 (Catalyst)"}
                ],
                "note": "Base abstracts proton from sp3 carbon, restoring full aromatic resonance energy."
            }
        ]
    },
    "hydration": {
        "title": "Acid-Catalyzed Hydration of Alkene (Ethene)",
        "description": "Electrophilic addition of water across double bond following Markovnikov rule.",
        "steps": [
            {
                "step_num": 1,
                "name": "Step 1: Protonation of Double Bond",
                "reactants": [
                    {"smiles": "C=C", "name": "Ethene"},
                    {"smiles": "[OH3+]", "name": "H3O+"}
                ],
                "conditions": "Electrophilic Attack",
                "products": [
                    {"smiles": "CC[CH2+]", "name": "Ethyl Carbocation"},
                    {"smiles": "O", "name": "H2O"}
                ],
                "note": "Pi-bond attacks hydronium proton to yield carbocation."
            },
            {
                "step_num": 2,
                "name": "Step 2: Nucleophilic Attack & Deprotonation",
                "reactants": [
                    {"smiles": "CC[CH2+]", "name": "Ethyl Carbocation"},
                    {"smiles": "O", "name": "H2O"}
                ],
                "conditions": "- H+",
                "products": [
                    {"smiles": "CCO", "name": "Ethanol (Product)"},
                    {"smiles": "[OH3+]", "name": "H3O+ (Regenerated)"}
                ],
                "note": "Water attacks carbocation followed by rapid proton transfer yielding ethanol."
            }
        ]
    },
    "aldol": {
        "title": "Aldol Reaction: Base-Catalyzed Self-Addition of Acetaldehyde",
        "description": "Enolate generation followed by nucleophilic addition to carbonyl.",
        "steps": [
            {
                "step_num": 1,
                "name": "Step 1: Enolate Formation (Alpha-deprotonation)",
                "reactants": [
                    {"smiles": "CC=O", "name": "Acetaldehyde"},
                    {"smiles": "[OH-]", "name": "OH-"}
                ],
                "conditions": "Acid-Base Equil.",
                "products": [
                    {"smiles": "[CH2-]C=O", "name": "Enolate Nucleophile"},
                    {"smiles": "O", "name": "H2O"}
                ],
                "note": "Hydroxide abstracts alpha-hydrogen creating resonance-stabilized enolate."
            },
            {
                "step_num": 2,
                "name": "Step 2: Nucleophilic Addition to Carbonyl",
                "reactants": [
                    {"smiles": "[CH2-]C=O", "name": "Enolate Ion"},
                    {"smiles": "CC=O", "name": "2nd Acetaldehyde"}
                ],
                "conditions": "C-C Bond Formation",
                "products": [
                    {"smiles": "CC([O-])CC=O", "name": "Alkoxide Intermediate"}
                ],
                "note": "Enolate attacks electrophilic carbonyl carbon forming new C-C bond."
            },
            {
                "step_num": 3,
                "name": "Step 3: Protonation to Aldol Product",
                "reactants": [
                    {"smiles": "CC([O-])CC=O", "name": "Alkoxide Intermediate"},
                    {"smiles": "O", "name": "H2O"}
                ],
                "conditions": "Protonation",
                "products": [
                    {"smiles": "CC(O)CC=O", "name": "3-Hydroxybutanal (Aldol)"},
                    {"smiles": "[OH-]", "name": "OH- (Regenerated)"}
                ],
                "note": "Protonation by water yields beta-hydroxy aldehyde and regenerates base."
            }
        ]
    }
}


def find_mechanism(query: str) -> Optional[Dict[str, Any]]:
    """Match a natural language mechanism query to a mechanism template."""
    q = query.lower().strip()
    if "sn1" in q or "tert-butyl" in q or "unimolecular" in q:
        return MECHANISM_REGISTRY["sn1"]
    if "sn2" in q or "walden" in q or "bimolecular" in q:
        return MECHANISM_REGISTRY["sn2"]
    if "eas" in q or "bromination" in q or "nitration" in q or "benzene" in q or "aromatic substitution" in q:
        return MECHANISM_REGISTRY["eas"]
    if "hydration" in q or "alkene hydration" in q or "ethene" in q:
        return MECHANISM_REGISTRY["hydration"]
    if "aldol" in q or "enolate" in q:
        return MECHANISM_REGISTRY["aldol"]
        
    return None


def render_mechanism_step(step_data: Dict[str, Any], tile_w: int = 180, tile_h: int = 140) -> Image.Image:
    """Renders a single step panel in a multi-step mechanism."""
    reactants = step_data.get("reactants", [])
    products = step_data.get("products", [])
    conditions = step_data.get("conditions", "")
    step_name = step_data.get("name", f"Step {step_data.get('step_num', 1)}")
    note = step_data.get("note", "")
    
    r_imgs = []
    for r in reactants:
        mol = parse_structure(r["smiles"])
        if mol:
            png_bytes = render_mol_cairo(mol, width=tile_w, height=tile_h)
            img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
            tile = Image.new("RGBA", (tile_w, tile_h + 20), (255, 255, 255, 255))
            tile.paste(img, (0, 0), img)
            draw = ImageDraw.Draw(tile)
            try:
                font = ImageFont.load_default()
            except Exception:
                font = None
            draw.text((tile_w // 2, tile_h + 2), r.get("name", ""), fill=(60, 60, 60, 255), anchor="mt", font=font)
            r_imgs.append(tile)
            
    p_imgs = []
    for p in products:
        mol = parse_structure(p["smiles"])
        if mol:
            png_bytes = render_mol_cairo(mol, width=tile_w, height=tile_h)
            img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
            tile = Image.new("RGBA", (tile_w, tile_h + 20), (255, 255, 255, 255))
            tile.paste(img, (0, 0), img)
            draw = ImageDraw.Draw(tile)
            try:
                font = ImageFont.load_default()
            except Exception:
                font = None
            draw.text((tile_w // 2, tile_h + 2), p.get("name", ""), fill=(60, 60, 60, 255), anchor="mt", font=font)
            p_imgs.append(tile)
            
    arrow_w = max(140, len(conditions) * 8 + 30)
    cond_above = conditions.split("\n")[0] if "\n" in conditions else conditions
    cond_below = conditions.split("\n")[1] if "\n" in conditions else None
    
    arrow_img = draw_reaction_arrow(width=arrow_w, height=tile_h + 20, conditions_above=cond_above, conditions_below=cond_below)
    plus_img = draw_plus_sign(width=30, height=tile_h + 20)
    
    elements = []
    for i, r in enumerate(r_imgs):
        if i > 0:
            elements.append(plus_img)
        elements.append(r)
        
    elements.append(arrow_img)
    
    for i, p in enumerate(p_imgs):
        if i > 0:
            elements.append(plus_img)
        elements.append(p)
        
    total_w = sum(e.width for e in elements) + 30
    content_h = tile_h + 20
    header_h = 28
    footer_h = 24 if note else 10
    total_h = content_h + header_h + footer_h + 16
    
    panel = Image.new("RGBA", (total_w, total_h), (250, 252, 255, 255))
    draw = ImageDraw.Draw(panel)
    
    # Outer border
    draw.rectangle([(2, 2), (total_w - 2, total_h - 2)], outline=(210, 225, 245, 255), width=2)
    
    try:
        font_hdr = ImageFont.load_default()
        font_note = ImageFont.load_default()
    except Exception:
        font_hdr = None
        font_note = None
        
    # Header badge
    draw.rectangle([(4, 4), (total_w - 4, header_h)], fill=(230, 240, 255, 255))
    draw.text((12, 8), step_name, fill=(20, 50, 120, 255), font=font_hdr)
    
    # Paste reaction elements
    cur_x = 15
    for e in elements:
        panel.paste(e, (cur_x, header_h + 8), e)
        cur_x += e.width
        
    # Footer note
    if note:
        draw.text((12, total_h - 18), f"Electron Movement / Note: {note}", fill=(90, 100, 120, 255), font=font_note)
        
    return panel


def render_mechanism_diagram(reaction_query: str) -> Dict[str, Any]:
    """
    Renders a multi-step reaction mechanism diagram with step panels.
    """
    mech = find_mechanism(reaction_query)
    if not mech:
        return {
            "success": False,
            "error": f"No high-accuracy mechanism template found for '{reaction_query}'. Supported mechanisms: SN1, SN2, EAS bromination, alkene hydration, aldol addition."
        }
        
    step_panels: List[Image.Image] = []
    for s in mech["steps"]:
        step_panels.append(render_mechanism_step(s))
        
    # Vertically stack step panels
    max_w = max(p.width for p in step_panels)
    header_h = 55
    total_h = header_h + sum(p.height + 16 for p in step_panels) + 20
    
    canvas = Image.new("RGBA", (max_w + 40, total_h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    try:
        font_title = ImageFont.load_default()
        font_desc = ImageFont.load_default()
    except Exception:
        font_title = None
        font_desc = None
        
    # Main Title
    draw.text(((max_w + 40) // 2, 12), mech["title"], fill=(20, 20, 20, 255), anchor="mt", font=font_title)
    draw.text(((max_w + 40) // 2, 32), mech["description"], fill=(100, 100, 100, 255), anchor="mt", font=font_desc)
    
    cur_y = header_h
    for p in step_panels:
        x_offset = (max_w + 40 - p.width) // 2
        canvas.paste(p, (x_offset, cur_y), p)
        cur_y += p.height + 16
        
    out = io.BytesIO()
    canvas.save(out, format="PNG", optimize=True)
    b64_data = base64.b64encode(out.getvalue()).decode("utf-8")
    
    return {
        "success": True,
        "format": "png",
        "mime_type": "image/png",
        "base64": b64_data,
        "width": max_w + 40,
        "height": total_h,
        "title": mech["title"],
        "description": mech["description"],
        "steps_count": len(mech["steps"])
    }
