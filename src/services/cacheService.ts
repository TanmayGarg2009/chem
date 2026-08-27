import crypto from "crypto";
import { ChemistryDatabase, CachedRender } from "../db/database.js";
import { ChemistryEngineClient, StructureRenderOptions } from "./chemistryEngineClient.js";

export class CacheService {
  private db: ChemistryDatabase;
  private engine: ChemistryEngineClient;

  constructor(db: ChemistryDatabase, engine: ChemistryEngineClient) {
    this.db = db;
    this.engine = engine;
  }

  public getRenderCacheKey(type: string, payload: Record<string, any>): string {
    const raw = `${type}:${JSON.stringify(payload)}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  public async getOrRenderStructure(opts: StructureRenderOptions): Promise<{
    base64: string;
    mimeType: string;
    properties?: any;
    fromCache: boolean;
  }> {
    const cacheKey = this.getRenderCacheKey("structure", {
      s: opts.smilesOrInchi,
      n: opts.name,
      w: opts.width || 500,
      h: opts.height || 350,
      sn: opts.showName ?? true,
      sf: opts.showFormula ?? true,
      f: opts.format || "png"
    });

    const cached = this.db.getCachedRender(cacheKey);
    if (cached) {
      return {
        base64: cached.dataBase64,
        mimeType: cached.mimeType,
        fromCache: true
      };
    }

    const renderResult = await this.engine.renderStructure(opts);
    if (!renderResult.success || !renderResult.base64) {
      throw new Error(renderResult.error || "Failed to render structure");
    }

    this.db.saveCachedRender({
      cacheKey,
      smiles: opts.smilesOrInchi,
      format: (opts.format || "png") as "png" | "svg",
      mimeType: renderResult.mime_type || "image/png",
      dataBase64: renderResult.base64,
      width: opts.width || 500,
      height: opts.height || 350
    });

    return {
      base64: renderResult.base64,
      mimeType: renderResult.mime_type || "image/png",
      properties: renderResult.properties,
      fromCache: false
    };
  }
}
