import React from 'react';
import { SchemaDefinition } from '@/lib/schema/types';
import SchemaField from './SchemaField';
import RepeaterField from './RepeaterField';

interface DynamicSchemaFormProps {
  schema: SchemaDefinition;
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export default function DynamicSchemaForm({ schema, formData, onChange }: DynamicSchemaFormProps) {
  // Group fields
  const groupedFields: Record<string, typeof schema.fields> = {};
  const fieldGroupsOrder: string[] = [];

  schema.fields.forEach((field) => {
    const groupName = field.group || 'Default';
    if (!groupedFields[groupName]) {
      groupedFields[groupName] = [];
      fieldGroupsOrder.push(groupName);
    }
    groupedFields[groupName].push(field);
  });

  const renderField = (field: typeof schema.fields[0]) => {
    if (field.type === 'repeater') {
      return (
        <RepeaterField
          key={field.id}
          field={field}
          items={formData[field.id] || []}
          onChange={(val) => onChange(field.id, val)}
        />
      );
    }
    return (
      <SchemaField
        key={field.id}
        field={field}
        value={formData[field.id]}
        onChange={(val) => onChange(field.id, val)}
      />
    );
  };

  return (
    <div className="schema-dynamic-form">
      <div className="schema-section-title">
        {schema.label} Properties
      </div>
      <p className="schema-field-desc" style={{ marginBottom: '1.5rem', color: '#a0a0a0' }}>
        {schema.description}
      </p>

      {fieldGroupsOrder.map((group) => {
        const fieldsInGroup = groupedFields[group];
        
        if (group === 'Default') {
          return (
            <React.Fragment key={group}>
              {fieldsInGroup.map(renderField)}
            </React.Fragment>
          );
        }

        if (group.toLowerCase() === 'advanced') {
          return (
            <div key={group} className="schema-accordion" style={{ marginTop: '2rem' }}>
              <details>
                <summary className="schema-accordion-header" style={{ listStyle: 'none' }}>
                  <span className="schema-accordion-title">{group}</span>
                  <span className="schema-toggle-icon" style={{ color: '#a0a0a0' }}>+</span>
                </summary>
                <div className="schema-accordion-content" style={{ paddingTop: '1.5rem' }}>
                  {fieldsInGroup.map(renderField)}
                </div>
              </details>
            </div>
          );
        }

        return (
          <div key={group} style={{ marginTop: '2rem' }}>
            <h4 style={{ color: '#e5e7eb', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {group}
            </h4>
            {fieldsInGroup.map(renderField)}
          </div>
        );
      })}
    </div>
  );
}
