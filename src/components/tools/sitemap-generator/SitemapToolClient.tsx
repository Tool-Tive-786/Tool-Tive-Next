import React, { useState } from "react";
import ModeTabs from "./ModeTabs";
import UrlListInput from "./UrlListInput";
import WebsiteCrawler from "./WebsiteCrawler";
import SitemapValidator from "./SitemapValidator";
import ResultsTable from "./ResultsTable";
import PreviewAndDownload from "./PreviewAndDownload";
import SitemapHealth from "./SitemapHealth";
import type { DiscoveredUrl, SitemapHealthResult, UrlDecision } from "@/lib/sitemap/types";

export type ToolMode = "url-list" | "crawl" | "validate";

export default function SitemapToolClient() {
  const [activeMode, setActiveMode] = useState<ToolMode>("url-list");
  
  const [urls, setUrls] = useState<DiscoveredUrl[]>([]);
  const [health, setHealth] = useState<SitemapHealthResult | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>("https://example.com/");

  const handleModeChange = (mode: ToolMode) => {
    setActiveMode(mode);
    setUrls([]);
    setHealth(null);
  };

  const handleDecisionChange = (urlStr: string, decision: UrlDecision) => {
    setUrls(prev => prev.map(u => {
      if (u.url === urlStr) {
        // Warn if overriding an excluded URL manually
        if (decision === "included" && u.exclusionReason) {
           alert("Warning: You are adding a URL that this tool does not recommend for the sitemap.");
        }
        return { ...u, decision };
      }
      return u;
    }));
  };

  const hasData = urls.length > 0 || health !== null;

  return (
    <div className="sitemap-generator-container">
      <div className="sg-config-panel">
        <ModeTabs activeMode={activeMode} onChange={handleModeChange} />
        
        <div className="sg-mode-content">
          {activeMode === "url-list" && (
            <UrlListInput onComplete={(data, base) => { setUrls(data); setBaseUrl(base); setHealth(null); }} />
          )}
          
          {activeMode === "crawl" && (
            <WebsiteCrawler onComplete={(data, base) => { setUrls(data); setBaseUrl(base); setHealth(null); }} />
          )}
          
          {activeMode === "validate" && (
            <SitemapValidator onComplete={(parsedUrls, healthResult, base) => {
               setUrls(parsedUrls);
               setHealth(healthResult);
               setBaseUrl(base);
            }} />
          )}
        </div>
      </div>

      {hasData && (
        <div className="sg-results-panel">
          {health && <SitemapHealth health={health} />}
          
          {urls.length > 0 && (
             <div className="sg-table-container">
                <ResultsTable urls={urls} onDecisionChange={handleDecisionChange} />
             </div>
          )}

          {urls.length > 0 && (
             <PreviewAndDownload urls={urls} baseUrl={baseUrl} />
          )}
        </div>
      )}
    </div>
  );
}
