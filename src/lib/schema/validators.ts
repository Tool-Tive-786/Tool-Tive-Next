import { ValidationResult, ValidationIssue, ValidationLevel } from './types';

export function createEmptyResult(): ValidationResult {
  return {
    validJson: true,
    detectedTypes: [],
    errors: [],
    warnings: [],
    suggestions: []
  };
}

export function validateJsonStructure(input: string): { valid: boolean; data: any; error?: string } {
  try {
    const parsed = JSON.parse(input);
    return { valid: true, data: parsed };
  } catch (e: any) {
    return { valid: false, data: null, error: e.message };
  }
}

// Basic validator used by specific schema builders to combine their rules
export function validateCommonSchemaProps(data: any, result: ValidationResult) {
  if (!data) return;
  
  if (!data['@context']) {
    result.errors.push({
      level: 'error',
      code: 'MISSING_CONTEXT',
      message: 'Missing "@context" property (should be "https://schema.org").',
      fixable: true
    });
  } else if (data['@context'] !== 'https://schema.org') {
     result.warnings.push({
      level: 'warning',
      code: 'INVALID_CONTEXT',
      message: '"@context" should typically be "https://schema.org".',
      fixable: true
    });
  }

  if (!data['@type']) {
    result.errors.push({
      level: 'error',
      code: 'MISSING_TYPE',
      message: 'Missing "@type" property.',
      fixable: false
    });
  }
}

// Extracts a JSON-LD object from a script tag if present
export function extractJsonLdFromScript(input: string): string {
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i;
  const match = input.match(scriptRegex);
  return match ? match[1].trim() : input.trim();
}

// Safely stringifies data for embedding in script tags (prevents XSS with </script>)
export function serializeJsonLd(data: any): string {
  const json = JSON.stringify(data, null, 2);
  return json.replace(/<\/script>/g, '<\\/script>');
}
