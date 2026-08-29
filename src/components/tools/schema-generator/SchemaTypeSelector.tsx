import React from 'react';
import { SchemaDefinition } from '@/lib/schema/types';

interface SchemaTypeSelectorProps {
  schemas: SchemaDefinition[];
  activeSchemaId: string;
  onChange: (id: string) => void;
}

export default function SchemaTypeSelector({ schemas, activeSchemaId, onChange }: SchemaTypeSelectorProps) {
  return (
    <div className="schema-form-group">
      <label className="schema-label" htmlFor="schema-type-select">
        Which Schema.org type would you like to create?
      </label>
      <select 
        id="schema-type-select" 
        className="schema-select"
        value={activeSchemaId} 
        onChange={(e) => onChange(e.target.value)}
        style={{ fontSize: '1.05rem', padding: '0.875rem' }}
      >
        {schemas.map(s => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
