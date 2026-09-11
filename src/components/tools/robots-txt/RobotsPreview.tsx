"use client";

import React, { useState } from "react";
import { Copy, Check, Download, FileCode } from "lucide-react";

interface RobotsPreviewProps {
  content: string;
}

export default function RobotsPreview({ content }: RobotsPreviewProps) {
  const [copied, setCopied] = useState(false);

  const lines = content.split("\n");
  const lineCount = lines.length;
  const charCount = content.length;

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "robots.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="robots-preview-box">
      <div className="robots-preview-header">
        <div className="robots-preview-title">
          <FileCode size={16} color="var(--accent)" />
          <span>robots.txt Live Output</span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginLeft: 8,
              fontWeight: 400
            }}
          >
            {lineCount} lines · {charCount} chars
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopy}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              borderRadius: "var(--radius-sm)"
            }}
            title="Copy robots.txt to clipboard"
          >
            {copied ? (
              <>
                <Check size={14} color="#10b981" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleDownload}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              borderRadius: "var(--radius-sm)"
            }}
            title="Download robots.txt file"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>

      <pre className="robots-preview-code">
        <code>{content || "# Your generated robots.txt will appear here..."}</code>
      </pre>
    </div>
  );
}
