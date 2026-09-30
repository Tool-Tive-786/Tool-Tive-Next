CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  session_hash TEXT NOT NULL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  root_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  pages_discovered INTEGER DEFAULT 0,
  pages_scanned INTEGER DEFAULT 0,
  score_json TEXT,
  report_json TEXT
);

CREATE TABLE IF NOT EXISTS scan_pages (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  url TEXT NOT NULL,
  status INTEGER,
  signals_json TEXT,
  FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quota_daily (
  identity_hash TEXT,
  utc_date TEXT,
  basic_count INTEGER DEFAULT 0,
  PRIMARY KEY (identity_hash, utc_date)
);

CREATE INDEX IF NOT EXISTS idx_scans_session ON scans(session_hash);
CREATE INDEX IF NOT EXISTS idx_scan_pages_scan_id ON scan_pages(scan_id);
