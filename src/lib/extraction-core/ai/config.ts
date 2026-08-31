export const AI_PROVIDER = "cloudflare";
export const AI_MODEL = "@cf/google/gemma-4-26b-a4b-it";

// Maximum characters for the table JSON string representation sent to AI
export const AI_MAX_INPUT_CHARS = 15000; 

// Maximum characters per individual cell (to prevent massive payloads from dense cells)
export const AI_MAX_CHARS_PER_CELL = 250;

// Maximum number of cells in a single request (to protect context window)
export const AI_MAX_CELLS_PER_REQUEST = 300;

// Default limit for anonymous usage
export const AI_USER_DAILY_LIMIT = 3;

// Global daily fallback limit (if environment variable not set)
export const DEFAULT_AI_DAILY_GLOBAL_LIMIT = 1000;
