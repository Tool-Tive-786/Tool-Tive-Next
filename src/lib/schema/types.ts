export type ValidationLevel = 'error' | 'warning' | 'suggestion' | 'info';

export interface ValidationIssue {
  level: ValidationLevel;
  code: string;
  message: string;
  path?: string;
  fixable?: boolean;
}

export interface ValidationResult {
  validJson: boolean;
  detectedTypes: string[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: ValidationIssue[];
}

export interface SchemaFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'date' | 'datetime-local' | 'number' | 'select' | 'checkbox' | 'repeater' | 'nested';
  description?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  fields?: SchemaFieldDefinition[]; // For nested or repeater
  group?: string; // For visual grouping in the UI
}

export interface SchemaDefinition {
  id: string;
  label: string;
  schemaType: string;
  description: string;
  fields: SchemaFieldDefinition[];
  build: (data: any) => any;
  validate: (data: any) => ValidationResult;
}

export interface SchemaDraftState {
  version: number;
  timestamp: number;
  activeMode: 'generate' | 'validate';
  activeSchemaId: string;
  formData: Record<string, any>;
  rawJsonInput: string;
}
