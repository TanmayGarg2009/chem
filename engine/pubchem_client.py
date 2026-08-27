"""
PubChem PUG REST API Client.
Resolves chemical names and identifiers to SMILES, InChI, CIDs, formulas, and IUPAC names.
"""

import time
import urllib.parse
from typing import Dict, Any, Optional, List
import requests

PUBCHEM_BASE_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"


class PubChemClient:
    def __init__(self, base_url: str = PUBCHEM_BASE_URL, timeout: int = 6):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Chemistry-Structure-MCP-Server/1.0 (Organic Chemistry Educational Tool)"
        })
        self.last_request_time = 0.0

    def _rate_limit(self):
        """Ensure we don't exceed PubChem rate limits (max 5 req/sec)."""
        now = time.time()
        elapsed = now - self.last_request_time
        if elapsed < 0.22:
            time.sleep(0.22 - elapsed)
        self.last_request_time = time.time()

    def resolve_by_name(self, name: str) -> Dict[str, Any]:
        """Resolve a compound by common or IUPAC name."""
        encoded_name = urllib.parse.quote(name.strip())
        url = f"{self.base_url}/compound/name/{encoded_name}/property/CanonicalSMILES,IsomericSMILES,MolecularFormula,MolecularWeight,InChI,InChIKey,IUPACName/JSON"
        
        self._rate_limit()
        try:
            resp = self.session.get(url, timeout=self.timeout)
            if resp.status_code == 200:
                data = resp.json()
                props = data.get("PropertyTable", {}).get("Properties", [])
                if props:
                    p = props[0]
                    return {
                        "success": True,
                        "query": name,
                        "pubchem_cid": str(p.get("CID", "")),
                        "canonical_smiles": p.get("CanonicalSMILES", ""),
                        "isomeric_smiles": p.get("IsomericSMILES", p.get("CanonicalSMILES", "")),
                        "formula": p.get("MolecularFormula", ""),
                        "molecular_weight": p.get("MolecularWeight", ""),
                        "inchi": p.get("InChI", ""),
                        "inchikey": p.get("InChIKey", ""),
                        "iupac_name": p.get("IUPACName", ""),
                        "source": "PubChem"
                    }
            elif resp.status_code == 404:
                return {
                    "success": False,
                    "error_code": "COMPOUND_NOT_FOUND",
                    "error": f"Compound '{name}' was not found in PubChem database."
                }
            else:
                return {
                    "success": False,
                    "error_code": "PUBCHEM_ERROR",
                    "error": f"PubChem returned HTTP {resp.status_code}"
                }
        except requests.Timeout:
            return {
                "success": False,
                "error_code": "PUBCHEM_TIMEOUT",
                "error": "PubChem request timed out."
            }
        except Exception as e:
            return {
                "success": False,
                "error_code": "PUBCHEM_NETWORK_ERROR",
                "error": str(e)
            }

    def resolve_by_cid(self, cid: int) -> Dict[str, Any]:
        """Resolve a compound by PubChem CID."""
        url = f"{self.base_url}/compound/cid/{cid}/property/CanonicalSMILES,IsomericSMILES,MolecularFormula,MolecularWeight,InChI,InChIKey,IUPACName/JSON"
        self._rate_limit()
        try:
            resp = self.session.get(url, timeout=self.timeout)
            if resp.status_code == 200:
                data = resp.json()
                props = data.get("PropertyTable", {}).get("Properties", [])
                if props:
                    p = props[0]
                    return {
                        "success": True,
                        "query": str(cid),
                        "pubchem_cid": str(cid),
                        "canonical_smiles": p.get("CanonicalSMILES", ""),
                        "isomeric_smiles": p.get("IsomericSMILES", p.get("CanonicalSMILES", "")),
                        "formula": p.get("MolecularFormula", ""),
                        "molecular_weight": p.get("MolecularWeight", ""),
                        "inchi": p.get("InChI", ""),
                        "inchikey": p.get("InChIKey", ""),
                        "iupac_name": p.get("IUPACName", ""),
                        "source": "PubChem CID"
                    }
            return {"success": False, "error": f"CID {cid} not found"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def check_health(self) -> bool:
        """Quick check to test connectivity to PubChem."""
        try:
            res = self.resolve_by_name("water")
            return res.get("success", False)
        except Exception:
            return False
