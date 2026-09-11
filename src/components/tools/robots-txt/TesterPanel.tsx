"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  FileCode,
  Upload,
  RotateCcw,
  Globe,
  Info
} from "lucide-react";
import {
  ParsedRobotsTxt,
  RobotsMatchResult,
  RobotsValidationResult,
  matchRobotsUrl,
  validateRobotsTxt,
  parseRobotsTxt,
  getCrawlerPresets
} from "@/lib/robots-txt";
import ValidationHealth from "./ValidationHealth";

interface TesterPanelProps {
  rawContent: string;
  onChangeContent: (content: string) => void;
}

interface LiveFetchResponse {
  ok: boolean;
  body?: string;
  bytes?: number;
  httpStatus?: number;
  error?: { code?: string; message?: string };
}

interface LiveFetchState {
  loading: boolean;
  message?: string;
  error?: string;
}

const QUICK_TEST_PATHS = [
  "/",
  "/admin/",
  "/private/data",
  "/api/users",
  "/blog/seo-guide",
  "/robots.txt"
];

export default function TesterPanel({
  rawContent,
  onChangeContent
}: TesterPanelProps) {
  const presets = useMemo(() => getCrawlerPresets(), []);
  const [selectedCrawler, setSelectedCrawler] = useState("Googlebot");
  const [customCrawler, setCustomCrawler] = useState("");
  const [testPath, setTestPath] = useState("/");
  const [fetchUrl, setFetchUrl] = useState("");
  const [fetchState, setFetchState] = useState<LiveFetchState>({ loading: false });

  // Parse and validate live content
  const parsed: ParsedRobotsTxt = useMemo(() => {
    return parseRobotsTxt(rawContent);
  }, [rawContent]);

  const validation: RobotsValidationResult = useMemo(() => {
    return validateRobotsTxt(parsed);
  }, [parsed]);

  // Determine active crawler token.
  // An empty custom token must not silently fall back to a different crawler.
  const customToken = customCrawler.trim();
  const isCustomEmpty = selectedCrawler === "custom" && customToken === "";
  const effectiveCrawler =
    selectedCrawler === "custom" ? (customToken || "*") : selectedCrawler;

  // Run matching
  const matchResult: RobotsMatchResult = useMemo(() => {
    return matchRobotsUrl(parsed, testPath, effectiveCrawler);
  }, [parsed, testPath, effectiveCrawler]);

  // Fetch the live robots.txt for the requested origin via the ToolTive API.
  const handleLiveFetch = async () => {
    const origin = fetchUrl.trim();
    if (!origin || fetchState.loading) return;

    setFetchState({ loading: true, message: undefined, error: undefined });
    try {
      const res = await fetch("/api/robots-txt/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: origin })
      });
      const json: LiveFetchResponse = await res.json();
      if (json.ok && typeof json.body === "string") {
        onChangeContent(json.body);
        setFetchState({
          loading: false,
          message: `Fetched ${json.bytes ?? json.body.length} bytes (HTTP ${json.httpStatus ?? 200}). Loaded into the editor below.`,
          error: undefined
        });
      } else {
        setFetchState({
          loading: false,
          message: undefined,
          error: json.error?.message || "The live fetch could not be completed."
        });
      }
    } catch {
      setFetchState({
        loading: false,
        message: undefined,
        error: "The live fetch could not be completed. Please try again."
      });
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (typeof text === "string") {
        onChangeContent(text);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* SECTION 1: REAL-TIME URL TESTER */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "24px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 16,
            fontWeight: 700,
            color: "var(--accent)",
            marginBottom: 8
          }}
        >
          <Search size={18} />
          <span>Real-Time URL Access Tester</span>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
          Select a search engine crawler or AI bot, and test whether specific URL paths are allowed or blocked by your directives.
        </p>

        {/* Crawler + Path Inputs */}
        <div className="robots-test-input-row">
          <div>
            <label className="robots-label" style={{ marginBottom: 6 }}>
              Crawler / User-Agent:
            </label>
            <select
              className="robots-select"
              value={selectedCrawler}
              onChange={(e) => setSelectedCrawler(e.target.value)}
            >
              {presets.map((p) => (
                <option key={p.id} value={p.productToken || "custom"}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {selectedCrawler === "custom" && (
            <div>
              <label className="robots-label" style={{ marginBottom: 6 }}>
                Custom Token:
              </label>
              <input
                type="text"
                className="robots-input"
                placeholder="e.g. MyCrawler/1.0"
                value={customCrawler}
                onChange={(e) => setCustomCrawler(e.target.value)}
              />
            </div>
          )}

          <div style={{ flex: 1 }}>
            <label className="robots-label" style={{ marginBottom: 6 }}>
              Test URL Path:
            </label>
            <input
              type="text"
              className="robots-input"
              placeholder="/admin/settings or /page.html"
              value={testPath}
              onChange={(e) => setTestPath(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Test Chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>
            Quick Tests:
          </span>
          {QUICK_TEST_PATHS.map((path) => (
            <button
              key={path}
              type="button"
              className="robots-chip-btn"
              onClick={() => setTestPath(path)}
            >
              {path}
            </button>
          ))}
        </div>

        {/* DECISION RESULT BANNER */}
        <div style={{ marginTop: 24 }}>
          {isCustomEmpty ? (
            <div
              className="robots-result-banner"
              role="status"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                display: "flex",
                gap: 12,
                alignItems: "center",
                fontSize: 13,
                color: "var(--text-secondary)"
              }}
            >
              <Info size={18} color="#60a5fa" />
              <span>
                Custom crawler token cannot be empty. Enter a token (e.g.{" "}
                <code>MyCrawler/1.0</code>) to run the test.
              </span>
            </div>
          ) : (
          <div
            className={`robots-result-banner ${
              matchResult.decision === "allowed" ? "allowed" : "blocked"
            }`}
            role="status"
          >
            <div className="robots-status-left">
              <div className="robots-status-icon">
                {matchResult.decision === "allowed" ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <XCircle size={24} />
                )}
              </div>
              <div>
                <div className="robots-status-title">
                  {matchResult.decision === "allowed"
                    ? "ALLOWED FOR CRAWLING"
                    : "BLOCKED FROM CRAWLING"}
                </div>
                <div className="robots-status-desc">
                  Crawler: <strong>{matchResult.crawlerToken}</strong> · Path:{" "}
                  <code>{matchResult.normalizedPath}</code>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="robots-reason-badge">
                {formatReasonLabel(matchResult.reason)}
              </span>
            </div>
          </div>
          )}

          {/* Matched Rule Details */}
          {!isCustomEmpty && matchResult.matchedRule && (
            <div
              style={{
                marginTop: 12,
                padding: "12px 16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8
              }}
            >
              <div>
                <span style={{ color: "var(--text-muted)", marginRight: 8 }}>
                  Winning Directive:
                </span>
                <strong
                  style={{
                    color:
                      matchResult.matchedRule.action === "allow"
                        ? "#34d399"
                        : "#f87171"
                  }}
                >
                  {matchResult.matchedRule.action.toUpperCase()}:{" "}
                  {matchResult.matchedRule.path || "(empty / all)"}
                </strong>
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Declared on Line {matchResult.matchedRule.line}
              </span>
            </div>
          )}

          {/* Candidate Rules Breakdown Table */}
          {!isCustomEmpty && matchResult.candidateRules.length > 1 && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 6
                }}
              >
                All Matching Candidate Rules ({matchResult.candidateRules.length}):
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="robots-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Action</th>
                      <th>Pattern</th>
                      <th>Line</th>
                      <th>Specificity (Length)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchResult.candidateRules.map((cand, idx) => {
                      const isWinning =
                        cand.line === matchResult.matchedRule?.line &&
                        cand.action === matchResult.matchedRule?.action &&
                        cand.path === matchResult.matchedRule?.path;

                      return (
                        <tr
                          key={`cand-${idx}`}
                          className={isWinning ? "winning-row" : ""}
                        >
                          <td>
                            {isWinning ? (
                              <span
                                style={{
                                  color: "var(--accent)",
                                  fontWeight: 700,
                                  fontSize: 11
                                }}
                              >
                                ★ WINNER
                              </span>
                            ) : (
                              <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                                Overridden
                              </span>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                color:
                                  cand.action === "allow" ? "#34d399" : "#f87171",
                                fontWeight: 600
                              }}
                            >
                              {cand.action.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <code>{cand.path || "/"}</code>
                          </td>
                          <td>Line {cand.line}</td>
                          <td>{cand.matchLength} chars</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: LIVE FETCH */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "20px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 15,
            fontWeight: 700,
            color: "var(--accent)",
            marginBottom: 12
          }}
        >
          <Globe size={18} />
          <span>Fetch Live robots.txt</span>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
          Enter a website origin (for example, https://example.com) to load its live
          robots.txt into the editor below, then test and validate it.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input
            type="text"
            className="robots-input"
            placeholder="https://example.com"
            aria-label="Website origin to fetch robots.txt from"
            value={fetchUrl}
            onChange={(e) => setFetchUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleLiveFetch();
              }
            }}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void handleLiveFetch()}
            disabled={fetchState.loading}
            style={{ padding: "8px 18px", fontSize: 13, whiteSpace: "nowrap" }}
          >
            {fetchState.loading ? "Fetching..." : "Fetch robots.txt"}
          </button>
        </div>

        {fetchState.error && (
          <div
            role="alert"
            style={{
              marginTop: 12,
              padding: "12px 16px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "flex-start",
              gap: 12
            }}
          >
            <ShieldAlert size={18} color="#f87171" style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{fetchState.error}</span>
          </div>
        )}

        {fetchState.message && !fetchState.error && (
          <div
            role="status"
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "flex-start",
              gap: 12
            }}
          >
            <ShieldCheck size={18} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{fetchState.message}</span>
          </div>
        )}
      </div>

      {/* SECTION 2: LIVE VALIDATION & HEALTH REPORT */}
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 12
          }}
        >
          SEO Crawl Health &amp; Diagnostics
        </div>
        <ValidationHealth validation={validation} />
      </div>

      {/* SECTION 3: RAW ROBOTS.TXT EDITOR */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "20px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            flexWrap: "wrap",
            gap: 8
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 700,
              color: "var(--accent)"
            }}
          >
            <FileCode size={18} />
            <span>Direct robots.txt Editor</span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <label
              className="btn-secondary"
              style={{
                padding: "6px 12px",
                fontSize: 12,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Upload size={14} />
              <span>Upload File</span>
              <input
                type="file"
                accept=".txt,text/plain"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>

            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                onChangeContent(
                  `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://example.com/sitemap.xml\n`
                )
              }
              style={{ padding: "6px 12px", fontSize: 12 }}
              title="Reset to default template"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <textarea
          className="robots-textarea"
          value={rawContent}
          onChange={(e) => onChangeContent(e.target.value)}
          placeholder="# Enter or paste your robots.txt here..."
        />
      </div>
    </div>
  );
}

function formatReasonLabel(reason: string): string {
  switch (reason) {
    case "robots_txt_implicit_allow":
      return "Implicit /robots.txt Allow (RFC 9309)";
    case "most_specific_rule":
      return "Longest / Most Specific Match Wins";
    case "equal_specificity_allow":
      return "Equal Specificity Conflict: Allow Wins";
    case "no_matching_rule":
      return "No Blocking Rule: Allowed by Default";
    case "no_matching_group":
      return "No Applicable Group: Allowed by Default";
    case "wildcard_group":
      return "Matched via Fallback Wildcard (*) Group";
    case "allow_rule":
      return "Explicit Allow Rule";
    case "disallow_rule":
      return "Explicit Disallow Rule";
    default:
      return reason;
  }
}
