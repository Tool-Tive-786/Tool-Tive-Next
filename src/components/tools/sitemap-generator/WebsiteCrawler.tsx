import React, { useState, useRef, useEffect } from "react";
import type { DiscoveredUrl } from "@/lib/sitemap/types";
import { normalizeUrl, isValidUrl } from "@/lib/sitemap/url";
import { Globe, Play, Square, Loader2 } from "lucide-react";
import type { CrawlResult } from "@/lib/sitemap/crawler";

interface WebsiteCrawlerProps {
  onComplete: (urls: DiscoveredUrl[], baseUrl: string) => void;
}

export default function WebsiteCrawler({ onComplete }: WebsiteCrawlerProps) {
  const [seedUrl, setSeedUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const [isCrawling, setIsCrawling] = useState(false);
  const [progress, setProgress] = useState({ crawled: 0, queued: 0, found: 0 });
  
  // State for the crawl session
  const sessionRef = useRef<{
    queue: string[];
    visited: Set<string>;
    results: DiscoveredUrl[];
    isPaused: boolean;
    batchSize: number;
    origin: string;
  }>({
    queue: [],
    visited: new Set(),
    results: [],
    isPaused: false,
    batchSize: 5,
    origin: ""
  });

  const startCrawl = async () => {
    setError(null);
    if (!seedUrl || !isValidUrl(seedUrl)) {
      setError("Please enter a valid start URL (e.g., https://example.com)");
      return;
    }

    const normalizedSeed = normalizeUrl(seedUrl);
    if (!normalizedSeed) return;

    try {
      const u = new URL(normalizedSeed);
      sessionRef.current.origin = `${u.protocol}//${u.host}`;
    } catch {
      setError("Invalid origin");
      return;
    }

    setIsCrawling(true);
    sessionRef.current.isPaused = false;
    sessionRef.current.queue = [normalizedSeed];
    sessionRef.current.visited = new Set();
    sessionRef.current.results = [];
    setProgress({ crawled: 0, queued: 1, found: 0 });
    
    // Start loop
    crawlLoop();
  };

  const stopCrawl = () => {
    sessionRef.current.isPaused = true;
    setIsCrawling(false);
    onComplete(sessionRef.current.results, sessionRef.current.origin + "/");
  };

  const crawlLoop = async () => {
    const s = sessionRef.current;
    if (s.isPaused || s.queue.length === 0) {
      if (s.queue.length === 0) {
        setIsCrawling(false);
        onComplete(s.results, s.origin + "/");
      }
      return;
    }

    // Dequeue batch
    const batch = s.queue.splice(0, s.batchSize);
    batch.forEach(url => s.visited.add(url));

    try {
      const res = await fetch("/api/sitemap/crawl-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: batch, origin: s.origin })
      });

      if (res.ok) {
        const data = await res.json();
        const crawlResults: CrawlResult[] = data.results || [];

        for (const cr of crawlResults) {
          if (!cr) continue;
          
          let decision: "included" | "excluded" | "needs_review" = "included";
          let reason: any = undefined;

          if (cr.status >= 300 && cr.status < 400) {
            decision = "excluded";
            reason = "redirect";
            // Queue finalUrl if it exists and hasn't been visited
            if (cr.finalUrl && !s.visited.has(cr.finalUrl) && !s.queue.includes(cr.finalUrl)) {
              s.queue.push(cr.finalUrl);
            }
          } else if (cr.status >= 400 && cr.status < 500) {
            decision = "excluded";
            reason = "not_found";
          } else if (cr.status >= 500) {
            decision = "excluded";
            reason = "server_error";
          } else if (cr.noindex) {
            decision = "excluded";
            reason = "noindex";
          } else if (cr.canonicalStatus === "mismatch") {
            decision = "needs_review";
            reason = "non_canonical";
          }

          // Add to results
          s.results.push({
            url: cr.url,
            normalizedUrl: cr.normalizedUrl,
            status: cr.status,
            contentType: cr.contentType,
            finalUrl: cr.finalUrl,
            canonicalUrl: cr.canonicalUrl,
            canonicalStatus: cr.canonicalStatus,
            noindex: cr.noindex,
            lastModified: cr.lastModified,
            decision,
            exclusionReason: reason,
            source: s.results.length === 0 ? "seed" : "internal-link"
          });

          // Queue new links
          for (const link of cr.internalLinks) {
            if (!s.visited.has(link) && !s.queue.includes(link)) {
              s.queue.push(link);
            }
          }
        }
      }
    } catch (err) {
      console.error("Batch error", err);
    }

    setProgress({
      crawled: s.visited.size,
      queued: s.queue.length,
      found: s.results.length
    });

    // Continue loop
    if (!s.isPaused) {
      setTimeout(crawlLoop, 500); // 500ms delay between batches for politeness
    }
  };

  return (
    <div className="sg-input-panel">
      <div className="sg-input-header">
        <label>Start URL (Homepage)</label>
      </div>
      
      <input
        type="url"
        className="sg-input-field"
        placeholder="https://example.com"
        value={seedUrl}
        onChange={e => setSeedUrl(e.target.value)}
        disabled={isCrawling}
      />
      
      {error && <div className="sg-error-msg">{error}</div>}
      
      {!isCrawling ? (
        <div className="sg-actions">
          <button className="sg-primary-btn" onClick={startCrawl}>
            <Play size={16} /> Start Crawl
          </button>
        </div>
      ) : (
        <div className="sg-crawl-progress">
          <div className="sg-progress-stats">
            <div><strong>{progress.crawled}</strong> Crawled</div>
            <div><strong>{progress.queued}</strong> Queued</div>
            <div><strong>{progress.found}</strong> Found</div>
          </div>
          <div className="sg-actions">
            <button className="sg-secondary-btn" onClick={stopCrawl}>
               <Square size={16} /> Stop & Generate
            </button>
            <div className="sg-loader"><Loader2 size={16} className="spin" /></div>
          </div>
        </div>
      )}
    </div>
  );
}
