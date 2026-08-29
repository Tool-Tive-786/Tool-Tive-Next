import React from 'react';
import { SchemaFieldDefinition } from '@/lib/schema/types';
import SchemaField from './SchemaField';
import { Trash2 } from 'lucide-react';

interface RepeaterFieldProps {
  field: SchemaFieldDefinition;
  items: any[];
  onChange: (items: any[]) => void;
}

export default function RepeaterField({ field, items = [], onChange }: RepeaterFieldProps) {
  const handleAdd = () => {
    onChange([...items, {}]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleChange = (index: number, key: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    onChange(newItems);
  };

  return (
    <div className="schema-form-group">
      <label className="schema-label">{field.label}</label>
      
      {items.map((item, index) => (
        <div key={index} className="schema-accordion">
          <div className="schema-accordion-header">
            <span className="schema-accordion-title">Item {index + 1}</span>
            <button
              type="button"
              className="schema-repeater-remove"
              onClick={() => handleRemove(index)}
              aria-label={`Remove item ${index + 1}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="schema-accordion-content">
            {field.fields?.map((subField) => (
              <SchemaField
                key={subField.id}
                field={subField}
                value={item[subField.id]}
                onChange={(val) => handleChange(index, subField.id, val)}
              />
            ))}
          </div>
        </div>
      ))}

      <button type="button" className="schema-repeater-add" onClick={handleAdd}>
        + Add {field.label}
      </button>
      {field.description && <span className="schema-field-desc">{field.description}</span>}
    </div>
  );
}
