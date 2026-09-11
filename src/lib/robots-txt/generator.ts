import { RobotsGeneratorInput } from "./types";

/**
 * Strips dangerous control characters (e.g. null bytes, CR, backspaces)
 * while preserving valid Unicode and printable characters.
 */
function sanitizeDirectiveValue(val: string): string {
  if (!val) return "";
  // Remove control characters (0x00 - 0x1F except none, plus 0x7F - 0x9F)
  return val.replace(/[\x00-\x1F\x7F-\x9F]/g, "").trim();
}

/**
 * Deterministically generates standard RFC 9309 robots.txt content
 * from structured group and sitemap configurations.
 */
export function generateRobotsTxt(input: RobotsGeneratorInput): string {
  const parts: string[] = [];

  // Optional custom or default header comment
  if (input.headerComment) {
    const sanitizedHeader = input.headerComment
      .split(/\r?\n/)
      .map((line) => {
        const clean = sanitizeDirectiveValue(line);
        return clean.startsWith("#") ? clean : `# ${clean}`;
      })
      .join("\n");

    if (sanitizedHeader) {
      parts.push(sanitizedHeader);
    }
  }

  // Generate User-agent groups
  const groupBlocks: string[] = [];

  for (const group of input.groups) {
    const lines: string[] = [];

    // Filter and sanitize user-agents
    const validUserAgents = (group.userAgents || [])
      .map(sanitizeDirectiveValue)
      .filter((ua) => ua.length > 0);

    // Skip groups with no user-agents
    if (validUserAgents.length === 0) {
      continue;
    }

    for (const ua of validUserAgents) {
      lines.push(`User-agent: ${ua}`);
    }

    // Process and sort/order rules: Disallow first, then Allow, or preserve given order
    for (const rule of group.rules || []) {
      const cleanPath = sanitizeDirectiveValue(rule.path);
      const action = rule.action === "disallow" ? "Disallow" : "Allow";

      // Empty path means "allow all" for both directive types; emit without
      // a trailing space so the output stays clean.
      if (cleanPath === "") {
        lines.push(`${action}:`);
      } else {
        lines.push(`${action}: ${cleanPath}`);
      }
    }

    if (lines.length > 0) {
      groupBlocks.push(lines.join("\n"));
    }
  }

  if (groupBlocks.length > 0) {
    parts.push(groupBlocks.join("\n\n"));
  }

  // Generate Sitemap declarations
  if (input.sitemaps && input.sitemaps.length > 0) {
    const sitemapLines = input.sitemaps
      .map(sanitizeDirectiveValue)
      .filter((url) => url.length > 0)
      .map((url) => `Sitemap: ${url}`);

    if (sitemapLines.length > 0) {
      parts.push(sitemapLines.join("\n"));
    }
  }

  // Ensure exactly one trailing newline
  const output = parts.join("\n\n").trim();
  return output ? `${output}\n` : "";
}
