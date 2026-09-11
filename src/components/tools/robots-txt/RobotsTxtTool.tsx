"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import RobotsModeTabs, { RobotsToolMode } from "./RobotsModeTabs";
import GeneratorPanel from "./GeneratorPanel";
import TesterPanel from "./TesterPanel";
import RobotsPreview from "./RobotsPreview";
import { ROBOTS_TEMPLATES, RobotsTemplate } from "./TemplatePresets";
import {
  RobotsGeneratorGroup,
  generateRobotsTxt,
  parseRobotsTxt,
  validateRobotsTxt
} from "@/lib/robots-txt";
import "@/styles/robots-txt.css";

const DEFAULT_GROUPS: RobotsGeneratorGroup[] = [
  {
    userAgents: ["*"],
    rules: [
      { action: "allow", path: "/" },
      { action: "disallow", path: "/admin/" },
      { action: "disallow", path: "/private/" },
      { action: "disallow", path: "/api/" }
    ]
  }
];

const DEFAULT_SITEMAPS = ["https://example.com/sitemap.xml"];

export default function RobotsTxtTool() {
  const [activeMode, setActiveMode] = useState<RobotsToolMode>("generator");
  const [groups, setGroups] = useState<RobotsGeneratorGroup[]>(DEFAULT_GROUPS);
  const [sitemaps, setSitemaps] = useState<string[]>(DEFAULT_SITEMAPS);
  const [rawContent, setRawContent] = useState<string>("");

  // When raw content is replaced outside the generator (tester edit, upload,
  // live fetch, reset, template), the next regeneration effect must not
  // immediately overwrite it with output derived from the old group state.
  const suppressRegenRef = useRef(false);

  // Replace raw content and re-derive generator state so the visual editor
  // always corresponds to the current rawContent (no stale groups).
  const applyExternalContent = (content: string) => {
    suppressRegenRef.current = true;
    setRawContent(content);
    const parsed = parseRobotsTxt(content);
    setGroups(
      parsed.groups.map((g) => ({
        userAgents: [...new Set(g.userAgents)],
        rules: g.rules.map((r) => ({ action: r.action, path: r.path }))
      }))
    );
    setSitemaps(parsed.sitemaps.map((s) => s.url));
  };

  // Sync groups & sitemaps to rawContent whenever generator inputs change
  useEffect(() => {
    if (suppressRegenRef.current) {
      suppressRegenRef.current = false;
      return;
    }
    const generated = generateRobotsTxt({
      groups,
      sitemaps,
      headerComment: "Generated with ToolTive Free Robots.txt Generator & Tester (https://tooltive.com)"
    });
    setRawContent(generated);
  }, [groups, sitemaps]);

  // Validation state
  const validation = useMemo(() => {
    const parsed = parseRobotsTxt(rawContent);
    return validateRobotsTxt(parsed);
  }, [rawContent]);

  // Apply template
  const handleApplyTemplate = (template: RobotsTemplate) => {
    // Load the template verbatim and re-derive generator state from it so the
    // visual editor and the editor content stay consistent.
    applyExternalContent(template.content);
    setActiveMode("generator");
  };

  return (
    <div className="container robots-tool-container">
      <div className="robots-card">
        {/* Navigation Tabs */}
        <RobotsModeTabs
          activeMode={activeMode}
          onChange={setActiveMode}
          errorCount={validation.errors.length}
          warningCount={validation.warnings.length}
        />

        {/* Tab 1: Visual Generator */}
        {activeMode === "generator" && (
          <div className="robots-tab-content">
            <div className="robots-dual-grid">
              <GeneratorPanel
                groups={groups}
                sitemaps={sitemaps}
                onChangeGroups={setGroups}
                onChangeSitemaps={setSitemaps}
              />
              <div>
                <div style={{ position: "sticky", top: "100px" }}>
                  <RobotsPreview content={rawContent} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: URL Tester & Auditor */}
        {activeMode === "tester" && (
          <div className="robots-tab-content">
            <TesterPanel
              rawContent={rawContent}
              onChangeContent={(updated) => setRawContent(updated)}
            />
          </div>
        )}

        {/* Tab 3: Presets & Templates */}
        {activeMode === "templates" && (
          <div className="robots-tab-content">
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                Pre-Configured Architecture Presets
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                Click any template to immediately load proven, production-tested robots.txt rules into your editor and generator.
              </p>
            </div>

            <div className="robots-templates-grid">
              {ROBOTS_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="robots-template-card"
                >
                  <div>
                    <span className="robots-template-badge">{tmpl.badge}</span>
                    <div className="robots-template-title">{tmpl.title}</div>
                    <div className="robots-template-desc">{tmpl.description}</div>
                  </div>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "8px 16px", fontSize: 13, alignSelf: "flex-start" }}
                    onClick={() => handleApplyTemplate(tmpl)}
                  >
                    Apply Template →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
