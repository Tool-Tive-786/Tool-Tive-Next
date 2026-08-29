import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { schemaRegistry, getSchemaDefinition } from '@/lib/schema/registry';
import { saveDraft, loadDraft, clearDraft } from '@/lib/schema/storage';
import SchemaModeTabs from './SchemaModeTabs';
import SchemaTypeSelector from './SchemaTypeSelector';
import DynamicSchemaForm from './DynamicSchemaForm';
import SchemaHealth from './SchemaHealth';
import SchemaOutput from './SchemaOutput';
import ValidationPanel from './ValidationPanel';

export default function SchemaMarkupGenerator() {
  const [isClient, setIsClient] = useState(false);
  
  // State
  const [activeMode, setActiveMode] = useState<'generate' | 'validate'>('generate');
  const [activeSchemaId, setActiveSchemaId] = useState<string>(schemaRegistry[0].id);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [rawJsonInput, setRawJsonInput] = useState<string>('');
  
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Initialize draft on mount
  useEffect(() => {
    setIsClient(true);
    const draft = loadDraft();
    if (draft) {
      // Check if it's not totally empty (some activity happened)
      if (Object.keys(draft.formData || {}).length > 0 || draft.rawJsonInput) {
        setShowDraftBanner(true);
      }
    }
  }, []);

  // Debounced auto-save
  useEffect(() => {
    if (!isClient) return;
    const timeout = setTimeout(() => {
      saveDraft({
        activeMode,
        activeSchemaId,
        formData,
        rawJsonInput
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [activeMode, activeSchemaId, formData, rawJsonInput, isClient]);

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      if (draft.activeMode) setActiveMode(draft.activeMode);
      if (draft.activeSchemaId) setActiveSchemaId(draft.activeSchemaId);
      if (draft.formData) setFormData(draft.formData);
      if (draft.rawJsonInput) setRawJsonInput(draft.rawJsonInput);
    }
    setShowDraftBanner(false);
  };

  const handleClearDraft = () => {
    clearDraft();
    setShowDraftBanner(false);
  };

  const handleFormChange = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSchemaChange = (id: string) => {
    // Basic protection against accidental data loss
    if (Object.keys(formData).length > 0) {
      if (!window.confirm("Changing the schema type will clear your current form data. Continue?")) {
        return;
      }
    }
    setActiveSchemaId(id);
    setFormData({});
  };

  const handleStartFresh = () => {
    if (window.confirm("Are you sure you want to clear everything and start fresh?")) {
      setActiveSchemaId(schemaRegistry[0].id);
      setFormData({});
      setRawJsonInput('');
      handleClearDraft();
    }
  };

  const activeSchema = useMemo(() => getSchemaDefinition(activeSchemaId), [activeSchemaId]);
  
  const generatedData = useMemo(() => {
    if (!activeSchema) return null;
    return activeSchema.build(formData);
  }, [activeSchema, formData]);

  const validationResult = useMemo(() => {
    if (!activeSchema || !generatedData) return null;
    return activeSchema.validate(generatedData);
  }, [activeSchema, generatedData]);

  const handleEditInGenerator = (schemaId: string, parsedFormData: any) => {
    setActiveSchemaId(schemaId);
    setFormData(parsedFormData);
    setActiveMode('generate');
  };

  if (!isClient) {
    return <div style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading tool...</div>;
  }

  return (
    <div className="schema-generator-container">
      {/* LEFT PANEL */}
      <div className="schema-panel-left">
        {showDraftBanner && (
          <div className="schema-banner">
            <div className="schema-banner-content">
              We found a previously saved draft.
            </div>
            <div className="schema-banner-actions">
              <button className="schema-btn" style={{ padding: '0.5rem 1rem' }} onClick={handleRestoreDraft}>Restore Draft</button>
              <button className="schema-btn schema-btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={handleClearDraft}>Dismiss</button>
            </div>
          </div>
        )}

        <SchemaModeTabs activeMode={activeMode} onChange={setActiveMode} />

        {activeMode === 'generate' && activeSchema ? (
          <div>
            <SchemaTypeSelector 
              schemas={schemaRegistry} 
              activeSchemaId={activeSchemaId} 
              onChange={handleSchemaChange} 
            />
            
            {formData._hasUnsupported && (
              <div className="schema-banner" style={{ marginTop: '1.5rem', backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)' }}>
                <div className="schema-banner-content" style={{ color: '#FCD34D' }}>
                  <strong>Note:</strong> This Article contains advanced properties that are not represented in the visual editor. They will be preserved in the final output.
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem' }}>
              <DynamicSchemaForm 
                schema={activeSchema} 
                formData={formData} 
                onChange={handleFormChange} 
              />
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
               <button className="schema-btn schema-btn-outline" onClick={handleStartFresh} style={{ color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                  Clear & Start Fresh
               </button>
            </div>
          </div>
        ) : (
          <ValidationPanel 
            initialRawJson={rawJsonInput} 
            onRawJsonChange={setRawJsonInput} 
            onEditInGenerator={handleEditInGenerator}
          />
        )}
      </div>

      {/* RIGHT PANEL - Only show in Generate mode */}
      {activeMode === 'generate' && (
        <div className="schema-panel-right">
          <SchemaHealth validation={validationResult} />
          {generatedData && <SchemaOutput data={generatedData} />}
        </div>
      )}
    </div>
  );
}
