export type UrlDiscoverySource =
  | "seed"
  | "internal-link"
  | "existing-sitemap"
  | "robots-sitemap"
  | "user-input";

export type ExclusionReason =
  | "duplicate"
  | "normalized_duplicate"
  | "redirect"
  | "redirect_loop"
  | "not_found"
  | "gone"
  | "server_error"
  | "timeout"
  | "network_error"
  | "robots_blocked"
  | "noindex"
  | "invalid_url"
  | "external_url"
  | "unsupported_content_type"
  | "non_canonical";

export type UrlDecision = "included" | "excluded" | "needs_review";

export interface DiscoveredUrl {
  url: string;
  normalizedUrl: string;

  status?: number;
  contentType?: string;

  finalUrl?: string;
  redirectChain?: string[];

  canonicalUrl?: string;
  canonicalStatus?: "match" | "mismatch" | "missing";

  robotsAllowed?: boolean;
  noindex?: boolean;

  lastModified?: string;

  source?: UrlDiscoverySource;

  decision: UrlDecision;
  exclusionReason?: ExclusionReason;
}

export interface SitemapDocument {
  type: "urlset" | "sitemapindex";
  urls?: DiscoveredUrl[];
  sitemapFiles?: string[];
}

export interface SitemapIssue {
  severity: "Critical" | "Error" | "Warning" | "Info";
  message: string;
  suggestion?: string;
  count?: number;
}

export interface SitemapHealthResult {
  score: number;
  label: "Excellent" | "Good" | "Needs Improvement" | "Critical";
  issues: SitemapIssue[];
}
