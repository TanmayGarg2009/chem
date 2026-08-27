# Production Deployment Guide (`DEPLOYMENT.md`)

This guide explains how to deploy the Organic Chemistry Structure MCP Server for remote connections from ChatGPT, Claude, Gemini, and other MCP clients.

---

## 1. Environment Variables

Create a `.env` file in the root directory:
```bash
PORT=3000
PYTHON_ENGINE_URL=http://127.0.0.1:8000
DATABASE_PATH=chem_cache.db
ALLOWED_ORIGINS=*
RATE_LIMIT_MAX=600
```

---

## 2. Docker Deployment

### Dockerfile
```dockerfile
FROM python:3.12-slim-bookworm AS python-base

# Install RDKit and system libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libxrender1 \
    libxext6 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY engine/ /app/engine/
RUN pip install --no-cache-dir rdkit pillow fastapi uvicorn pydantic requests

# Node.js stage
FROM node:22-bookworm-slim

# Copy Python environment
COPY --from=python-base /usr/local /usr/local
COPY --from=python-base /app/engine /app/engine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN cd web && npm ci && npm run build && cd ..

EXPOSE 3000
EXPOSE 8000

CMD ["node", "dist/index.js"]
```

---

## 3. Connecting to Remote MCP Clients (ChatGPT, Remote Claude)

1. Deploy the Docker container behind an HTTPS reverse proxy (e.g. Nginx, Caddy, Cloudflare Tunnel, Railway, Render).
2. Configure your public MCP endpoint:
   ```
   https://mcp.your-domain.com/mcp
   ```
3. Verify the healthcheck:
   ```bash
   curl https://mcp.your-domain.com/health
   ```
4. In ChatGPT or your remote client, add the server URL as an MCP Streamable HTTP connector.
