import React, { useState, useEffect } from "react";
import type { DiscoveredUrl } from "@/lib/sitemap/types";
import { buildSitemaps, SitemapGenerationResult } from "@/lib/sitemap/xml-serializer";
import { validateAndParseSitemap } from "@/lib/sitemap/validator";
import { Copy, Download, Archive, Check, ShieldAlert } from "lucide-react";
import JSZip from "jszip";

interface PreviewAndDownloadProps {
  urls: DiscoveredUrl[];
  baseUrl: string;
}

export default function PreviewAndDownload({ urls, baseUrl }: PreviewAndDownloadProps) {
  const [sitemapData, setSitemapData] = useState<SitemapGenerationResult | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate sitemaps whenever URLs change
    if (urls.length > 0) {
       const result = buildSitemaps(urls, baseUrl);
       setSitemapData(result);
       
       // Final Safety Validation Step
       if (result.files.length > 0) {
         const validationResult = validateAndParseSitemap(result.files[0].content, baseUrl);
         const hasFatalError = validationResult.health.issues.some(i => i.severity === "Error");
         
         if (hasFatalError) {
           setIsValidated(false);
           setValidationError("Final XML validation failed. The generated sitemap is structurally invalid or contains illegal URLs.");
         } else {
           setIsValidated(true);
           setValidationError(null);
         }
       }
    }
  }, [urls, baseUrl]);

  if (!sitemapData || sitemapData.files.length === 0) return null;

  // Preview the first file (usually the index or the single sitemap)
  const previewFile = sitemapData.files[sitemapData.files.length - 1]; 
  const previewText = previewFile.content.substring(0, 1000) + (previewFile.content.length > 1000 ? "\n... (truncated)" : "");

  const handleCopy = async () => {
    if (!isValidated) return;
    await navigator.clipboard.writeText(sitemapData.files[0].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!isValidated) return;
    if (sitemapData.isSplit) {
      handleDownloadZip();
    } else {
      const blob = new Blob([sitemapData.files[0].content], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sitemap.xml";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    sitemapData.files.forEach(f => {
      zip.file(f.filename, f.content);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemaps.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sg-preview-panel">
      <div className="sg-preview-header">
        <h3>{sitemapData.isSplit ? "Sitemap Index Preview" : "Sitemap Preview"}</h3>
        <div className="sg-preview-actions">
          {!sitemapData.isSplit && (
            <button className="sg-icon-btn" onClick={handleCopy} disabled={!isValidated}>
              {copied ? <Check size={16} /> : <Copy size={16} />} 
              {copied ? "Copied" : "Copy"}
            </button>
          )}
          <button className="sg-primary-btn" onClick={handleDownload} disabled={!isValidated}>
            {sitemapData.isSplit ? <><Archive size={16} /> Download ZIP</> : <><Download size={16} /> Download XML</>}
          </button>
        </div>
      </div>
      
      {validationError && (
        <div className="sg-split-notice" style={{ backgroundColor: "#fef2f2", color: "#991b1b", borderLeft: "4px solid #dc2626" }}>
          <ShieldAlert size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          <strong>Validation Error:</strong> {validationError}
        </div>
      )}

      {sitemapData.isSplit && !validationError && (
         <div className="sg-split-notice">
            Your sitemap exceeds the limits (50k URLs or 50MB) and has been automatically split into {sitemapData.files.length - 1} files plus a sitemap index. Download the ZIP file to get all of them.
         </div>
      )}

      <pre className="sg-xml-preview code-font">
        <code>{previewText}</code>
      </pre>
    </div>
  );
}
