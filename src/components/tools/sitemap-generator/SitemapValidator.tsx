import React, { useState, useRef } from "react";
import type { DiscoveredUrl, SitemapHealthResult } from "@/lib/sitemap/types";
import { validateAndParseSitemap } from "@/lib/sitemap/validator";
import { Upload, FileCheck } from "lucide-react";

interface SitemapValidatorProps {
  onComplete: (urls: DiscoveredUrl[], health: SitemapHealthResult, baseUrl: string) => void;
}

export default function SitemapValidator({ onComplete }: SitemapValidatorProps) {
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleValidate = () => {
    setError(null);
    if (!inputText.trim()) {
      setError("Please paste XML or upload a file.");
      return;
    }

    const { health, document } = validateAndParseSitemap(inputText);
    
    if (document) {
      const urls = document.type === "urlset" ? (document.urls || []) : [];
      let base = "https://example.com/";
      if (urls.length > 0) {
         try {
            const u = new URL(urls[0].normalizedUrl);
            base = `${u.protocol}//${u.host}/`;
         } catch {}
      }
      onComplete(urls, health, base);
    } else {
      // Just show health results if no valid document could be extracted
      onComplete([], health, "https://example.com/");
    }
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
        <label>Paste Sitemap XML</label>
        <button className="sg-icon-btn" onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} /> Upload .xml
        </button>
        <input 
          type="file" 
          accept=".xml,application/xml,text/xml" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          onChange={handleFileUpload} 
        />
      </div>
      
      <textarea
        className="sg-textarea code-font"
        placeholder={'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">...'}
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        rows={10}
      />
      
      {error && <div className="sg-error-msg">{error}</div>}
      
      <div className="sg-actions">
        <button className="sg-primary-btn" onClick={handleValidate}>
          <FileCheck size={16} /> Validate XML
        </button>
      </div>
    </div>
  );
}
