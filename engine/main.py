"""
FastAPI Chemistry Engine Microservice.
Exposes high-performance RDKit rendering endpoints for Node.js MCP server.
"""

import time
import io
import base64
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import rdkit
from rdkit import Chem
from PIL import Image, ImageDraw, ImageFont

from renderer import render_structure, parse_structure, render_mol_cairo, render_mol_svg, calculate_properties
from reaction_renderer import render_reaction, render_molecule_tile
from mechanism_renderer import render_mechanism_diagram
from resonance_renderer import render_resonance_diagram
from stereochemistry_renderer import render_stereochemistry_view
from pubchem_client import PubChemClient

app = FastAPI(
    title="Organic Chemistry Structure Engine",
    description="Deterministic RDKit 2D molecular & reaction depiction service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pubchem_client = PubChemClient()
START_TIME = time.time()


# Request Schemas
class StructureRenderRequest(BaseModel):
    smiles_or_inchi: str = Field(..., description="Chemical SMILES or InChI representation")
    name: Optional[str] = Field(None, description="Human readable common or IUPAC compound name")
    width: int = Field(500, description="Image width in pixels")
    height: int = Field(350, description="Image height in pixels")
    show_name: bool = Field(True, description="Display compound name header banner")
    show_formula: bool = Field(True, description="Display molecular formula subtitle")
    format: str = Field("png", description="Image format: png or svg")


class CompoundItem(BaseModel):
    smiles: str
    name: Optional[str] = None


class ReactionRenderRequest(BaseModel):
    reactants: List[CompoundItem]
    products: List[CompoundItem]
    conditions: Optional[str] = None
    title: Optional[str] = None


class MechanismRenderRequest(BaseModel):
    reaction_query: str


class ResonanceStructureItem(BaseModel):
    smiles: str
    label: Optional[str] = None


class ResonanceRenderRequest(BaseModel):
    compound_query: Optional[str] = None
    structures: Optional[List[ResonanceStructureItem]] = None
    title: Optional[str] = None


class StereochemistryRenderRequest(BaseModel):
    compound: str
    configuration: Optional[str] = None
    width: int = 500
    height: int = 380


class CompareRenderRequest(BaseModel):
    compounds: List[CompoundItem]
    title: Optional[str] = "Structure Comparison"
    columns: int = 3


# Endpoints
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Organic Chemistry RDKit Engine",
        "rdkit_version": rdkit.__version__,
        "uptime_seconds": round(time.time() - START_TIME, 1)
    }


@app.post("/render/structure")
def handle_render_structure(req: StructureRenderRequest):
    result = render_structure(
        smiles_or_inchi=req.smiles_or_inchi,
        name=req.name,
        width=req.width,
        height=req.height,
        show_name=req.show_name,
        show_formula=req.show_formula,
        format=req.format
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result


@app.post("/render/reaction")
def handle_render_reaction(req: ReactionRenderRequest):
    reactants_data = [r.dict() for r in req.reactants]
    products_data = [p.dict() for p in req.products]
    result = render_reaction(
        reactants=reactants_data,
        products=products_data,
        conditions=req.conditions,
        title=req.title
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result


@app.post("/render/mechanism")
def handle_render_mechanism(req: MechanismRenderRequest):
    result = render_mechanism_diagram(req.reaction_query)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result


@app.post("/render/resonance")
def handle_render_resonance(req: ResonanceRenderRequest):
    structs_data = [s.dict() for s in req.structures] if req.structures else None
    result = render_resonance_diagram(
        compound_query=req.compound_query,
        structures=structs_data,
        title=req.title
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result


@app.post("/render/stereochemistry")
def handle_render_stereochemistry(req: StereochemistryRenderRequest):
    result = render_stereochemistry_view(
        compound=req.compound,
        configuration=req.configuration,
        width=req.width,
        height=req.height
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result


@app.post("/render/compare")
def handle_render_compare(req: CompareRenderRequest):
    if not req.compounds:
        raise HTTPException(status_code=400, detail="Must provide at least one compound for comparison")
        
    tiles = []
    tile_w, tile_h = 240, 200
    for c in req.compounds:
        mol = parse_structure(c.smiles)
        if not mol:
            raise HTTPException(status_code=400, detail=f"Invalid SMILES in comparison: {c.smiles}")
        tile = render_molecule_tile(mol, name=c.name or c.smiles, width=tile_w, height=tile_h, show_name=True)
        tiles.append(tile)
        
    cols = min(req.columns, len(tiles))
    rows = (len(tiles) + cols - 1) // cols
    
    padding = 24
    header_h = 45 if req.title else 15
    total_w = cols * (tile_w + padding) + padding
    total_h = header_h + rows * (tile_h + 30 + padding) + padding
    
    grid = Image.new("RGBA", (total_w, total_h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(grid)
    
    if req.title:
        try:
            font = ImageFont.load_default()
        except Exception:
            font = None
        draw.text((total_w // 2, 14), req.title, fill=(20, 20, 20, 255), anchor="mt", font=font)
        
    for idx, t in enumerate(tiles):
        r = idx // cols
        c = idx % cols
        x = padding + c * (tile_w + padding)
        y = header_h + r * (tile_h + 30 + padding)
        grid.paste(t, (x, y), t)
        
    out = io.BytesIO()
    grid.save(out, format="PNG", optimize=True)
    b64_data = base64.b64encode(out.getvalue()).decode("utf-8")
    
    return {
        "success": True,
        "format": "png",
        "mime_type": "image/png",
        "base64": b64_data,
        "width": total_w,
        "height": total_h,
        "count": len(tiles)
    }


@app.get("/resolve/pubchem")
def handle_resolve_pubchem(
    name: Optional[str] = Query(None, description="Chemical name to resolve"),
    cid: Optional[int] = Query(None, description="PubChem CID to resolve")
):
    if name:
        res = pubchem_client.resolve_by_name(name)
        if not res.get("success"):
            raise HTTPException(status_code=404, detail=res.get("error", "Compound not found"))
        return res
    elif cid:
        res = pubchem_client.resolve_by_cid(cid)
        if not res.get("success"):
            raise HTTPException(status_code=404, detail=res.get("error", "CID not found"))
        return res
    else:
        raise HTTPException(status_code=400, detail="Must specify either 'name' or 'cid' query parameter.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
