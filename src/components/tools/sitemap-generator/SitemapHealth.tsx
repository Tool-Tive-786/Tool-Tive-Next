import React from "react";
import type { SitemapHealthResult } from "@/lib/sitemap/types";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

interface SitemapHealthProps {
  health: SitemapHealthResult;
}

export default function SitemapHealth({ health }: SitemapHealthProps) {
  const getScoreColor = () => {
    if (health.score >= 90) return "score-excellent";
    if (health.score >= 70) return "score-good";
    if (health.score >= 50) return "score-needs-improvement";
    return "score-critical";
  };

  return (
    <div className="sg-health-panel">
      <div className="sg-health-header">
        <div className={`sg-health-score ${getScoreColor()}`}>
          <div className="sg-score-value">{health.score}</div>
          <div className="sg-score-label">{health.label}</div>
        </div>
        <div className="sg-health-summary">
          <h3>Sitemap Diagnostics</h3>
          <p>We found {health.issues.length} issue(s) that might affect SEO performance.</p>
        </div>
      </div>
      
      {health.issues.length > 0 ? (
        <div className="sg-health-issues">
          {health.issues.map((issue, idx) => (
            <div key={idx} className={`sg-issue-item ${issue.severity.toLowerCase()}`}>
              <div className="sg-issue-icon">
                {issue.severity === "Critical" && <AlertCircle size={18} />}
                {issue.severity === "Error" && <AlertCircle size={18} />}
                {issue.severity === "Warning" && <AlertTriangle size={18} />}
                {issue.severity === "Info" && <Info size={18} />}
              </div>
              <div className="sg-issue-content">
                <div className="sg-issue-message">
                  <strong>{issue.severity}:</strong> {issue.message}
                </div>
                {issue.suggestion && (
                  <div className="sg-issue-suggestion">{issue.suggestion}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="sg-health-perfect">
          <CheckCircle2 size={24} />
          <span>Perfect! No SEO issues found in this sitemap.</span>
        </div>
      )}
    </div>
  );
}
