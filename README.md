# Organic Chemistry Structure MCP Server 🧪

A production-quality **Model Context Protocol (MCP)** Server designed to allow AI assistants (**ChatGPT, Gemini, Claude, Cursor, MCP Inspector**) to deterministically render, resolve, and display accurate 2D organic chemistry structures, reactions, mechanisms, resonance contributors, and stereochemistry directly inside AI conversations using native MCP image content.

---

## Key Features

- **Direct In-Chat 2D Depictions**: Returns native MCP image content items (`image/png` base64) so compatible AI clients render structures directly without requiring an external image host or diffusion model.
- **Deterministic Chemical Rendering**: Powered by **RDKit** and **Cairo** for publication-quality textbook depictions with CPK standard colors and clear skeletal bonds.
- **Multi-Tier Resolution**:
  1. **Curated JEE Presets**: 200+ Class 11/12 JEE Main and Advanced compounds and reagents loaded locally for instantaneous (<10ms) responses.
  2. **SQLite Persistent Cache**: Auto-caches resolved compounds and pre-rendered depictions.
  3. **PubChem PUG REST API**: Fallback lookup for thousands of known organic molecules.
  4. **Ambiguity Engine**: Never guesses isomers. Flags ambiguous names (e.g. *cresol*, *butanol*, *xylene*) and prompts for disambiguation.
- **7 MCP Tools**:
  - `show_structure`: Visual 2D depiction with formula, MW, SMILES, and source metadata.
  - `resolve_compound`: Complete molecular metadata in structured JSON.
  - `show_reaction`: Publication-quality aligned reaction equations with conditions and arrows.
  - `show_mechanism`: Multi-step mechanisms with intermediate panels, formal charges, and curved arrows (SN1, SN2, EAS, Alkene Hydration, Aldol).
  - `compare_structures`: Side-by-side molecular comparison grids.
  - `show_resonance`: Resonance canonical contributors enclosed in brackets with $\leftrightarrow$ arrows.
  - `show_stereochemistry`: Explicit 3D wedge-and-dash projections with R/S and E/Z annotations.
- **Dual Transports**:
  - **Streamable HTTP**: Modern `/mcp` endpoint for remote AI connections.
  - **Stdio**: Standard input/output transport for local AI tools and MCP Inspector CLI.
- **Testing & Admin Web Studio**: Built with React + Vite + Tailwind CSS for live testing, inspecting MCP calls, browsing presets, and monitoring server health.

---

## Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v24)
- **Python**: v3.10+ (tested on Python 3.12 with `.venv`)

### 2. Installation
```bash
# Clone or open the repository directory
cd chem

# Install Node.js dependencies
npm install

# Setup Python virtual environment and chemistry dependencies
py -3.12 -m venv .venv
.\.venv\Scripts\python -m pip install rdkit pillow fastapi uvicorn pydantic requests pytest
```

### 3. Build & Run
```bash
# Build the TypeScript backend & React frontend
npm run build
cd web && npm run build && cd ..

# Start the unified MCP server & Web Studio (starts Node and Python engine automatically)
npm run dev
# Or for production:
npm start
```

- **MCP Streamable HTTP Endpoint**: `http://localhost:3000/mcp`
- **Web Testing & Admin Studio**: `http://localhost:3000/`
- **Healthcheck**: `http://localhost:3000/health`

---

## Live Deployment & AI Connection

- **Live Web Dashboard**: [https://chem-ten-dun.vercel.app/](https://chem-ten-dun.vercel.app/)
- **Live Streamable HTTP MCP Endpoint**: `https://chem-ten-dun.vercel.app/mcp`

---

## Connecting to AI Clients

### 1. Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "organic-chemistry": {
      "url": "https://chem-ten-dun.vercel.app/mcp"
    }
  }
}
```

### 2. Cursor IDE & Cline
In `.cursor/mcp.json` or Settings $\rightarrow$ MCP:
```json
{
  "mcpServers": {
    "organic-chemistry": {
      "url": "https://chem-ten-dun.vercel.app/mcp"
    }
  }
}
```

### 3. Master AI System Prompt (ChatGPT / Claude / Gemini)
Paste the following prompt into your Custom GPT instructions, Claude Project, or System Prompt:
```markdown
You are an expert Organic Chemistry AI Assistant integrated with the Organic Chemistry Structure MCP Server (https://chem-ten-dun.vercel.app/mcp).
Whenever explaining chemical compounds, reactions, mechanisms, resonance, comparisons, or stereochemistry, PROACTIVELY CALL the MCP tools:
- show_structure: { "compound": "..." }
- show_reaction: { "reactants": ["..."], "products": ["..."], "conditions": "..." }
- show_mechanism: { "reaction": "..." }
- compare_structures: { "compounds": ["...", "..."] }
- show_resonance: { "compound": "..." }
- show_stereochemistry: { "compound": "...", "configuration": "R" | "S" }
```

---

## Running Tests

```bash
# Run Node.js unit and integration tests (Vitest)
npm test

# Run Python RDKit engine tests (pytest)
npm run test:python
```

---

## License
MIT
