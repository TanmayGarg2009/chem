"""
Unit and functional tests for the RDKit chemistry rendering engine.
"""

import sys
import os
import pytest
import base64
import io
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from renderer import render_structure, parse_structure, calculate_properties
from reaction_renderer import render_reaction
from mechanism_renderer import render_mechanism_diagram, find_mechanism
from resonance_renderer import render_resonance_diagram
from stereochemistry_renderer import render_stereochemistry_view
from pubchem_client import PubChemClient


def test_parse_structure():
    assert parse_structure("c1ccccc1") is not None
    assert parse_structure("O=Cc1ccccc1") is not None
    assert parse_structure("CCO") is not None
    assert parse_structure("INVALID_SMILES_XYZ_999") is None


def test_calculate_properties():
    mol = parse_structure("O=Cc1ccccc1")
    props = calculate_properties(mol)
    assert props["formula"] == "C7H6O"
    assert props["canonical_smiles"] == "O=Cc1ccccc1"
    assert float(props["molecular_weight"]) > 105.0


def test_render_structure_png():
    res = render_structure("O=Cc1ccccc1", name="Benzaldehyde")
    assert res["success"] is True
    assert res["mime_type"] == "image/png"
    assert len(res["base64"]) > 100
    
    raw = base64.b64decode(res["base64"])
    img = Image.open(io.BytesIO(raw))
    assert img.format == "PNG"
    assert img.width > 200


def test_render_structure_svg():
    res = render_structure("CCO", name="Ethanol", format="svg")
    assert res["success"] is True
    assert res["format"] == "svg"
    assert "<svg" in res["svg"]


def test_render_reaction():
    reactants = [
        {"smiles": "c1ccccc1", "name": "Benzene"},
        {"smiles": "BrBr", "name": "Br2"}
    ]
    products = [
        {"smiles": "Brc1ccccc1", "name": "Bromobenzene"},
        {"smiles": "Br", "name": "HBr"}
    ]
    res = render_reaction(reactants=reactants, products=products, conditions="FeBr3")
    assert res["success"] is True
    assert res["mime_type"] == "image/png"
    assert len(res["base64"]) > 200
    
    raw = base64.b64decode(res["base64"])
    img = Image.open(io.BytesIO(raw))
    assert img.format == "PNG"


def test_render_mechanisms():
    res_sn1 = render_mechanism_diagram("sn1 hydrolysis of tert-butyl bromide")
    assert res_sn1["success"] is True
    assert res_sn1["steps_count"] == 3
    
    res_sn2 = render_mechanism_diagram("sn2 substitution")
    assert res_sn2["success"] is True
    assert res_sn2["steps_count"] == 1
    
    res_eas = render_mechanism_diagram("eas bromination of benzene")
    assert res_eas["success"] is True


def test_render_resonance():
    res = render_resonance_diagram("phenoxide ion")
    assert res["success"] is True
    assert res["mime_type"] == "image/png"
    
    raw = base64.b64decode(res["base64"])
    img = Image.open(io.BytesIO(raw))
    assert img.format == "PNG"


def test_render_stereochemistry():
    res = render_stereochemistry_view("2-butanol", configuration="R")
    assert res["success"] is True
    assert res["stereocenters_count"] >= 1
    
    raw = base64.b64decode(res["base64"])
    img = Image.open(io.BytesIO(raw))
    assert img.format == "PNG"
