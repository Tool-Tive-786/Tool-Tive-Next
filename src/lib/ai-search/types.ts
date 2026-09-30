export type ScanMode = 'basic' | 'deep';
export type ScanStatus = 'queued' | 'analyzing' | 'completed' | 'failed';

export interface ScanState {
  id: string;
  rootUrl: string;
  mode: ScanMode;
  status: ScanStatus;
  stage?: string;
  pagesDiscovered: number;
  pagesScanned: number;
  maxPages: number;
  currentUrl?: string;
  error?: string;
  score?: number;
}

export type IssueSeverity = 'critical' | 'important' | 'opportunity' | 'info';

export interface ScanIssue {
  code: string;
  category: string;
  severity: IssueSeverity;
  pageUrl?: string;
  title: string;
  whatFound: string;
  whyItMatters: string;
  recommendation: string;
  evidence: any;
}

export interface ExtractedPageSignals {
  url: string;
  status: number;
  https: boolean;
  redirects: string[];
  canonical?: string;
  title?: string;
  h1s: string[];
  metaDescription?: string;
  robotsMeta?: string;
  internalLinksCount: number;
  internalLinks: string[];
  externalLinksCount: number;
  headings: { level: number; text: string }[];
  textLength: number;
  schemas: string[];
  hasMalformedSchema?: boolean;
  malformedSchemaDetails?: Array<{ snippet: string; error: string }>;
  headers: Record<string, string>;
  cookieSignals?: {
    hasCookies: boolean;
    allSecure: boolean;
    allHttpOnly: boolean;
    hasSameSite: boolean;
  };
  hasMixedContent: boolean;
  hasActiveMixedContent?: boolean;
  hasPassiveMixedContent?: boolean;
  isJsRenderedShell?: boolean;
  sitemapIncluded?: boolean;
  robotsAllowed?: boolean;
}

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
}

export interface StartScanRequest {
  mode: ScanMode;
  url: string;
  turnstileToken?: string;
}

export interface StartScanResponse {
  scanId: string;
  mode: ScanMode;
  status: ScanStatus;
  quota: QuotaStatus;
  error?: string;
}

export interface ProgressResponse {
  scanId: string;
  status: ScanStatus;
  stage?: string;
  pagesDiscovered: number;
  pagesScanned: number;
  maxPages: number;
  currentUrl?: string;
  error?: string;
}
