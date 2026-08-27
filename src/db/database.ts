import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { CHEMICAL_PRESETS, ChemicalPreset } from "./presets.js";

export interface CachedCompound {
  queryKey: string;
  name: string;
  iupacName?: string;
  canonicalSmiles: string;
  isomericSmiles?: string;
  formula: string;
  molecularWeight: number;
  inchi?: string;
  inchikey?: string;
  pubchemCid?: string;
  source: string;
  createdAt: number;
  lastAccessed: number;
  hitCount: number;
}

export interface CachedRender {
  cacheKey: string;
  smiles: string;
  format: "png" | "svg";
  mimeType: string;
  dataBase64: string;
  width: number;
  height: number;
  createdAt: number;
  hitCount: number;
}

export interface ToolLogEntry {
  id?: number;
  requestId: string;
  toolName: string;
  inputParams: string;
  success: boolean;
  latencyMs: number;
  errorMessage?: string;
  timestamp: number;
}

export class ChemistryDatabase {
  private db: Database.Database;
  private presetMap: Map<string, ChemicalPreset> = new Map();

  constructor(dbPath: string = "chem_cache.db") {
    const dir = path.dirname(dbPath);
    if (dir && dir !== "." && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("synchronous = NORMAL");
    this.initSchema();
    this.initPresetsIndex();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS compounds_cache (
        query_key TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        iupac_name TEXT,
        canonical_smiles TEXT NOT NULL,
        isomeric_smiles TEXT,
        formula TEXT NOT NULL,
        molecular_weight REAL NOT NULL,
        inchi TEXT,
        inchikey TEXT,
        pubchem_cid TEXT,
        source TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_accessed INTEGER NOT NULL,
        hit_count INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS renders_cache (
        cache_key TEXT PRIMARY KEY,
        smiles TEXT NOT NULL,
        format TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        data_base64 TEXT NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        hit_count INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS tool_call_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT NOT NULL,
        tool_name TEXT NOT NULL,
        input_params TEXT NOT NULL,
        success INTEGER NOT NULL,
        latency_ms REAL NOT NULL,
        error_message TEXT,
        timestamp INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON tool_call_logs(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_compounds_smiles ON compounds_cache(canonical_smiles);
    `);
  }

  private initPresetsIndex() {
    for (const preset of CHEMICAL_PRESETS) {
      // Index by id
      this.presetMap.set(preset.id.toLowerCase().trim(), preset);
      // Index by name
      this.presetMap.set(preset.name.toLowerCase().trim(), preset);
      // Index by SMILES
      this.presetMap.set(preset.smiles.trim(), preset);
      // Index by synonyms
      for (const syn of preset.synonyms) {
        this.presetMap.set(syn.toLowerCase().trim(), preset);
      }
      if (preset.iupacName) {
        this.presetMap.set(preset.iupacName.toLowerCase().trim(), preset);
      }
      if (preset.pubchemCid) {
        this.presetMap.set(preset.pubchemCid.trim(), preset);
      }
    }
  }

  public findPreset(query: string): ChemicalPreset | undefined {
    const q = query.toLowerCase().trim();
    if (this.presetMap.has(q)) {
      return this.presetMap.get(q);
    }
    // Also try exact SMILES match
    if (this.presetMap.has(query.trim())) {
      return this.presetMap.get(query.trim());
    }
    return undefined;
  }

  public getAllPresets(): ChemicalPreset[] {
    return CHEMICAL_PRESETS;
  }

  public getCachedCompound(queryKey: string): CachedCompound | undefined {
    const norm = queryKey.toLowerCase().trim();
    const stmt = this.db.prepare(`
      SELECT * FROM compounds_cache WHERE query_key = ?
    `);
    const row: any = stmt.get(norm);
    if (row) {
      // Increment hit count and update last_accessed
      this.db.prepare(`
        UPDATE compounds_cache 
        SET hit_count = hit_count + 1, last_accessed = ? 
        WHERE query_key = ?
      `).run(Date.now(), norm);

      return {
        queryKey: row.query_key,
        name: row.name,
        iupacName: row.iupac_name,
        canonicalSmiles: row.canonical_smiles,
        isomericSmiles: row.isomeric_smiles,
        formula: row.formula,
        molecularWeight: row.molecular_weight,
        inchi: row.inchi,
        inchikey: row.inchikey,
        pubchemCid: row.pubchem_cid,
        source: row.source,
        createdAt: row.created_at,
        lastAccessed: row.last_accessed,
        hitCount: row.hit_count + 1
      };
    }
    return undefined;
  }

  public saveCachedCompound(compound: Omit<CachedCompound, "createdAt" | "lastAccessed" | "hitCount">): void {
    const now = Date.now();
    const norm = compound.queryKey.toLowerCase().trim();
    const stmt = this.db.prepare(`
      INSERT INTO compounds_cache (
        query_key, name, iupac_name, canonical_smiles, isomeric_smiles,
        formula, molecular_weight, inchi, inchikey, pubchem_cid, source,
        created_at, last_accessed, hit_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(query_key) DO UPDATE SET
        name = excluded.name,
        iupac_name = excluded.iupac_name,
        canonical_smiles = excluded.canonical_smiles,
        isomeric_smiles = excluded.isomeric_smiles,
        formula = excluded.formula,
        molecular_weight = excluded.molecular_weight,
        inchi = excluded.inchi,
        inchikey = excluded.inchikey,
        pubchem_cid = excluded.pubchem_cid,
        source = excluded.source,
        last_accessed = excluded.last_accessed,
        hit_count = hit_count + 1
    `);

    stmt.run(
      norm,
      compound.name,
      compound.iupacName || null,
      compound.canonicalSmiles,
      compound.isomericSmiles || null,
      compound.formula,
      compound.molecularWeight,
      compound.inchi || null,
      compound.inchikey || null,
      compound.pubchemCid || null,
      compound.source,
      now,
      now
    );
  }

  public getCachedRender(cacheKey: string): CachedRender | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM renders_cache WHERE cache_key = ?
    `);
    const row: any = stmt.get(cacheKey);
    if (row) {
      this.db.prepare(`
        UPDATE renders_cache SET hit_count = hit_count + 1 WHERE cache_key = ?
      `).run(cacheKey);

      return {
        cacheKey: row.cache_key,
        smiles: row.smiles,
        format: row.format,
        mimeType: row.mime_type,
        dataBase64: row.data_base64,
        width: row.width,
        height: row.height,
        createdAt: row.created_at,
        hitCount: row.hit_count + 1
      };
    }
    return undefined;
  }

  public saveCachedRender(render: Omit<CachedRender, "createdAt" | "hitCount">): void {
    const stmt = this.db.prepare(`
      INSERT INTO renders_cache (
        cache_key, smiles, format, mime_type, data_base64, width, height, created_at, hit_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(cache_key) DO UPDATE SET
        hit_count = hit_count + 1
    `);
    stmt.run(
      render.cacheKey,
      render.smiles,
      render.format,
      render.mimeType,
      render.dataBase64,
      render.width,
      render.height,
      Date.now()
    );
  }

  public logToolCall(entry: ToolLogEntry): void {
    const stmt = this.db.prepare(`
      INSERT INTO tool_call_logs (
        request_id, tool_name, input_params, success, latency_ms, error_message, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      entry.requestId,
      entry.toolName,
      entry.inputParams,
      entry.success ? 1 : 0,
      entry.latencyMs,
      entry.errorMessage || null,
      entry.timestamp || Date.now()
    );
  }

  public getStats() {
    const totalRequestsRow: any = this.db.prepare(`SELECT COUNT(*) as count, AVG(latency_ms) as avg_latency FROM tool_call_logs`).get();
    const failedRequestsRow: any = this.db.prepare(`SELECT COUNT(*) as count FROM tool_call_logs WHERE success = 0`).get();
    const totalCachedCompoundsRow: any = this.db.prepare(`SELECT COUNT(*) as count, SUM(hit_count) as total_hits FROM compounds_cache`).get();
    const totalCachedRendersRow: any = this.db.prepare(`SELECT COUNT(*) as count, SUM(hit_count) as total_hits FROM renders_cache`).get();
    
    const totalReqs = totalRequestsRow?.count || 0;
    const totalHits = (totalCachedCompoundsRow?.total_hits || 0) + (totalCachedRendersRow?.total_hits || 0);
    const hitRate = totalReqs > 0 ? Math.min(100, Math.round((totalHits / (totalReqs + totalHits)) * 100)) : 0;

    return {
      totalRequests: totalReqs,
      failedRequests: failedRequestsRow?.count || 0,
      averageLatencyMs: Math.round(totalRequestsRow?.avg_latency || 0),
      cachedCompoundsCount: totalCachedCompoundsRow?.count || 0,
      cachedRendersCount: totalCachedRendersRow?.count || 0,
      cacheHitRatePercent: hitRate,
      presetCompoundsCount: CHEMICAL_PRESETS.length
    };
  }

  public getRecentLogs(limit: number = 30): ToolLogEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tool_call_logs ORDER BY timestamp DESC LIMIT ?
    `);
    const rows: any[] = stmt.all(limit);
    return rows.map(r => ({
      id: r.id,
      requestId: r.request_id,
      toolName: r.tool_name,
      inputParams: r.input_params,
      success: r.success === 1,
      latencyMs: r.latency_ms,
      errorMessage: r.error_message,
      timestamp: r.timestamp
    }));
  }

  public close() {
    this.db.close();
  }
}
