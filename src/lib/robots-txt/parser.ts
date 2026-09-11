import {
  ParsedRobotsTxt,
  RobotsGroup,
  RobotsRule,
  SitemapDirective,
  CrawlDelayDirective,
  UnknownDirective,
  RobotsDiagnostic,
  RobotsParseResult
} from "./types";

/**
 * Parses raw robots.txt content into a structured representation
 * adhering to RFC 9309 and Google's Robots Exclusion Protocol.
 */
export function parseRobotsTxt(raw: string): ParsedRobotsTxt {
  const groups: RobotsGroup[] = [];
  const sitemaps: SitemapDirective[] = [];
  const crawlDelays: CrawlDelayDirective[] = [];
  const unknownDirectives: UnknownDirective[] = [];
  const comments: string[] = [];
  const warnings: RobotsDiagnostic[] = [];
  const errors: RobotsDiagnostic[] = [];

  if (!raw || !raw.trim()) {
    warnings.push({
      severity: "warning",
      code: "EMPTY_FILE",
      message: "The robots.txt file is empty. Search engines will assume full crawl access."
    });
    return {
      groups,
      sitemaps,
      crawlDelays,
      unknownDirectives,
      comments,
      warnings,
      errors,
      raw: raw || "",
      lineCount: 0
    };
  }

  // Split into lines preserving CRLF / LF / CR
  const rawLines = raw.split(/\r\n|\r|\n/);
  const totalLines = rawLines.length;

  let currentGroup: {
    id: string;
    userAgents: string[];
    rules: RobotsRule[];
    lineStart: number;
    hasRules: boolean;
  } | null = null;

  let groupCounter = 0;

  function finalizeCurrentGroup(lineEndNumber: number) {
    if (currentGroup && currentGroup.userAgents.length > 0) {
      groups.push({
        id: currentGroup.id,
        userAgents: [...currentGroup.userAgents],
        rules: [...currentGroup.rules],
        lineStart: currentGroup.lineStart,
        lineEnd: lineEndNumber
      });
    }
    currentGroup = null;
  }

  for (let i = 0; i < totalLines; i++) {
    const lineNumber = i + 1;
    const lineRaw = rawLines[i];

    // Strip inline comments: '#' not inside quotes
    const commentIndex = lineRaw.indexOf("#");
    let content = lineRaw;
    if (commentIndex !== -1) {
      const commentText = lineRaw.slice(commentIndex + 1).trim();
      if (commentText) {
        comments.push(commentText);
      }
      content = lineRaw.slice(0, commentIndex);
    }

    const trimmedContent = content.trim();

    // Skip blank or pure comment lines
    if (!trimmedContent) {
      continue;
    }

    // Directives are separated by ':'
    const colonIndex = trimmedContent.indexOf(":");
    if (colonIndex === -1) {
      // Malformed line with no colon
      warnings.push({
        severity: "warning",
        code: "MALFORMED_LINE",
        message: `Line ${lineNumber} has no colon separating field and value: "${trimmedContent}"`,
        line: lineNumber
      });
      continue;
    }

    const fieldName = trimmedContent.slice(0, colonIndex).trim().toLowerCase();
    const fieldValue = trimmedContent.slice(colonIndex + 1).trim();

    switch (fieldName) {
      case "user-agent": {
        if (!fieldValue) {
          warnings.push({
            severity: "warning",
            code: "INVALID_USER_AGENT",
            message: `Empty User-agent value on line ${lineNumber}.`,
            line: lineNumber
          });
          continue;
        }

        // If the current group already accumulated rules, this starts a brand new group
        if (currentGroup && currentGroup.hasRules) {
          finalizeCurrentGroup(lineNumber - 1);
        }

        // If no group is open, start one
        if (!currentGroup) {
          groupCounter++;
          currentGroup = {
            id: `group-${groupCounter}`,
            userAgents: [fieldValue],
            rules: [],
            lineStart: lineNumber,
            hasRules: false
          };
        } else {
          // Consecutive User-agent lines belong to the same group
          currentGroup.userAgents.push(fieldValue);
        }
        break;
      }

      case "allow":
      case "disallow": {
        const action = fieldName as "allow" | "disallow";

        // RFC 9309: Rules encountered before any User-agent must be ignored for matching
        if (!currentGroup) {
          warnings.push({
            severity: "warning",
            code: "RULE_BEFORE_USER_AGENT",
            message: `Found directive "${action}: ${fieldValue}" before any User-agent declaration on line ${lineNumber}. This rule is ignored.`,
            line: lineNumber
          });
          continue;
        }

        currentGroup.hasRules = true;

        // Empty Disallow: path means allow all (RFC 9309 Section 2.2.1)
        if (action === "disallow" && !fieldValue) {
          currentGroup.rules.push({
            action: "allow", // Semantically equivalent to allow all
            path: "",
            line: lineNumber,
            raw: lineRaw,
            normalizedPath: ""
          });
          continue;
        }

        // Normalize path: ensure leading slash if path is non-empty and lacks one
        let normalizedPath = fieldValue;
        if (normalizedPath && !normalizedPath.startsWith("/") && !normalizedPath.startsWith("*")) {
          normalizedPath = "/" + normalizedPath;
        }

        currentGroup.rules.push({
          action,
          path: fieldValue,
          line: lineNumber,
          raw: lineRaw,
          normalizedPath
        });
        break;
      }

      case "sitemap": {
        // Sitemap is a global directive independent of groups
        const isAbsolute = /^https?:\/\//i.test(fieldValue);
        sitemaps.push({
          url: fieldValue,
          line: lineNumber,
          raw: lineRaw,
          validAbsoluteUrl: isAbsolute
        });

        if (!isAbsolute) {
          warnings.push({
            severity: "warning",
            code: "INVALID_SITEMAP_URL",
            message: `Sitemap URL on line ${lineNumber} must be an absolute URL including protocol (e.g. https://example.com/sitemap.xml).`,
            line: lineNumber
          });
        }
        break;
      }

      case "crawl-delay": {
        const parsedDelay = parseFloat(fieldValue);
        const lastUa = currentGroup?.userAgents[currentGroup.userAgents.length - 1];

        crawlDelays.push({
          value: isNaN(parsedDelay) ? 0 : parsedDelay,
          userAgent: lastUa,
          line: lineNumber,
          raw: lineRaw
        });

        warnings.push({
          severity: "info",
          code: "CRAWL_DELAY_NON_STANDARD",
          message: `Crawl-delay on line ${lineNumber} is non-standard (not supported by Googlebot, though recognized by Bingbot).`,
          line: lineNumber
        });
        break;
      }

      default: {
        // Unknown directive: preserve without crashing
        unknownDirectives.push({
          name: fieldName,
          value: fieldValue,
          line: lineNumber,
          raw: lineRaw
        });

        warnings.push({
          severity: "info",
          code: "UNKNOWN_DIRECTIVE",
          message: `Unrecognized directive "${fieldName}" on line ${lineNumber}.`,
          line: lineNumber
        });
        break;
      }
    }
  }

  // Finalize any trailing group
  finalizeCurrentGroup(totalLines);

  return {
    groups,
    sitemaps,
    crawlDelays,
    unknownDirectives,
    comments,
    warnings,
    errors,
    raw,
    lineCount: totalLines
  };
}

/**
 * Safe wrapper returning a structured result containing diagnostics.
 */
export function parseRobotsTxtSafe(raw: string): RobotsParseResult {
  try {
    const parsed = parseRobotsTxt(raw);
    const diagnostics = [...parsed.errors, ...parsed.warnings];
    return {
      success: parsed.errors.length === 0,
      parsed,
      diagnostics
    };
  } catch (err) {
    const fallbackParsed: ParsedRobotsTxt = {
      groups: [],
      sitemaps: [],
      crawlDelays: [],
      unknownDirectives: [],
      comments: [],
      warnings: [],
      errors: [
        {
          severity: "error",
          code: "MALFORMED_LINE",
          message: err instanceof Error ? err.message : "Failed to parse robots.txt."
        }
      ],
      raw: raw || "",
      lineCount: 0
    };

    return {
      success: false,
      parsed: fallbackParsed,
      diagnostics: fallbackParsed.errors
    };
  }
}
