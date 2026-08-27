# Architecture & Design Principles

This document explains the architecture of the Organic Chemistry Structure MCP Server.

## System Topology

```
+-----------------------------------------------------------------------------------+
|                                 AI Clients                                        |
|               (ChatGPT, Gemini, Claude, Cursor, MCP Inspector)                    |
+----------------------------------------+------------------------------------------+
                                         | MCP Protocol (Streamable HTTP / stdio)
                                         v
+-----------------------------------------------------------------------------------+
|                        Node.js / TypeScript MCP Server                            |
|                                                                                   |
|  - MCP Tool Orchestrator (@modelcontextprotocol/sdk)                              |
|    * show_structure (returns base64 PNG image content item + metadata)            |
|    * resolve_compound (returns detailed molecular JSON metadata)                  |
|    * show_reaction (returns reaction diagrams with arrows & conditions)           |
|    * show_mechanism (returns curved-arrow mechanism diagrams)                     |
|    * compare_structures (returns side-by-side molecular comparison grid)          |
|    * show_resonance (returns canonical resonance forms with resonance arrows)     |
|    * show_stereochemistry (returns R/S, E/Z, wedge-and-dash stereostructures)     |
|                                                                                   |
|  - Transports: Streamable HTTP (/mcp) & stdio                                     |
|  - Compound Resolver & Ambiguity Detector                                         |
|  - SQLite Persistent Cache & Access Metrics                                       |
+-------------------+-------------------------------------------+-------------------+
                    |                                           |
         Lookup     |                               Fast HTTP   | Internal Render
         & Cache    v                                           v Request
+-------------------------+                   +-------------------------------------+
|   SQLite Local Database |                   |   Python Chemistry Engine (RDKit)   |
|                         |                   |                                     |
| - 200+ JEE Presets      |                   | - RDKit 2D Depiction (Cairo / SVG)  |
| - Molecular Cache       |                   | - Reaction Assembly & Layout        |
| - Render Cache (PNG/SVG)|                   | - Mechanism Curved-Arrow Engine     |
| - Access logs & metrics |                   | - Resonance Structure Formatter     |
+------------+------------+                   | - Stereochemistry (Wedge/Dash, CIP) |
             |                                | - PubChem PUG REST Client           |
             | Fallback Lookup                +-------------------------------------+
             v
+-------------------------+
|   PubChem PUG REST API  |
+-------------------------+

+-----------------------------------------------------------------------------------+
|                         Web Testing & Admin Studio                                |
|          (Separate React + Vite + Tailwind UI for testing, admin, & debug)         |
+-----------------------------------------------------------------------------------+
```

## Key Architectural Principles

1. **Separation of Concerns**:
   - The **MCP Server** handles MCP protocol standards, transport sessions, tool schemas, ambiguity handling, caching, and rate limiting.
   - The **Python Chemistry Engine** handles chemical informatics, 2D coordinates computation, RDKit drawing with Cairo, CIP stereochemistry assignments, and reaction layout rendering.
   - The **Web Testing Studio** is a pure administrative/debugging interface and is **not required** for the MCP server to function.

2. **Deterministic Chemistry vs Image Generation**:
   - No image generation models (diffusion/DALL-E) or LLM SVG hallucinations are used.
   - Molecules are rendered deterministically from validated chemical graphs and SMILES strings.

3. **Multi-Tier Resolution Pipeline**:
   - **Tier 1 (Presets)**: Curated database of 200+ JEE and CBSE Class 11/12 organic compounds and reagents.
   - **Tier 2 (Cache)**: SQLite persistent cache with SHA-256 indexed render blocks.
   - **Tier 3 (PubChem)**: Real-time PUG REST API query for uncataloged compounds.
   - **Disambiguation**: Queries like `cresol` or `butanol` are flagged as ambiguous, returning candidate isomers rather than guessing.

4. **MCP Image Payload Standard**:
   - MCP tools return actual image content items:
     ```json
     {
       "content": [
         {
           "type": "image",
           "data": "<base64_encoded_png>",
           "mimeType": "image/png"
         },
         {
           "type": "text",
           "text": "Benzaldehyde (C7H6O)..."
         }
       ]
     }
     ```
