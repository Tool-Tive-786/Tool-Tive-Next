import {
  ParsedRobotsTxt,
  RobotsGroup,
  RobotsRule,
  RobotsMatchResult,
  CandidateRule,
  MatchReason,
  RobotsAccessDecision
} from "./types";

/**
 * Normalizes an input URL or path into a comparable URI path and query string.
 * 
 * Preserves case sensitivity and decodes unreserved percent-encoded octets
 * (RFC 3986 / RFC 9309 Section 2.2.2) while maintaining reserved characters encoded.
 */
export function normalizeMatchTarget(urlOrPath: string): string {
  let rawPath = urlOrPath.trim();

  // If full URL provided, extract pathname and search query
  if (/^https?:\/\//i.test(rawPath)) {
    try {
      const parsed = new URL(rawPath);
      rawPath = parsed.pathname + (parsed.search || "");
    } catch {
      // Fallback if URL parsing fails
      const slashIndex = rawPath.indexOf("/", rawPath.indexOf("://") + 3);
      rawPath = slashIndex !== -1 ? rawPath.slice(slashIndex) : "/";
    }
  }

  // Ensure leading slash
  if (!rawPath.startsWith("/")) {
    rawPath = "/" + rawPath;
  }

  // Decode only unreserved percent-encoded characters (A-Z, a-z, 0-9, '-', '_', '.', '~')
  return normalizePercentEncoding(rawPath);
}

/**
 * Decodes unreserved percent-encoded characters while keeping reserved characters
 * (like %2F for '/', %2A for '*', %3F for '?', %24 for '$') intact.
 * Normalizes uppercase hex characters.
 */
export function normalizePercentEncoding(str: string): string {
  return str.replace(/%([0-9a-fA-F]{2})/g, (match, hex) => {
    const code = parseInt(hex, 16);
    // Unreserved characters:
    // 0-9 (48-57), A-Z (65-90), a-z (97-122), '-' (45), '.' (46), '_' (95), '~' (126)
    if (
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122) ||
      code === 45 ||
      code === 46 ||
      code === 95 ||
      code === 126
    ) {
      return String.fromCharCode(code);
    }
    // Reserved characters stay percent-encoded with normalized uppercase hex
    return "%" + hex.toUpperCase();
  });
}

/**
 * Tests whether a robots.txt path pattern matches a target URL path.
 * 
 * Implements prefix matching, wildcard '*' handling, and end-anchor '$' handling.
 */
export function doesPathMatch(pattern: string, targetPath: string): boolean {
  // Empty pattern matches nothing
  if (!pattern) return false;

  const normalizedPattern = normalizePercentEncoding(pattern);

  // Check if pattern has an end-anchor '$' at the very end
  const hasEndAnchor = normalizedPattern.endsWith("$");
  const cleanPattern = hasEndAnchor
    ? normalizedPattern.slice(0, -1)
    : normalizedPattern;

  // Split pattern on wildcard '*'
  const segments = cleanPattern.split("*");

  // Build a safe regular expression
  // Escape regex special chars: ^ + ? . ( ) { } | [ ] \
  const escapeRegex = (s: string) => s.replace(/[\^.+?(){}|[\]\\]/g, "\\$&");

  let regexStr = "^";
  for (let i = 0; i < segments.length; i++) {
    if (i > 0) {
      regexStr += ".*";
    }
    regexStr += escapeRegex(segments[i]);
  }

  if (hasEndAnchor) {
    regexStr += "$";
  }

  try {
    const regex = new RegExp(regexStr);
    return regex.test(targetPath);
  } catch {
    return false;
  }
}

/**
 * Calculates rule match specificity (octet/character length) according to RFC 9309.
 */
export function calculateMatchSpecificity(rulePath: string): number {
  if (!rulePath) return 0;
  // Specificity is based on the length of the pattern in octets/characters
  return normalizePercentEncoding(rulePath).length;
}

/**
 * Finds all groups that match a specific crawler token (case-insensitive).
 */
export function selectApplicableGroups(
  groups: RobotsGroup[],
  crawlerToken: string
): { groups: RobotsGroup[]; isWildcard: boolean } {
  const token = crawlerToken.trim().toLowerCase();

  // 1. Try to find groups explicitly targeting this crawler token
  if (token && token !== "*") {
    const matchingSpecific = groups.filter((g) =>
      g.userAgents.some((ua) => ua.trim().toLowerCase() === token)
    );

    if (matchingSpecific.length > 0) {
      return { groups: matchingSpecific, isWildcard: false };
    }
  }

  // 2. Fall back to wildcard '*' groups
  const wildcardGroups = groups.filter((g) =>
    g.userAgents.some((ua) => ua.trim() === "*")
  );

  if (wildcardGroups.length > 0) {
    return { groups: wildcardGroups, isWildcard: true };
  }

  // 3. No applicable groups
  return { groups: [], isWildcard: false };
}

/**
 * Matches a URL or path against parsed robots.txt directives using RFC 9309
 * and Google's Robots Exclusion Protocol specifications.
 */
export function matchRobotsUrl(
  parsed: ParsedRobotsTxt,
  urlOrPath: string,
  crawlerToken = "*"
): RobotsMatchResult {
  const targetPath = normalizeMatchTarget(urlOrPath);

  // RFC 9309 Section 2.1: /robots.txt is implicitly allowed for all crawlers
  const isRobotsTxtPath =
    targetPath === "/robots.txt" ||
    targetPath.startsWith("/robots.txt?") ||
    targetPath.startsWith("/robots.txt#");

  if (isRobotsTxtPath) {
    return {
      decision: "allowed",
      crawlerToken,
      matchedGroupIds: [],
      candidateRules: [],
      reason: "robots_txt_implicit_allow",
      normalizedPath: targetPath,
      matchedAt: Date.now()
    };
  }

  // Select matching groups (merging multiple groups if multiple match the same crawler)
  const { groups: applicableGroups, isWildcard } = selectApplicableGroups(
    parsed.groups,
    crawlerToken
  );

  // If no group matches (and no wildcard group exists), access is allowed by default
  if (applicableGroups.length === 0) {
    return {
      decision: "allowed",
      crawlerToken,
      matchedGroupIds: [],
      candidateRules: [],
      reason: "no_matching_group",
      normalizedPath: targetPath,
      matchedAt: Date.now()
    };
  }

  const matchedGroupIds = applicableGroups.map((g) => g.id);

  // Collect and evaluate all candidate rules from all applicable groups
  const candidateRules: CandidateRule[] = [];

  for (const group of applicableGroups) {
    for (const rule of group.rules) {
      // Empty path in Disallow is an explicit allow all
      if (rule.path === "") {
        if (rule.action === "allow") {
          candidateRules.push({
            action: "allow",
            path: "",
            line: rule.line,
            matchLength: 0
          });
        }
        continue;
      }

      if (doesPathMatch(rule.normalizedPath, targetPath)) {
        candidateRules.push({
          action: rule.action,
          path: rule.path,
          line: rule.line,
          matchLength: calculateMatchSpecificity(rule.normalizedPath)
        });
      }
    }
  }

  // If no rules matched the target path within the group:
  if (candidateRules.length === 0) {
    return {
      decision: "allowed",
      crawlerToken,
      matchedGroupIds,
      candidateRules: [],
      reason: isWildcard ? "wildcard_group" : "no_matching_rule",
      normalizedPath: targetPath,
      matchedAt: Date.now()
    };
  }

  // Sort candidate rules by specificity:
  // 1. Longest match length first (most specific rule wins)
  // 2. If equal specificity, Allow takes precedence over Disallow (Google & RFC 9309)
  candidateRules.sort((a, b) => {
    if (b.matchLength !== a.matchLength) {
      return b.matchLength - a.matchLength;
    }
    // If lengths are equal: 'allow' comes before 'disallow'
    if (a.action === "allow" && b.action === "disallow") return -1;
    if (a.action === "disallow" && b.action === "allow") return 1;
    // Otherwise preserve line appearance order
    return a.line - b.line;
  });

  const winningRule = candidateRules[0];

  // Check if there was an equal-specificity conflict between allow and disallow
  const equalConflict =
    winningRule.action === "allow" &&
    candidateRules.some(
      (c) => c.action === "disallow" && c.matchLength === winningRule.matchLength
    );

  let reason: MatchReason;
  if (equalConflict) {
    reason = "equal_specificity_allow";
  } else if (candidateRules.length > 1) {
    reason = "most_specific_rule";
  } else {
    reason = winningRule.action === "allow" ? "allow_rule" : "disallow_rule";
  }

  const decision: RobotsAccessDecision =
    winningRule.action === "allow" ? "allowed" : "blocked";

  return {
    decision,
    crawlerToken,
    matchedGroupIds,
    matchedRule: {
      action: winningRule.action,
      path: winningRule.path,
      line: winningRule.line
    },
    candidateRules,
    reason,
    normalizedPath: targetPath,
    matchedAt: Date.now()
  };
}
