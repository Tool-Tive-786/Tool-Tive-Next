"use client";

import React, { useState } from "react";
import { Plus, Trash2, Globe, Bot, Shield, PlusCircle } from "lucide-react";
import { RobotsGeneratorGroup, RuleAction } from "@/lib/robots-txt";

interface GeneratorPanelProps {
  groups: RobotsGeneratorGroup[];
  sitemaps: string[];
  onChangeGroups: (groups: RobotsGeneratorGroup[]) => void;
  onChangeSitemaps: (sitemaps: string[]) => void;
}

const COMMON_UA_PRESETS = [
  { label: "All Bots (*)", token: "*" },
  { label: "Googlebot", token: "Googlebot" },
  { label: "Bingbot", token: "Bingbot" },
  { label: "GPTBot", token: "GPTBot" },
  { label: "ClaudeBot", token: "ClaudeBot" },
  { label: "PerplexityBot", token: "PerplexityBot" }
];

const COMMON_PATHS = [
  "/admin/",
  "/private/",
  "/api/",
  "/wp-admin/",
  "/cart/",
  "/login",
  "/*.pdf$",
  "/"
];

export default function GeneratorPanel({
  groups,
  sitemaps,
  onChangeGroups,
  onChangeSitemaps
}: GeneratorPanelProps) {
  const [newSitemapUrl, setNewSitemapUrl] = useState("");

  // Add a new empty group
  const handleAddGroup = () => {
    onChangeGroups([
      ...groups,
      {
        userAgents: ["*"],
        rules: [
          { action: "allow", path: "/" },
          { action: "disallow", path: "/admin/" }
        ]
      }
    ]);
  };

  // Remove a group
  const handleRemoveGroup = (index: number) => {
    if (groups.length <= 1) return;
    onChangeGroups(groups.filter((_, i) => i !== index));
  };

  // Add a UA to a group
  const handleAddUaToGroup = (groupIdx: number, token: string) => {
    const cleanToken = token.trim();
    if (!cleanToken) return;

    onChangeGroups(
      groups.map((group, idx) => {
        if (idx !== groupIdx) return group;
        if (group.userAgents.includes(cleanToken)) return group;
        return {
          ...group,
          userAgents: [...group.userAgents, cleanToken]
        };
      })
    );
  };

  // Remove UA from group
  const handleRemoveUaFromGroup = (groupIdx: number, token: string) => {
    onChangeGroups(
      groups.map((group, idx) => {
        if (idx !== groupIdx) return group;
        const filtered = group.userAgents.filter((ua) => ua !== token);
        return {
          ...group,
          userAgents: filtered.length > 0 ? filtered : ["*"]
        };
      })
    );
  };

  // Add rule to a group
  const handleAddRule = (groupIdx: number, action: RuleAction = "disallow", path = "") => {
    onChangeGroups(
      groups.map((group, idx) => {
        if (idx !== groupIdx) return group;
        return {
          ...group,
          rules: [...group.rules, { action, path }]
        };
      })
    );
  };

  // Update rule in a group
  const handleUpdateRule = (
    groupIdx: number,
    ruleIdx: number,
    patch: Partial<{ action: RuleAction; path: string }>
  ) => {
    onChangeGroups(
      groups.map((group, gIdx) => {
        if (gIdx !== groupIdx) return group;
        return {
          ...group,
          rules: group.rules.map((rule, rIdx) => {
            if (rIdx !== ruleIdx) return rule;
            return { ...rule, ...patch };
          })
        };
      })
    );
  };

  // Remove rule from a group
  const handleRemoveRule = (groupIdx: number, ruleIdx: number) => {
    onChangeGroups(
      groups.map((group, gIdx) => {
        if (gIdx !== groupIdx) return group;
        return {
          ...group,
          rules: group.rules.filter((_, rIdx) => rIdx !== ruleIdx)
        };
      })
    );
  };

  // Sitemaps handlers
  const handleAddSitemap = () => {
    const trimmed = newSitemapUrl.trim();
    if (!trimmed) return;
    if (!sitemaps.includes(trimmed)) {
      onChangeSitemaps([...sitemaps, trimmed]);
    }
    setNewSitemapUrl("");
  };

  const handleRemoveSitemap = (index: number) => {
    onChangeSitemaps(sitemaps.filter((_, i) => i !== index));
  };

  const handleUpdateSitemap = (index: number, url: string) => {
    onChangeSitemaps(sitemaps.map((s, i) => (i === index ? url : s)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Groups List */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
            User-Agent Directives
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleAddGroup}
            style={{ fontSize: 12, padding: "6px 14px" }}
          >
            <Plus size={14} />
            <span>Add Group</span>
          </button>
        </div>

        {groups.map((group, groupIdx) => (
          <div key={`group-${groupIdx}`} className="robots-group-box">
            <div className="robots-group-header">
              <div className="robots-group-title">
                <Bot size={18} />
                <span>Group {groupIdx + 1}</span>
                <span className="robots-group-tag">
                  {group.userAgents.join(", ")}
                </span>
              </div>

              {groups.length > 1 && (
                <button
                  type="button"
                  className="robots-del-btn"
                  onClick={() => handleRemoveGroup(groupIdx)}
                  title="Remove this group"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* User Agents Chips */}
            <div style={{ marginBottom: 16 }}>
              <div className="robots-label" style={{ marginBottom: 6 }}>
                Target Crawlers (User-Agents):
              </div>
              <div className="robots-ua-chips">
                {group.userAgents.map((ua) => (
                  <span key={ua} className="robots-ua-chip">
                    <strong>{ua}</strong>
                    {group.userAgents.length > 1 && (
                      <button
                        type="button"
                        className="robots-ua-chip-remove"
                        onClick={() => handleRemoveUaFromGroup(groupIdx, ua)}
                        title="Remove user-agent"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Add UA Presets & Custom Input */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Add crawler:</span>
                {COMMON_UA_PRESETS.map((preset) => {
                  const alreadyAdded = group.userAgents.includes(preset.token);
                  if (alreadyAdded) return null;
                  return (
                    <button
                      key={preset.token}
                      type="button"
                      className="robots-chip-btn"
                      onClick={() => handleAddUaToGroup(groupIdx, preset.token)}
                    >
                      + {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rules in this group */}
            <div>
              <div className="robots-label" style={{ marginBottom: 8 }}>
                <span>Rules:</span>
                <button
                  type="button"
                  className="robots-chip-btn"
                  onClick={() => handleAddRule(groupIdx, "disallow", "/")}
                  style={{ color: "var(--accent)" }}
                >
                  <PlusCircle size={12} style={{ display: "inline", marginRight: 4 }} />
                  Add Directive
                </button>
              </div>

              {group.rules.map((rule, ruleIdx) => (
                <div key={`rule-${ruleIdx}`} className="robots-rule-row">
                  <button
                    type="button"
                    className={`robots-action-toggle ${rule.action}`}
                    onClick={() =>
                      handleUpdateRule(groupIdx, ruleIdx, {
                        action: rule.action === "disallow" ? "allow" : "disallow"
                      })
                    }
                    title="Click to toggle Allow / Disallow"
                  >
                    {rule.action.toUpperCase()}
                  </button>

                  <input
                    type="text"
                    className="robots-input"
                    value={rule.path}
                    placeholder="/path-to-restrict/ or /"
                    aria-label={`${rule.action} path for rule ${ruleIdx + 1}`}
                    onChange={(e) =>
                      handleUpdateRule(groupIdx, ruleIdx, { path: e.target.value })
                    }
                  />

                  <button
                    type="button"
                    className="robots-del-btn"
                    onClick={() => handleRemoveRule(groupIdx, ruleIdx)}
                    title="Delete rule"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Quick Path Insertion Chips */}
              <div className="robots-quick-chips">
                <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>
                  Quick Paths:
                </span>
                {COMMON_PATHS.map((path) => (
                  <button
                    key={path}
                    type="button"
                    className="robots-chip-btn"
                    onClick={() => handleAddRule(groupIdx, "disallow", path)}
                  >
                    + Disallow {path}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sitemaps Section */}
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
          <span>XML Sitemap Declarations</span>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
          Declare your XML sitemap URLs so web crawlers discover your indexed pages efficiently.
        </p>

        {sitemaps.map((sitemap, idx) => (
          <div key={`sitemap-${idx}`} className="robots-rule-row">
            <input
              type="url"
              className="robots-input"
              value={sitemap}
              aria-label={`Sitemap URL ${idx + 1}`}
              onChange={(e) => handleUpdateSitemap(idx, e.target.value)}
            />
            <button
              type="button"
              className="robots-del-btn"
              onClick={() => handleRemoveSitemap(idx)}
              title="Remove Sitemap"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input
            type="url"
            className="robots-input"
            placeholder="https://example.com/sitemap.xml"
            value={newSitemapUrl}
            onChange={(e) => setNewSitemapUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSitemap();
              }
            }}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={handleAddSitemap}
            style={{ padding: "8px 18px", fontSize: 13, whiteSpace: "nowrap" }}
          >
            Add Sitemap
          </button>
        </div>
      </div>
    </div>
  );
}
