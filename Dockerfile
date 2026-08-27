FROM python:3.12-slim-bookworm AS python-base

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libxrender1 \
    libxext6 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY engine/ /app/engine/
RUN pip install --no-cache-dir rdkit pillow fastapi uvicorn pydantic requests

FROM node:22-bookworm-slim

COPY --from=python-base /usr/local /usr/local
COPY --from=python-base /app/engine /app/engine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
EXPOSE 8000

ENV PORT=3000
ENV PYTHON_ENGINE_URL=http://127.0.0.1:8000

CMD ["node", "dist/index.js"]
