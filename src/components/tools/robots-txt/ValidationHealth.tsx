"use client";

import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Info,
  AlertTriangle,
  Layers,
  FileText,
  Globe
} from "lucide-react";
import { RobotsValidationResult } from "@/lib/robots-txt";

interface ValidationHealthProps {
  validation: RobotsValidationResult;
}

export default function ValidationHealth({ validation }: ValidationHealthProps) {
  const { stats, errors, warnings, info, isValid } = validation;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12
        }}
      >
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          <Layers size={20} color="var(--accent)" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              {stats.groupCount}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              User-Agent Groups
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          <FileText size={20} color="var(--accent)" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              {stats.ruleCount}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              Active Rules
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          <Globe size={20} color="var(--accent)" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              {stats.sitemapCount}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              Sitemaps
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          {isValid ? (
            <ShieldCheck size={20} color="#10b981" />
          ) : (
            <ShieldAlert size={20} color="#ef4444" />
          )}
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: isValid ? "#34d399" : "#f87171"
              }}
            >
              {errors.length > 0
                ? `${errors.length} Error${errors.length > 1 ? "s" : ""}`
                : warnings.length > 0
                ? `${warnings.length} Warning${warnings.length > 1 ? "s" : ""}`
                : "RFC 9309 Valid"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              Health Status
            </div>
          </div>
        </div>
      </div>

      {/* Clean Valid Message if no warnings/errors */}
      {errors.length === 0 && warnings.length === 0 && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "var(--radius-md)",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 13,
            color: "#34d399"
          }}
        >
          <ShieldCheck size={18} />
          <span>
            <strong>Excellent!</strong> No syntax errors, conflicts, or broad blocking risks detected.
          </span>
        </div>
      )}

      {/* Diagnostics List */}
      {(errors.length > 0 || warnings.length > 0 || info.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {errors.map((err, idx) => (
            <div
              key={`err-${idx}`}
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12
              }}
            >
              <ShieldAlert size={18} color="#f87171" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 13, flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                  <span className="robots-diag-pill error">Error</span>
                  {err.line && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Line {err.line}
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--text-primary)" }}>{err.message}</div>
              </div>
            </div>
          ))}

          {warnings.map((warn, idx) => (
            <div
              key={`warn-${idx}`}
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12
              }}
            >
              <AlertTriangle size={18} color="#fbbf24" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 13, flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                  <span className="robots-diag-pill warning">Warning</span>
                  {warn.line && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Line {warn.line}
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--text-primary)" }}>{warn.message}</div>
              </div>
            </div>
          ))}

          {info.map((inf, idx) => (
            <div
              key={`info-${idx}`}
              style={{
                background: "rgba(59, 130, 246, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12
              }}
            >
              <Info size={18} color="#60a5fa" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 13, flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                  <span className="robots-diag-pill info">Notice</span>
                  {inf.line && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Line {inf.line}
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--text-secondary)" }}>{inf.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
