import React from 'react';
import { ValidationResult } from '@/lib/schema/types';
import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SchemaHealthProps {
  validation: ValidationResult | null;
}

export default function SchemaHealth({ validation }: SchemaHealthProps) {
  if (!validation) return null;

  const hasIssues = validation.errors.length > 0 || validation.warnings.length > 0 || validation.suggestions.length > 0;

  return (
    <div className="schema-health-panel">
      <span className="schema-section-title">Schema Health</span>
      
      {!hasIssues && (
        <div className="schema-health-item">
          <CheckCircle className="schema-health-icon success" size={18} />
          <div className="schema-health-text">
            <span className="schema-health-title">Looks Good</span>
            No structural errors or missing required properties detected.
          </div>
        </div>
      )}

      {validation.errors.map((err, i) => (
        <div key={`err-${i}`} className="schema-health-item">
          <AlertCircle className="schema-health-icon error" size={18} />
          <div className="schema-health-text">
            <span className="schema-health-title">Error</span>
            {err.message}
          </div>
        </div>
      ))}

      {validation.warnings.map((warn, i) => (
        <div key={`warn-${i}`} className="schema-health-item">
          <AlertTriangle className="schema-health-icon warning" size={18} />
          <div className="schema-health-text">
            <span className="schema-health-title">Warning</span>
            {warn.message}
          </div>
        </div>
      ))}

      {validation.suggestions.map((sugg, i) => (
        <div key={`sugg-${i}`} className="schema-health-item">
          <Info className="schema-health-icon info" size={18} />
          <div className="schema-health-text">
            <span className="schema-health-title">Suggestion</span>
            {sugg.message}
          </div>
        </div>
      ))}
    </div>
  );
}
