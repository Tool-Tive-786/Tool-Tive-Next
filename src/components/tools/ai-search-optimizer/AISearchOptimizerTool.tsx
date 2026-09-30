"use client";

import React, { useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import '@/styles/ai-search-optimizer.css';
import { ScanState, StartScanResponse, ScanIssue } from '@/lib/ai-search/types';
import { AnalyzerResult } from '@/lib/ai-search/analyzer';
import {
  Globe,
  Search,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Printer,
  RotateCcw,
  FileText,
  Layers,
  Lock,
  Code2,
  ChevronDown,
  ChevronUp,
  Info,
  Server,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function AISearchOptimizerTool() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'queued' | 'analyzing' | 'completed' | 'failed'>('idle');
  const [scanId, setScanId] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ discovered: number; scanned: number }>({ discovered: 0, scanned: 0 });
  const [report, setReport] = useState<AnalyzerResult | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<'issues' | 'pages' | 'categories'>('issues');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'important' | 'opportunity'>('all');
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  // On mount, restore ongoing or completed scan from sessionStorage or URL query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const savedScanId = urlParams.get('scanId') || sessionStorage.getItem('tooltive_ais_scan_id');
      if (!savedScanId) return;

      setScanId(savedScanId);
      fetch(`/api/ai-search/scan/${savedScanId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.rootUrl) setUrl(data.rootUrl);
          if (data.status === 'completed' && data.report) {
            setStatus('completed');
            setReport(data.report);
            setProgress({ discovered: data.pagesDiscovered || 0, scanned: data.pagesScanned || 0 });
          } else if (data.status === 'analyzing' || data.status === 'queued') {
            setStatus(data.status);
            setProgress({ discovered: data.pagesDiscovered || 0, scanned: data.pagesScanned || 0 });
          } else if (data.status === 'failed') {
            setStatus('failed');
            setError(data.error || 'Scan failed to complete');
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

  // Polling for scan status
  useEffect(() => {
    if (status === 'queued' || status === 'analyzing') {
      const interval = setInterval(async () => {
        if (!scanId) return;
        try {
          const res = await fetch(`/api/ai-search/scan/${scanId}`);
          const data = await res.json();
          if (data.status === 'completed') {
            setStatus('completed');
            setReport(data.report);
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setStatus('failed');
            setError(data.error || 'Scan failed to complete');
            clearInterval(interval);
          } else {
            setStatus(data.status);
            setProgress({ discovered: data.pagesDiscovered || 0, scanned: data.pagesScanned || 0 });
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [status, scanId]);

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('idle');
    setReport(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a website URL to scan.');
      return;
    }

    try {
      const res = await fetch('/api/ai-search/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'basic', url: trimmedUrl, turnstileToken }),
      });
      const data: StartScanResponse = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to start scan.');
        return;
      }

      setScanId(data.scanId);
      setStatus('queued');
      try {
        sessionStorage.setItem('tooltive_ais_scan_id', data.scanId);
      } catch {}

      if (data.quota && typeof data.quota.remaining === 'number') {
        setQuotaRemaining(data.quota.remaining);
      }

      // Trigger background crawler runner
      fetch('/api/ai-search/scan/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId: data.scanId, url: trimmedUrl }),
      })
        .then((res) => res.json())
        .then((stepData) => {
          if (stepData.status === 'completed' && stepData.report) {
            setStatus('completed');
            setReport(stepData.report);
            setProgress({
              discovered: stepData.pagesDiscovered || 0,
              scanned: stepData.pagesScanned || 0,
            });
          } else if (stepData.status === 'failed') {
            setStatus('failed');
            setError(stepData.error || 'Scan failed to complete');
          }
        })
        .catch((err) => console.error('Step execution error:', err));
    } catch (e) {
      setError('Could not connect to the scanning service. Please try again.');
    }
  };

  const toggleIssueEvidence = (idx: number) => {
    setExpandedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleCopySummary = () => {
    if (!report) return;
    const summary = [
      `ToolTive AI Search Optimizer Report`,
      `Target: ${url}`,
      `Score: ${report.score} / 100`,
      `Score Tier: ${getScoreTier(report.score).label}`,
      `Pages Audited: ${progress.scanned || report.pagesSummary?.length || 10}`,
      `Issues Detected: ${report.issues.length}`,
      `- Critical: ${report.issues.filter((i) => i.severity === 'critical').length}`,
      `- Important: ${report.issues.filter((i) => i.severity === 'important').length}`,
      `- Opportunities: ${report.issues.filter((i) => i.severity === 'opportunity' || i.severity === 'info').length}`,
      `Generated by ToolTive: https://tooltive.com/all-tools/seo/ai-search-optimizer`
    ].join('\n');

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Score tier calculation - LOCKED SPECIFICATION (Section 33)
  // 90–100 = Strong
  // 75–89  = Good
  // 60–74  = Needs Work
  // 40–59  = Weak
  // 0–39   = Critical Attention
  const getScoreTier = (score: number) => {
    if (score >= 90) return { label: 'Strong', class: 'ais-tier-excellent', color: '#10b981' };
    if (score >= 75) return { label: 'Good', class: 'ais-tier-good', color: 'var(--color-primary)' };
    if (score >= 60) return { label: 'Needs Work', class: 'ais-tier-warning', color: '#d97706' };
    if (score >= 40) return { label: 'Weak', class: 'ais-tier-weak', color: '#f59e0b' };
    return { label: 'Critical Attention', class: 'ais-tier-critical', color: '#ef4444' };
  };

  // Filter issues
  const filteredIssues = report?.issues.filter((issue) => {
    if (severityFilter === 'all') return true;
    if (severityFilter === 'opportunity') return issue.severity === 'opportunity' || issue.severity === 'info';
    return issue.severity === severityFilter;
  }) || [];

  return (
    <div className="ais-tool-container">
      <div className="ais-card">
        {/* ==================== 1. IDLE / INPUT VIEW ==================== */}
        {status === 'idle' && (
          <>
            <div className="ais-card-header">
              <div className="ais-badge-row">
                <span className="ais-tag">
                  <Sparkles size={13} />
                  Phase 1 • Basic Scan
                </span>
                <span className="ais-quota-tag">
                  Scans remaining today: <strong>{quotaRemaining} of 3</strong>
                </span>
              </div>
              <h2 className="ais-card-title">Audit Your Website for AI Search Readiness</h2>
              <p className="ais-card-desc">
                Evaluate your technical SEO, robots.txt, Schema.org structured data, and content accessibility signals
                across up to 10 pages with our deterministic edge scanner.
              </p>
            </div>

            <div className="ais-form-wrap">
              <form onSubmit={handleStartScan} className="ais-input-bar-group">
                <div className="ais-input-bar">
                  <div className="ais-input-icon">
                    <Globe size={20} />
                  </div>
                  <input
                    id="urlInput"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    className="ais-url-input"
                  />
                  <button type="submit" className="ais-btn-submit">
                    <Search size={16} />
                    Start Basic Scan
                  </button>
                </div>

                {error && (
                  <div className="ais-alert-error">
                    <AlertCircle size={20} className="ais-alert-icon" />
                    <div>
                      <strong>Scan Notice: </strong>
                      {error}
                    </div>
                  </div>
                )}
              </form>

              <div className="ais-security-footer">
                <div className="ais-security-info">
                  <ShieldCheck size={16} style={{ color: '#10b981' }} />
                  <span>Protected with RFC 9309 compliance & safe SSRF egress boundaries.</span>
                </div>
                <div>
                  <Turnstile
                    siteKey="1x00000000000000000000AA"
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>
              </div>

              {/* 3 Overview feature highlights */}
              <div className="ais-features-grid">
                <div className="ais-feat-card">
                  <div className="ais-feat-icon-box">
                    <Server size={18} />
                  </div>
                  <div>
                    <div className="ais-feat-title">Technical Accessibility</div>
                    <div className="ais-feat-desc">Checks HTTP 200 codes, HTTPS enforcement, Canonical consistency, and robots.txt.</div>
                  </div>
                </div>

                <div className="ais-feat-card">
                  <div className="ais-feat-icon-box">
                    <Compass size={18} />
                  </div>
                  <div>
                    <div className="ais-feat-title">AI Discoverability</div>
                    <div className="ais-feat-desc">Audits XML sitemap discovery, internal crawl pathways, and ecosystem files like llms.txt.</div>
                  </div>
                </div>

                <div className="ais-feat-card">
                  <div className="ais-feat-icon-box">
                    <Code2 size={18} />
                  </div>
                  <div>
                    <div className="ais-feat-title">Structured Data</div>
                    <div className="ais-feat-desc">Validates Schema.org JSON-LD schemas so search AI models can accurately extract your entities.</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== 2. PROGRESS / SCANNING VIEW ==================== */}
        {(status === 'queued' || status === 'analyzing') && (
          <div className="ais-progress-screen">
            <div className="ais-pulse-ring-wrap">
              <div className="ais-pulse-circle"></div>
              <div className="ais-pulse-icon">
                <Loader2 size={30} className="ais-spin" />
              </div>
            </div>

            <h3 className="ais-progress-title">
              {status === 'queued' ? 'Initializing Edge Scanner...' : 'Auditing Website & AI Readiness...'}
            </h3>
            <span className="ais-target-mono">{url}</span>

            {/* Progress bar */}
            <div className="ais-progress-bar-wrap">
              <div
                className="ais-progress-bar-inner"
                style={{
                  width: `${Math.max(15, Math.min(95, ((progress.scanned + 1) / 10) * 100))}%`,
                }}
              ></div>
            </div>

            {/* Live stats */}
            <div className="ais-live-stats-row">
              <div className="ais-live-stat-box">
                <div className="ais-live-stat-num">{progress.scanned} / 10</div>
                <div className="ais-live-stat-lbl">Pages Crawled</div>
              </div>
              <div className="ais-live-stat-box">
                <div className="ais-live-stat-num">{progress.discovered}</div>
                <div className="ais-live-stat-lbl">Discovered URLs</div>
              </div>
              <div className="ais-live-stat-box">
                <div className="ais-live-stat-num">Level 2</div>
                <div className="ais-live-stat-lbl">Crawl Depth</div>
              </div>
            </div>

            {/* Steps checklist */}
            <div className="ais-steps-list">
              <div className="ais-step-item completed">
                <CheckCircle2 size={16} color="#10b981" />
                <span>Target URL validation & SSRF security check</span>
              </div>
              <div className={`ais-step-item ${status === 'analyzing' ? 'completed' : 'active'}`}>
                {status === 'analyzing' ? (
                  <CheckCircle2 size={16} color="#10b981" />
                ) : (
                  <Loader2 size={16} className="ais-spin" />
                )}
                <span>Discovering robots.txt & XML sitemaps</span>
              </div>
              <div className={`ais-step-item ${status === 'analyzing' ? 'active' : ''}`}>
                {progress.scanned >= 10 ? (
                  <CheckCircle2 size={16} color="#10b981" />
                ) : (
                  <Loader2 size={16} className="ais-spin" />
                )}
                <span>Bounded HTML page crawler (up to 10 pages)</span>
              </div>
              <div className="ais-step-item">
                <Info size={16} />
                <span>Deterministic scoring & AI search signal evaluation</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. SCAN FAILED VIEW ==================== */}
        {status === 'failed' && (
          <div className="ais-progress-screen">
            <div className="ais-pulse-ring-wrap">
              <div
                className="ais-pulse-icon"
                style={{ background: '#ef4444', color: '#ffffff' }}
              >
                <AlertTriangle size={30} />
              </div>
            </div>

            <h3 className="ais-progress-title">Scan Could Not Be Completed</h3>
            <span className="ais-target-mono">{url}</span>

            <div className="ais-alert-error" style={{ maxWidth: '540px', margin: '0 auto 24px auto' }}>
              <AlertCircle size={20} className="ais-alert-icon" />
              <div>
                <strong>Reason: </strong>
                {error || 'Unable to fetch target URL. Ensure the site is publicly accessible and does not block automated crawlers.'}
              </div>
            </div>

            <button
              onClick={() => {
                try { sessionStorage.removeItem('tooltive_ais_scan_id'); } catch {}
                setScanId(null);
                setStatus('idle');
                setError(null);
              }}
              className="ais-btn-submit"
              style={{ width: 'auto', padding: '12px 28px' }}
            >
              <RotateCcw size={16} />
              Try Another URL
            </button>
          </div>
        )}

        {/* ==================== 4. REPORT COMPLETE VIEW ==================== */}
        {status === 'completed' && report && (
          <div className="ais-report-container">
            {/* Topbar navigation & actions */}
            <div className="ais-report-topbar">
              <div className="ais-report-meta">
                <span className="ais-tag">
                  <CheckCircle2 size={13} />
                  Basic Scan Complete
                </span>
                <span className="ais-url-badge">
                  {url}
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                    <ExternalLink size={13} />
                  </a>
                </span>
              </div>

              <div className="ais-btn-group-actions">
                <button
                  type="button"
                  className="ais-btn-secondary"
                  onClick={handleCopySummary}
                >
                  {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
                  {copied ? 'Copied!' : 'Copy Summary'}
                </button>
                <button
                  type="button"
                  className="ais-btn-secondary"
                  onClick={() => window.print()}
                >
                  <Printer size={15} />
                  Print / Export
                </button>
                <button
                  type="button"
                  className="ais-btn-secondary"
                  onClick={() => {
                    try { sessionStorage.removeItem('tooltive_ais_scan_id'); } catch {}
                    setStatus('idle');
                    setUrl('');
                    setReport(null);
                    setScanId(null);
                  }}
                >
                  <RotateCcw size={15} />
                  Scan Another Site
                </button>
              </div>
            </div>

            {/* Executive Hero Score Banner */}
            <div className="ais-hero-score-banner">
              <div className="ais-gauge-box">
                <div
                  className="ais-score-circle"
                  style={{ borderColor: getScoreTier(report.score).color }}
                >
                  <span
                    className="ais-score-number"
                    style={{ color: getScoreTier(report.score).color }}
                  >
                    {report.score}
                  </span>
                  <span className="ais-score-max">out of 100</span>
                </div>
                <span className={`ais-score-tier-badge ${getScoreTier(report.score).class}`}>
                  {getScoreTier(report.score).label}
                </span>
              </div>

              <div className="ais-hero-stats-grid">
                <div className="ais-stat-card">
                  <div className="ais-stat-val">{report.score}/100</div>
                  <div className="ais-stat-name">Overall Score</div>
                </div>
                <div className="ais-stat-card">
                  <div className="ais-stat-val">{progress.scanned || report.pagesSummary?.length || 1}</div>
                  <div className="ais-stat-name">Pages Audited</div>
                </div>
                <div className="ais-stat-card">
                  <div className="ais-stat-val">{report.issues.length}</div>
                  <div className="ais-stat-name">Total Findings</div>
                </div>
                <div className="ais-stat-card">
                  <div
                    className={`ais-stat-val ${
                      report.issues.filter((i) => i.severity === 'critical').length > 0
                        ? 'critical-val'
                        : ''
                    }`}
                  >
                    {report.issues.filter((i) => i.severity === 'critical').length}
                  </div>
                  <div className="ais-stat-name">Critical Blockers</div>
                </div>
              </div>
            </div>

            {/* Category Scores Overview */}
            <div className="ais-categories-section">
              <div className="ais-section-header">
                <h3 className="ais-section-title">
                  <Layers size={18} />
                  Category Breakdown
                </h3>
              </div>

              <div className="ais-cat-grid">
                {Object.entries(report.categoryScores).map(([catKey, catData]) => {
                  const percent =
                    catData.applicable > 0
                      ? Math.round((catData.earned / catData.applicable) * 100)
                      : 100;

                  const friendlyNames: Record<string, string> = {
                    technical: 'Technical Health',
                    security: 'Security & HTTPS',
                    discoverability: 'Discoverability',
                    clarity: 'Content Clarity',
                    linking: 'Internal Links',
                    structured_data: 'Structured Data',
                    ai_org: 'Ecosystem & llms.txt',
                  };

                  return (
                    <div key={catKey} className="ais-cat-card">
                      <div className="ais-cat-card-top">
                        <span className="ais-cat-title">{friendlyNames[catKey] || catKey}</span>
                        <span className="ais-cat-score">{percent}%</span>
                      </div>
                      <div className="ais-cat-progress-track">
                        <div
                          className="ais-cat-progress-bar"
                          style={{
                            width: `${percent}%`,
                            background:
                              percent >= 80 ? '#10b981' : percent >= 50 ? 'var(--color-primary)' : '#ef4444',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tab navigation for Findings vs Pages */}
            <div className="ais-tabs-nav">
              <button
                type="button"
                className={`ais-tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
                onClick={() => setActiveTab('issues')}
              >
                <AlertCircle size={16} />
                Prioritized Issues & Recommendations
                <span className="ais-tab-count">{report.issues.length}</span>
              </button>

              <button
                type="button"
                className={`ais-tab-btn ${activeTab === 'pages' ? 'active' : ''}`}
                onClick={() => setActiveTab('pages')}
              >
                <FileText size={16} />
                Audited Pages
                <span className="ais-tab-count">
                  {report.pagesSummary?.length || progress.scanned || 0}
                </span>
              </button>
            </div>

            {/* TAB CONTENT: ISSUES */}
            {activeTab === 'issues' && (
              <div>
                {/* Filter chips */}
                <div className="ais-filter-row">
                  <button
                    type="button"
                    className={`ais-filter-chip ${severityFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setSeverityFilter('all')}
                  >
                    All Findings ({report.issues.length})
                  </button>
                  <button
                    type="button"
                    className={`ais-filter-chip ${severityFilter === 'critical' ? 'active' : ''}`}
                    onClick={() => setSeverityFilter('critical')}
                  >
                    Critical ({report.issues.filter((i) => i.severity === 'critical').length})
                  </button>
                  <button
                    type="button"
                    className={`ais-filter-chip ${severityFilter === 'important' ? 'active' : ''}`}
                    onClick={() => setSeverityFilter('important')}
                  >
                    Important ({report.issues.filter((i) => i.severity === 'important').length})
                  </button>
                  <button
                    type="button"
                    className={`ais-filter-chip ${severityFilter === 'opportunity' ? 'active' : ''}`}
                    onClick={() => setSeverityFilter('opportunity')}
                  >
                    Opportunities (
                    {report.issues.filter((i) => i.severity === 'opportunity' || i.severity === 'info').length}
                    )
                  </button>
                </div>

                {filteredIssues.length === 0 ? (
                  <div className="ais-clean-box">
                    <div className="ais-clean-icon">
                      <CheckCircle2 size={32} />
                    </div>
                    <div className="ais-clean-title">
                      {severityFilter === 'all' ? 'No Issues Detected!' : `No ${severityFilter} issues found`}
                    </div>
                    <div className="ais-clean-desc">
                      Your website demonstrates healthy technical signals and accessibility for search engine and AI crawlers.
                    </div>
                  </div>
                ) : (
                  <div className="ais-issues-list">
                    {filteredIssues.map((issue, idx) => {
                      const isExpanded = expandedIssues.has(idx);
                      return (
                        <div key={idx} className={`ais-issue-card sev-${issue.severity}`}>
                          <div className="ais-issue-header">
                            <div>
                              <div className="ais-issue-tags">
                                <span className={`ais-pill-sev sev-${issue.severity}`}>
                                  {issue.severity.toUpperCase()}
                                </span>
                                <span className="ais-pill-category">{issue.category}</span>
                              </div>
                              <h4 className="ais-issue-title" style={{ marginTop: '8px' }}>
                                {issue.title}
                              </h4>
                            </div>

                            {issue.pageUrl && (
                              <span className="ais-issue-page-url">
                                {issue.pageUrl}
                              </span>
                            )}
                          </div>

                          {/* 3-Box Diagnostic Grid */}
                          <div className="ais-diag-grid">
                            <div className="ais-diag-col">
                              <span className="ais-diag-label">
                                <Search size={14} /> What We Found
                              </span>
                              <p className="ais-diag-text">{issue.whatFound}</p>
                            </div>

                            <div className="ais-diag-col">
                              <span className="ais-diag-label">
                                <Sparkles size={14} /> Why It Matters for AI Search
                              </span>
                              <p className="ais-diag-text">{issue.whyItMatters}</p>
                            </div>

                            <div className="ais-diag-col">
                              <span className="ais-diag-label">
                                <ArrowRight size={14} /> Recommended Action
                              </span>
                              <p className="ais-diag-text">{issue.recommendation}</p>
                            </div>
                          </div>

                          {issue.evidence && (
                            <div>
                              <button
                                type="button"
                                className="ais-btn-secondary"
                                style={{ fontSize: '12px', padding: '4px 10px' }}
                                onClick={() => toggleIssueEvidence(idx)}
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {isExpanded ? 'Hide Technical Evidence' : 'Show Technical Evidence'}
                              </button>

                              {isExpanded && (
                                <div className="ais-evidence-box">
                                  {typeof issue.evidence === 'string'
                                    ? issue.evidence
                                    : JSON.stringify(issue.evidence, null, 2)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PAGES */}
            {activeTab === 'pages' && (
              <div className="ais-table-container">
                <table className="ais-pages-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>URL</th>
                      <th>Title</th>
                      <th>Word Count</th>
                      <th>Schema Types</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.pagesSummary && report.pagesSummary.length > 0 ? (
                      report.pagesSummary.map((pg, i) => (
                        <tr key={i}>
                          <td>
                            <span
                              className={`ais-status-code-pill ${
                                pg.status === 200 ? 'ais-status-200' : 'ais-status-err'
                              }`}
                            >
                              {pg.status || 200}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: '12.5px' }}>
                            <a
                              href={pg.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                            >
                              {pg.url}
                            </a>
                          </td>
                          <td>{pg.title || <span style={{ color: 'var(--text-muted)' }}>None</span>}</td>
                          <td>~{pg.wordCount} words</td>
                          <td>
                            {pg.schemas && pg.schemas.length > 0 ? (
                              pg.schemas.map((s, si) => (
                                <span key={si} className="ais-schema-badge">
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>None</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                          1 page scanned ({url})
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
