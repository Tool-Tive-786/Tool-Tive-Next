import React from "react";
import type { ToolMode } from "./SitemapToolClient";
import { Link, Globe, ShieldCheck } from "lucide-react";

interface ModeTabsProps {
  activeMode: ToolMode;
  onChange: (mode: ToolMode) => void;
}

export default function ModeTabs({ activeMode, onChange }: ModeTabsProps) {
  const modes: { id: ToolMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "url-list", label: "From URL List", icon: <Link size={18} />, desc: "Paste list of URLs" },
    { id: "crawl", label: "Crawl Website", icon: <Globe size={18} />, desc: "Auto discover pages" },
    { id: "validate", label: "Validate Sitemap", icon: <ShieldCheck size={18} />, desc: "Check existing XML" }
  ];

  return (
    <div className="sg-tabs">
      {modes.map(m => (
        <button
          key={m.id}
          className={`sg-tab-btn ${activeMode === m.id ? "active" : ""}`}
          onClick={() => onChange(m.id)}
          title={m.desc}
        >
          {m.icon}
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}
