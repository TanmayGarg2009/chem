# Testing Guide (`TESTING.md`)

This guide explains how to run the automated unit and integration tests across the Node.js MCP server and Python RDKit microservice.

---

## 1. Running Automated Tests

### Node.js Test Suite (Vitest)
Executes unit tests for presets, ambiguity detection, SQLite caching, and integration tests for all 7 MCP tools:
```bash
npm test
```

### Python Chemistry Engine Test Suite (pytest)
Executes molecular parsing, 2D depiction rendering, reaction assembly, mechanism generators, resonance diagrams, and stereochemistry rendering tests:
```bash
npm run test:python
# or
.\.venv\Scripts\python -m pytest engine/tests
```

---

## 2. Interactive Testing via MCP Inspector

Run the official MCP Inspector to test tools live via standard I/O:
```bash
npx @modelcontextprotocol/inspector npx tsx src/mcp/transports/stdioTransport.ts
```

---

## 3. Interactive Testing via Web Testing Studio

1. Start the server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000` in your browser.
3. Use the **Structure Tester**, **Reaction Tester**, **Mechanism Explorer**, **Resonance Explorer**, and **MCP Inspector** tabs to test rendering and live responses.
