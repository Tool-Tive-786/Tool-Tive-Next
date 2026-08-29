import React from 'react';

interface SchemaModeTabsProps {
  activeMode: 'generate' | 'validate';
  onChange: (mode: 'generate' | 'validate') => void;
}

export default function SchemaModeTabs({ activeMode, onChange }: SchemaModeTabsProps) {
  return (
    <div className="schema-mode-tabs">
      <button 
        className={`schema-mode-tab ${activeMode === 'generate' ? 'active' : ''}`}
        onClick={() => onChange('generate')}
      >
        Generate
      </button>
      <button 
        className={`schema-mode-tab ${activeMode === 'validate' ? 'active' : ''}`}
        onClick={() => onChange('validate')}
      >
        Validate
      </button>
    </div>
  );
}
