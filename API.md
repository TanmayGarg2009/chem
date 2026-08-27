# REST & Dashboard API Reference (`API.md`)

The Chemistry Structure MCP Server provides both standard MCP transports and internal REST API endpoints for administrative testing and dashboard telemetry.

---

## Endpoints

### 1. Healthcheck
- **`GET /health`**
- Returns health status of Node.js MCP server, Python RDKit microservice, database cache, and latency metrics.

### 2. MCP Streamable HTTP Transport
- **`GET /mcp`**: Establishes Server-Sent Events (SSE) session stream with MCP client.
- **`POST /mcp/messages?sessionId=<id>`**: Dispatches JSON-RPC 2.0 message payload to active MCP session.

### 3. Analytics & Telemetry
- **`GET /api/stats`**: Returns cache hit rates, average latency, total tool calls, and preset counts.
- **`GET /api/logs?limit=30`**: Returns recent tool execution logs with input parameters and latencies.

### 4. Presets Library
- **`GET /api/compounds?category=Hydrocarbon&search=benzene`**: Lists matching chemical presets with SMILES, formulas, and categories.

### 5. Direct Test Render Endpoints
- **`POST /api/render/structure`**: Single molecule rendering.
- **`POST /api/render/reaction`**: Reaction equation diagram rendering.
- **`POST /api/render/mechanism`**: Multi-step mechanism rendering.
- **`POST /api/render/resonance`**: Resonance canonical forms rendering.
- **`POST /api/render/stereochemistry`**: Wedge/dash stereochemistry rendering.
- **`POST /api/render/compare`**: Comparison grid rendering.
