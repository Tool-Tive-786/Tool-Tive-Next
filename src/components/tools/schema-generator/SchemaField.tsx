import React from 'react';
import { SchemaFieldDefinition } from '@/lib/schema/types';

interface SchemaFieldProps {
  field: SchemaFieldDefinition;
  value: any;
  onChange: (value: any) => void;
}

export default function SchemaField({ field, value, onChange }: SchemaFieldProps) {
  const id = `schema-field-${field.id}`;

  if (field.type === 'select' && field.options) {
    return (
      <div className="schema-form-group">
        <label htmlFor={id} className="schema-label">
          {field.label} {field.required && <span style={{color: '#EF4444'}}>*</span>}
        </label>
        <select
          id={id}
          className="schema-select"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">-- Select --</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {field.description && <span className="schema-field-desc">{field.description}</span>}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="schema-form-group">
        <label htmlFor={id} className="schema-label">
          {field.label} {field.required && <span style={{color: '#EF4444'}}>*</span>}
        </label>
        <textarea
          id={id}
          className="schema-textarea"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.description && <span className="schema-field-desc">{field.description}</span>}
      </div>
    );
  }

  // Fallback for text, url, number, date, datetime-local
  return (
    <div className="schema-form-group">
      <label htmlFor={id} className="schema-label">
        {field.label} {field.required && <span style={{color: '#EF4444'}}>*</span>}
      </label>
      <input
        type={field.type}
        id={id}
        className="schema-input"
        value={value || ''}
        onChange={(e) => {
          if (e.target.type === 'number') {
            onChange(e.target.value === '' ? '' : Number(e.target.value));
          } else {
            onChange(e.target.value);
          }
        }}
      />
      {field.description && <span className="schema-field-desc">{field.description}</span>}
    </div>
  );
}
