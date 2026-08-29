import React from "react";
import type { DiscoveredUrl, UrlDecision } from "@/lib/sitemap/types";
import { Check, X, AlertTriangle, AlertCircle } from "lucide-react";

interface ResultsTableProps {
  urls: DiscoveredUrl[];
  onDecisionChange: (url: string, decision: UrlDecision) => void;
}

export default function ResultsTable({ urls, onDecisionChange }: ResultsTableProps) {
  const formatStatus = (url: DiscoveredUrl) => {
    if (url.status && url.status >= 300 && url.status < 400) return <span className="sg-badge warning">{url.status} Redirect</span>;
    if (url.status && url.status >= 400) return <span className="sg-badge error">{url.status}</span>;
    if (url.status === 200) return <span className="sg-badge success">200 OK</span>;
    return <span className="sg-badge default">Parsed</span>;
  };

  const formatRobots = (url: DiscoveredUrl) => {
    if (url.exclusionReason === "robots_blocked") return <span className="sg-badge error">Blocked</span>;
    return <span className="sg-badge success">Allowed</span>;
  };

  const formatIndexability = (url: DiscoveredUrl) => {
    if (url.noindex) return <span className="sg-badge error">Noindex</span>;
    if (url.status === 200 && url.canonicalStatus !== "mismatch") return <span className="sg-badge success">Indexable</span>;
    return <span className="sg-badge warning">Review</span>;
  };

  const getReasonLabel = (reason?: string) => {
    if (!reason) return "—";
    const map: Record<string, string> = {
      redirect: "Redirected",
      not_found: "Not found (404)",
      server_error: "Server Error",
      noindex: "Noindex Tag",
      non_canonical: "Canonical Mismatch",
      robots_blocked: "Blocked by robots.txt"
    };
    return map[reason] || reason;
  };

  return (
    <div className="sg-table-wrapper">
      <div className="sg-table-header" style={{ gridTemplateColumns: '100px 300px 200px 150px 100px 100px 150px 150px' }}>
        <div>Decision</div>
        <div>URL</div>
        <div>Final URL</div>
        <div>Canonical</div>
        <div>Status</div>
        <div>Robots</div>
        <div>Indexability</div>
        <div>Reason</div>
      </div>
      <div className="sg-table-body">
        {urls.map((item, idx) => (
          <div key={idx} className={`sg-table-row ${item.decision === 'excluded' ? "excluded" : ""}`} style={{ gridTemplateColumns: '100px 300px 200px 150px 100px 100px 150px 150px' }}>
            <div>
              <select 
                value={item.decision} 
                onChange={(e) => onDecisionChange(item.url, e.target.value as UrlDecision)}
                className="sg-decision-select"
              >
                <option value="included">Included</option>
                <option value="excluded">Excluded</option>
                <option value="needs_review">Review</option>
              </select>
            </div>
            <div>
              <div className="sg-url-text" title={item.normalizedUrl}>{item.normalizedUrl}</div>
            </div>
            <div>
              <div className="sg-url-text" title={item.finalUrl || "—"}>{item.finalUrl || "—"}</div>
            </div>
            <div>
               {item.canonicalStatus === "mismatch" ? (
                  <span className="sg-badge warning" title={item.canonicalUrl}>Mismatch</span>
               ) : item.canonicalStatus === "match" ? (
                  <span className="sg-badge success">Match</span>
               ) : (
                  <span className="sg-badge default">Missing</span>
               )}
            </div>
            <div>
              {formatStatus(item)}
            </div>
            <div>
              {formatRobots(item)}
            </div>
            <div>
              {formatIndexability(item)}
            </div>
            <div className="sg-reason-col">
              {item.exclusionReason ? (
                <>
                  <AlertCircle size={14} className="sg-reason-icon" />
                  <span title={item.exclusionReason}>{getReasonLabel(item.exclusionReason)}</span>
                </>
              ) : "—"}
            </div>
          </div>
        ))}
      </div>
      <div className="sg-table-footer">
        Showing {urls.length} URLs ({urls.filter(u => u.decision === "included").length} included)
      </div>
    </div>
  );
}
