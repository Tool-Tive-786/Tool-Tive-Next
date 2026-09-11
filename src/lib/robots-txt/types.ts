/**
 * ToolTive — Robots.txt Engine Types
 * 
 * Strict type definitions for parsing, matching, validating,
 * and generating robots.txt exclusion rules in accordance with
 * RFC 9309 and Google's Robots Exclusion Protocol interpretation.
 */

export type DirectiveType =
  | "user-agent"
  | "allow"
  | "disallow"
  | "sitemap"
  | "crawl-delay"
  | "unknown"
  | "comment"
  | "empty";

export type RuleAction = "allow" | "disallow";

export interface SourceLocation {
  line: number;
  raw: string;
}

export interface RobotsRule {
  action: RuleAction;
  path: string;
  line: number;
  raw: string;
  normalizedPath: string;
}

export interface RobotsGroup {
  id: string;
  userAgents: string[];
  rules: RobotsRule[];
  lineStart: number;
  lineEnd: number;
}

export interface SitemapDirective {
  url: string;
  line: number;
  raw: string;
  validAbsoluteUrl: boolean;
}

export interface CrawlDelayDirective {
  value: number;
  userAgent?: string;
  line: number;
  raw: string;
}

export interface UnknownDirective {
  name: string;
  value: string;
  line: number;
  raw: string;
}

export type DiagnosticSeverity = "info" | "warning" | "error";

export type DiagnosticCode =
  | "EMPTY_FILE"
  | "NO_USER_AGENT_GROUP"
  | "RULE_BEFORE_USER_AGENT"
  | "INVALID_USER_AGENT"
  | "EMPTY_DISALLOW"
  | "DISALLOW_ROOT"
  | "DUPLICATE_RULE"
  | "DUPLICATE_USER_AGENT"
  | "MULTIPLE_MATCHING_GROUPS"
  | "NO_WILDCARD_GROUP"
  | "DUPLICATE_SITEMAP"
  | "INVALID_SITEMAP_URL"
  | "UNKNOWN_DIRECTIVE"
  | "CRAWL_DELAY_NON_STANDARD"
  | "MALFORMED_LINE"
  | "POSSIBLE_CONFLICT"
  | "SUSPICIOUS_PATH"
  | "POSSIBLE_ENCODING_ISSUE";

export interface RobotsDiagnostic {
  severity: DiagnosticSeverity;
  code: DiagnosticCode;
  message: string;
  line?: number;
  relatedLines?: number[];
}

export interface ParsedRobotsTxt {
  groups: RobotsGroup[];
  sitemaps: SitemapDirective[];
  crawlDelays: CrawlDelayDirective[];
  unknownDirectives: UnknownDirective[];
  comments: string[];
  warnings: RobotsDiagnostic[];
  errors: RobotsDiagnostic[];
  raw: string;
  lineCount: number;
}

export interface RobotsParseResult {
  success: boolean;
  parsed: ParsedRobotsTxt;
  diagnostics: RobotsDiagnostic[];
}

export type RobotsAccessDecision = "allowed" | "blocked";

export type MatchReason =
  | "robots_txt_implicit_allow"
  | "no_matching_group"
  | "wildcard_group"
  | "no_matching_rule"
  | "allow_rule"
  | "disallow_rule"
  | "most_specific_rule"
  | "equal_specificity_allow";

export interface CandidateRule {
  action: RuleAction;
  path: string;
  line: number;
  matchLength: number;
}

export interface RobotsMatchResult {
  decision: RobotsAccessDecision;
  crawlerToken: string;
  matchedGroupIds: string[];
  matchedRule?: {
    action: RuleAction;
    path: string;
    line: number;
  };
  candidateRules: CandidateRule[];
  reason: MatchReason;
  normalizedPath: string;
  matchedAt?: number;
}

export interface RobotsValidationStats {
  groupCount: number;
  ruleCount: number;
  sitemapCount: number;
  hasWildcardGroup: boolean;
  hasRootDisallow: boolean;
}

export interface RobotsValidationResult {
  isValid: boolean;
  diagnostics: RobotsDiagnostic[];
  errors: RobotsDiagnostic[];
  warnings: RobotsDiagnostic[];
  info: RobotsDiagnostic[];
  stats: RobotsValidationStats;
}

export interface RobotsGeneratorGroup {
  userAgents: string[];
  rules: Array<{
    action: RuleAction;
    path: string;
  }>;
}

export interface RobotsGeneratorInput {
  groups: RobotsGeneratorGroup[];
  sitemaps?: string[];
  preserveComments?: boolean;
  headerComment?: string;
}

export interface CrawlerPreset {
  id: string;
  label: string;
  productToken: string;
  category: "search" | "ai" | "generic" | "custom";
  description: string;
}

export interface SecurityValidationResult {
  safe: boolean;
  url: string;
  error?: string;
  normalizedUrl?: string;
  host?: string;
}
