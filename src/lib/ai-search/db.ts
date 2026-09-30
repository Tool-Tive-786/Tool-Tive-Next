import { ScanState, ScanMode, ScanStatus } from "./types";

// In-memory fallback for local development if D1 is not bound
const g = globalThis as any;
if (!g.__tooltiveAiSearchDb) {
  g.__tooltiveAiSearchDb = {
    scans: new Map<string, any>(),
    pages: new Map<string, any>(),
    quotas: new Map<string, any>(),
  };
}
const mockDb = g.__tooltiveAiSearchDb;

export async function createScanRecord(env: any, scanId: string, sessionHash: string, rootUrl: string, mode: ScanMode) {
  if (env && env.DB) {
    await env.DB.prepare(
      "INSERT INTO scans (id, session_hash, mode, status, root_url) VALUES (?, ?, ?, ?, ?)"
    ).bind(scanId, sessionHash, mode, 'queued', rootUrl).run();
  } else {
    mockDb.scans.set(scanId, {
      id: scanId,
      session_hash: sessionHash,
      mode,
      status: 'queued',
      root_url: rootUrl,
      created_at: new Date().toISOString(),
      pages_discovered: 0,
      pages_scanned: 0,
    });
  }
}

export async function getScanRecord(env: any, scanId: string): Promise<any> {
  if (env && env.DB) {
    const row = await env.DB.prepare("SELECT * FROM scans WHERE id = ?").bind(scanId).first();
    return row;
  }
  return mockDb.scans.get(scanId);
}

export async function updateScanStatus(env: any, scanId: string, status: ScanStatus, pagesDiscovered: number, pagesScanned: number, reportJson?: string) {
  if (env && env.DB) {
    let query = "UPDATE scans SET status = ?, pages_discovered = ?, pages_scanned = ?, updated_at = CURRENT_TIMESTAMP";
    const binds: any[] = [status, pagesDiscovered, pagesScanned];
    
    if (reportJson) {
      query += ", report_json = ?";
      binds.push(reportJson);
    }
    
    query += " WHERE id = ?";
    binds.push(scanId);
    
    await env.DB.prepare(query).bind(...binds).run();
  } else {
    const scan = mockDb.scans.get(scanId);
    if (scan) {
      scan.status = status;
      scan.pages_discovered = pagesDiscovered;
      scan.pages_scanned = pagesScanned;
      scan.updated_at = new Date().toISOString();
      if (reportJson) scan.report_json = reportJson;
    }
  }
}

export async function incrementQuota(env: any, identityHash: string, dateStr: string) {
  if (env && env.DB) {
    await env.DB.prepare(`
      INSERT INTO quota_daily (identity_hash, utc_date, basic_count) 
      VALUES (?, ?, 1)
      ON CONFLICT(identity_hash, utc_date) DO UPDATE SET basic_count = basic_count + 1
    `).bind(identityHash, dateStr).run();
  } else {
    const key = `${identityHash}_${dateStr}`;
    const current = mockDb.quotas.get(key) || { basic_count: 0 };
    current.basic_count++;
    mockDb.quotas.set(key, current);
  }
}

export async function getQuota(env: any, identityHash: string, dateStr: string): Promise<number> {
  if (env && env.DB) {
    const row = await env.DB.prepare("SELECT basic_count FROM quota_daily WHERE identity_hash = ? AND utc_date = ?").bind(identityHash, dateStr).first();
    return row ? (row.basic_count as number) : 0;
  }
  const key = `${identityHash}_${dateStr}`;
  const current = mockDb.quotas.get(key);
  return current ? current.basic_count : 0;
}
