import {
  ParsedRobotsTxt,
  RobotsDiagnostic,
  RobotsValidationResult,
  RobotsValidationStats
} from "./types";

/**
 * Validates parsed robots.txt directives for RFC 9309 compliance,
 * syntax consistency, duplicate rules, and critical SEO crawl risks.
 */
export function validateRobotsTxt(parsed: ParsedRobotsTxt): RobotsValidationResult {
  const diagnostics: RobotsDiagnostic[] = [
    ...parsed.errors,
    ...parsed.warnings
  ];

  let ruleCount = 0;
  let hasWildcardGroup = false;
  let hasRootDisallow = false;

  // 1. Check for empty file
  if (parsed.groups.length === 0 && parsed.sitemaps.length === 0) {
    if (!diagnostics.some(d => d.code === "EMPTY_FILE")) {
      diagnostics.push({
        severity: "warning",
        code: "EMPTY_FILE",
        message: "No rules or user-agents found. Search engines assume complete site crawl access."
      });
    }
  }

  // 2. Check for missing User-agent group when directives exist
  if (parsed.groups.length === 0 && parsed.lineCount > 0) {
    diagnostics.push({
      severity: "error",
      code: "NO_USER_AGENT_GROUP",
      message: "The robots.txt file contains no User-agent groups."
    });
  }

  // Track user-agents across all groups to detect multiple matching groups
  const userAgentToGroupsMap = new Map<string, number[]>();

  // 3. Inspect Groups
  for (let gIdx = 0; gIdx < parsed.groups.length; gIdx++) {
    const group = parsed.groups[gIdx];
    const groupNum = gIdx + 1;

    // Check user-agents within this group
    const seenUasInGroup = new Set<string>();

    for (const ua of group.userAgents) {
      const trimmedUa = ua.trim();
      const lowerUa = trimmedUa.toLowerCase();

      if (trimmedUa === "*") {
        hasWildcardGroup = true;
      }

      // Check duplicate user-agents within same group
      if (seenUasInGroup.has(lowerUa)) {
        diagnostics.push({
          severity: "warning",
          code: "DUPLICATE_USER_AGENT",
          message: `User-agent "${trimmedUa}" is declared multiple times in Group ${groupNum}.`,
          line: group.lineStart
        });
      }
      seenUasInGroup.add(lowerUa);

      // Track across all groups
      const groupList = userAgentToGroupsMap.get(lowerUa) || [];
      groupList.push(groupNum);
      userAgentToGroupsMap.set(lowerUa, groupList);
    }

    // Check rules within this group
    const seenRulesInGroup = new Map<string, number>(); // "action:path" -> line

    for (const rule of group.rules) {
      ruleCount++;

      // Check for Disallow: / (blocks entire site)
      if (rule.action === "disallow" && (rule.path === "/" || rule.normalizedPath === "/")) {
        hasRootDisallow = true;
        const appliesTo = group.userAgents.join(", ");
        diagnostics.push({
          severity: "warning",
          code: "DISALLOW_ROOT",
          message: `Group ${groupNum} (${appliesTo}) contains "Disallow: /", which instructs crawlers to block the entire website.`,
          line: rule.line
        });
      }

      // Check for empty Disallow
      if (rule.action === "allow" && rule.path === "") {
        diagnostics.push({
          severity: "info",
          code: "EMPTY_DISALLOW",
          message: `Empty "Disallow:" directive on line ${rule.line} grants unrestricted crawl access for this group.`,
          line: rule.line
        });
      }

      // Check for missing leading slash or unencoded spaces
      if (rule.path && !rule.path.startsWith("/") && !rule.path.startsWith("*")) {
        diagnostics.push({
          severity: "warning",
          code: "SUSPICIOUS_PATH",
          message: `Rule path "${rule.path}" on line ${rule.line} does not start with a leading slash ('/').`,
          line: rule.line
        });
      }

      if (rule.path && rule.path.includes(" ")) {
        diagnostics.push({
          severity: "warning",
          code: "SUSPICIOUS_PATH",
          message: `Rule path "${rule.path}" on line ${rule.line} contains an unencoded space. Consider using '%20'.`,
          line: rule.line
        });
      }

      // Duplicate rule check within same group
      const ruleKey = `${rule.action}:${rule.path}`;
      if (seenRulesInGroup.has(ruleKey)) {
        diagnostics.push({
          severity: "warning",
          code: "DUPLICATE_RULE",
          message: `Duplicate rule "${rule.action}: ${rule.path}" on line ${rule.line} (already declared on line ${seenRulesInGroup.get(ruleKey)}).`,
          line: rule.line,
          relatedLines: [seenRulesInGroup.get(ruleKey)!]
        });
      } else {
        seenRulesInGroup.set(ruleKey, rule.line);
      }

      // Conflict check: check if opposite rule with exact same path exists
      const oppositeAction = rule.action === "allow" ? "disallow" : "allow";
      const oppositeKey = `${oppositeAction}:${rule.path}`;
      if (seenRulesInGroup.has(oppositeKey)) {
        diagnostics.push({
          severity: "warning",
          code: "POSSIBLE_CONFLICT",
          message: `Conflicting rules "${rule.action}: ${rule.path}" and "${oppositeAction}: ${rule.path}" in Group ${groupNum}. Under standard Google rules, Allow will prevail.`,
          line: rule.line,
          relatedLines: [seenRulesInGroup.get(oppositeKey)!]
        });
      }
    }
  }

  // 4. Check for multiple matching groups targeting the same user-agent
  userAgentToGroupsMap.forEach((groupsList, ua) => {
    if (groupsList.length > 1) {
      diagnostics.push({
        severity: "info",
        code: "MULTIPLE_MATCHING_GROUPS",
        message: `User-agent "${ua}" is declared across multiple separate groups (${groupsList.map(g => `Group ${g}`).join(", ")}). Their directives will be merged during matching.`
      });
    }
  });

  // 5. Check for absence of wildcard '*' group
  if (parsed.groups.length > 0 && !hasWildcardGroup) {
    diagnostics.push({
      severity: "warning",
      code: "NO_WILDCARD_GROUP",
      message: "No fallback 'User-agent: *' group found. Crawlers without specific user-agent blocks will assume unrestricted access."
    });
  }

  // 6. Check Sitemap duplicates & valid absolute URLs
  const seenSitemaps = new Set<string>();
  for (const sitemap of parsed.sitemaps) {
    const cleanUrl = sitemap.url.trim().toLowerCase();
    if (seenSitemaps.has(cleanUrl)) {
      diagnostics.push({
        severity: "warning",
        code: "DUPLICATE_SITEMAP",
        message: `Duplicate Sitemap URL on line ${sitemap.line}: "${sitemap.url}".`,
        line: sitemap.line
      });
    } else {
      seenSitemaps.add(cleanUrl);
    }
  }

  // Group diagnostics by severity
  const errors = diagnostics.filter(d => d.severity === "error");
  const warnings = diagnostics.filter(d => d.severity === "warning");
  const info = diagnostics.filter(d => d.severity === "info");

  const stats: RobotsValidationStats = {
    groupCount: parsed.groups.length,
    ruleCount,
    sitemapCount: parsed.sitemaps.length,
    hasWildcardGroup,
    hasRootDisallow
  };

  return {
    isValid: errors.length === 0,
    diagnostics,
    errors,
    warnings,
    info,
    stats
  };
}
