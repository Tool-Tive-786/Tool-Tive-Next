import { CrawlerPreset } from "./types";

/**
 * Standard, verified crawler presets for search engines, AI scrapers,
 * and custom testing tokens.
 */
export const CRAWLER_PRESETS: CrawlerPreset[] = [
  {
    id: "wildcard",
    label: "All Robots (*)",
    productToken: "*",
    category: "generic",
    description: "Default fallback rules applying to all standard web crawlers."
  },
  {
    id: "googlebot",
    label: "Googlebot",
    productToken: "Googlebot",
    category: "search",
    description: "Google's primary web search crawler."
  },
  {
    id: "googlebot-image",
    label: "Googlebot-Image",
    productToken: "Googlebot-Image",
    category: "search",
    description: "Google's image indexer and search crawler."
  },
  {
    id: "bingbot",
    label: "Bingbot",
    productToken: "Bingbot",
    category: "search",
    description: "Microsoft Bing's standard web search crawler."
  },
  {
    id: "applebot",
    label: "Applebot",
    productToken: "Applebot",
    category: "search",
    description: "Apple's crawler used for Siri and Spotlight web search."
  },
  {
    id: "duckduckbot",
    label: "DuckDuckBot",
    productToken: "DuckDuckBot",
    category: "search",
    description: "DuckDuckGo's web crawler."
  },
  {
    id: "yandex",
    label: "Yandex",
    productToken: "Yandex",
    category: "search",
    description: "Yandex's primary web crawler."
  },
  {
    id: "baiduspider",
    label: "Baiduspider",
    productToken: "Baiduspider",
    category: "search",
    description: "Baidu's search engine crawler."
  },
  {
    id: "gptbot",
    label: "GPTBot (OpenAI)",
    productToken: "GPTBot",
    category: "ai",
    description: "OpenAI crawler used for training foundational AI models."
  },
  {
    id: "chatgpt-user",
    label: "ChatGPT-User",
    productToken: "ChatGPT-User",
    category: "ai",
    description: "Used when ChatGPT users trigger real-time web browsing."
  },
  {
    id: "claudebot",
    label: "ClaudeBot (Anthropic)",
    productToken: "ClaudeBot",
    category: "ai",
    description: "Anthropic's web crawler for training Claude AI models."
  },
  {
    id: "perplexitybot",
    label: "PerplexityBot",
    productToken: "PerplexityBot",
    category: "ai",
    description: "Perplexity AI search engine crawler."
  },
  {
    id: "google-extended",
    label: "Google-Extended",
    productToken: "Google-Extended",
    category: "ai",
    description: "Standalone token for training Google Gemini and Vertex AI models."
  },
  {
    id: "custom",
    label: "Custom Crawler",
    productToken: "",
    category: "custom",
    description: "Specify a custom user-agent token to test."
  }
];

/**
 * Returns all active crawler presets.
 */
export function getCrawlerPresets(): CrawlerPreset[] {
  return CRAWLER_PRESETS;
}

/**
 * Finds a preset by product token (case-insensitive).
 */
export function getPresetByToken(token: string): CrawlerPreset | undefined {
  const normalized = token.trim().toLowerCase();
  return CRAWLER_PRESETS.find(p => p.productToken.toLowerCase() === normalized);
}
