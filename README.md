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

## Connecting to AI Clients

### 1. Claude Desktop (stdio)
Add the following to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "organic-chemistry": {
      "command": "npx",
      "args": ["-y", "tsx", "C:/Users/TANMAY GARG/Desktop/chem/src/mcp/transports/stdioTransport.ts"]
    }
  }
}
```

### 2. MCP Inspector
To inspect and test all 7 tools interactively:
```bash
npx @modelcontextprotocol/inspector npx tsx src/mcp/transports/stdioTransport.ts
```
Or connect via Streamable HTTP to `http://localhost:3000/mcp`.

### 3. ChatGPT & Remote AI Clients
Deploy the server to an HTTPS-enabled domain (e.g. `https://your-mcp-domain.com/mcp`) and configure it as a Custom Action or MCP Connector.

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
