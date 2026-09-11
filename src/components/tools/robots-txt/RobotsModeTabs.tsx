"use client";

import React from "react";
import { Sliders, ShieldCheck, Sparkles } from "lucide-react";

export type RobotsToolMode = "generator" | "tester" | "templates";

interface RobotsModeTabsProps {
  activeMode: RobotsToolMode;
  onChange: (mode: RobotsToolMode) => void;
  errorCount?: number;
  warningCount?: number;
}

export default function RobotsModeTabs({
  activeMode,
  onChange,
  errorCount = 0,
  warningCount = 0
}: RobotsModeTabsProps) {
  const modes: Array<{
    id: RobotsToolMode;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: "generator",
      label: "Visual Generator",
      icon: <Sliders size={18} />
    },
    {
      id: "tester",
      label: "URL Tester & Audit",
      icon: <ShieldCheck size={18} />,
      badge:
        errorCount > 0
          ? `${errorCount} error${errorCount > 1 ? "s" : ""}`
          : warningCount > 0
          ? `${warningCount} warning${warningCount > 1 ? "s" : ""}`
          : undefined
    },
    {
      id: "templates",
      label: "Presets & Templates",
      icon: <Sparkles size={18} />
    }
  ];

  return (
    <div className="robots-tabs" role="tablist">
      {modes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          role="tab"
          aria-selected={activeMode === mode.id}
          className={`robots-tab-btn ${activeMode === mode.id ? "active" : ""}`}
          onClick={() => onChange(mode.id)}
        >
          {mode.icon}
          <span>{mode.label}</span>
          {mode.badge && (
            <span
              className={`robots-diag-pill ${
                errorCount > 0 ? "error" : "warning"
              }`}
              style={{ marginLeft: 6, fontSize: 10, padding: "2px 6px" }}
            >
              {mode.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
