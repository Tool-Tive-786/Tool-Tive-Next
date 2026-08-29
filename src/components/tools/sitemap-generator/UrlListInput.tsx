import React, { useState, useRef } from "react";
import { processUrlList } from "@/lib/sitemap/url";
import type { DiscoveredUrl } from "@/lib/sitemap/types";
import { Upload, FileText, CheckCircle2 } from "lucide-react";

interface UrlListInputProps {
  onComplete: (urls: DiscoveredUrl[], baseUrl: string) => void;
}

export default function UrlListInput({ onComplete }: UrlListInputProps) {
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = () => {
    setError(null);
    const rawList = inputText.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    if (rawList.length === 0) {
      setError("Please enter at least one URL.");
      return;
    }

    const results = processUrlList(rawList, { removeTrackingParams: true });
    
    if (results.valid.length === 0) {
      setError(`Found ${results.invalid} invalid URLs. Please provide valid HTTP/HTTPS URLs.`);
      return;
    }

    const discoveredUrls: DiscoveredUrl[] = results.valid.map(v => ({
      url: v.raw,
      normalizedUrl: v.normalized,
      decision: "included",
      source: "user-input"
    }));

    // Try to guess a base URL for filename resolution (sitemap-index)
    let base = "https://example.com/";
    try {
      const u = new URL(discoveredUrls[0].normalizedUrl);
      base = `${u.protocol}//${u.host}/`;
    } catch {}

    onComplete(discoveredUrls, base);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === "string") {
        setInputText(text);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="sg-input-panel">
      <div className="sg-input-header">
        <label>Enter URLs (one per line)</label>
        <button className="sg-icon-btn" onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} /> Upload .txt
        </button>
        <input 
          type="file" 
          accept=".txt,text/plain" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          onChange={handleFileUpload} 
        />
      </div>
      
      <textarea
        className="sg-textarea"
        placeholder="https://example.com/&#10;https://example.com/about"
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        rows={10}
      />
      
      {error && <div className="sg-error-msg">{error}</div>}
      
      <div className="sg-actions">
        <button className="sg-primary-btn" onClick={handleProcess}>
          <FileText size={16} /> Generate Sitemap
        </button>
      </div>
    </div>
  );
}
