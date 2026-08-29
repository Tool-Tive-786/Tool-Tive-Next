import React, { useState } from 'react';
import { validateJsonStructure, extractJsonLdFromScript } from '@/lib/schema/validators';
import SchemaHealth from './SchemaHealth';
import { ValidationResult } from '@/lib/schema/types';
import { schemaRegistry } from '@/lib/schema/registry';
import { Edit3 } from 'lucide-react';

interface ValidationPanelProps {
  initialRawJson?: string;
  onRawJsonChange: (json: string) => void;
  onEditInGenerator?: (schemaId: string, formData: any) => void;
}

export default function ValidationPanel({ initialRawJson, onRawJsonChange, onEditInGenerator }: ValidationPanelProps) {
  const [input, setInput] = useState(initialRawJson || '');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [parsedDataCache, setParsedDataCache] = useState<any[]>([]);

  const handleValidate = () => {
    onRawJsonChange(input);
    setParsedDataCache([]);
    
    if (input.length > 1000000) {
       setValidationResult({
         validJson: false,
         detectedTypes: [],
         errors: [{ level: 'error', code: 'TOO_LARGE', message: 'Input is too large to validate. Max size is 1MB.' }],
         warnings: [],
         suggestions: []
       });
       return;
    }

    const cleanInput = extractJsonLdFromScript(input);
    const { valid, data, error } = validateJsonStructure(cleanInput);

    if (!valid) {
      setValidationResult({
         validJson: false,
         detectedTypes: [],
         errors: [{ level: 'error', code: 'INVALID_JSON', message: `Invalid JSON syntax: ${error}` }],
         warnings: [],
         suggestions: []
      });
      return;
    }

    const result: ValidationResult = {
      validJson: true,
      detectedTypes: [],
      errors: [],
      warnings: [],
      suggestions: []
    };

    const itemsToProcess = Array.isArray(data) ? data : (data['@graph'] ? data['@graph'] : [data]);
    setParsedDataCache(itemsToProcess);

    itemsToProcess.forEach((item: any, index: number) => {
      const type = item['@type'];
      if (!type) {
         result.errors.push({ level: 'error', code: 'MISSING_TYPE', message: `Item at index ${index} is missing @type property.` });
         return;
      }
      
      const typeStr = Array.isArray(type) ? type[0] : type;
      result.detectedTypes.push(typeStr);

      const schemaDef = schemaRegistry.find(s => s.schemaType === typeStr);
      if (schemaDef) {
         const itemValidation = schemaDef.validate(item);
         result.errors.push(...itemValidation.errors);
         result.warnings.push(...itemValidation.warnings);
         result.suggestions.push(...itemValidation.suggestions);
      } else {
         result.warnings.push({ level: 'warning', code: 'UNSUPPORTED_TYPE', message: `Schema type "${typeStr}" is valid JSON-LD but not fully checked by our specific Google rules engine yet.` });
      }
    });

    setValidationResult(result);
  };

  const mapArticleToFormData = (json: any) => {
    const fd: any = { _originalData: json };
    if (json.headline) fd.headline = json.headline;
    if (json.description) fd.description = json.description;
    if (json.url) fd.url = json.url;
    
    if (json.image) {
      if (Array.isArray(json.image)) fd.image = json.image[0]?.url || (typeof json.image[0] === 'string' ? json.image[0] : '');
      else if (typeof json.image === 'object') fd.image = json.image.url;
      else fd.image = json.image;
    }

    if (json.author) {
      const author = Array.isArray(json.author) ? json.author[0] : json.author;
      if (author.name) fd.authorName = author.name;
      if (author.url) fd.authorUrl = author.url;
    }

    if (json.publisher) {
      fd.publisherName = json.publisher.name;
      if (json.publisher.logo) {
        fd.publisherLogo = typeof json.publisher.logo === 'object' ? json.publisher.logo.url : json.publisher.logo;
      }
    }

    // Attempt to map dates
    if (json.datePublished) fd.datePublished = typeof json.datePublished === 'string' ? json.datePublished.substring(0, 16) : json.datePublished;
    if (json.dateModified) fd.dateModified = typeof json.dateModified === 'string' ? json.dateModified.substring(0, 16) : json.dateModified;

    if (json.articleSection) fd.articleSection = Array.isArray(json.articleSection) ? json.articleSection.join(', ') : json.articleSection;
    if (json.keywords) fd.keywords = Array.isArray(json.keywords) ? json.keywords.join(', ') : json.keywords;
    if (json.inLanguage) fd.language = typeof json.inLanguage === 'object' ? json.inLanguage.name : json.inLanguage;
    if (json.articleBody) fd.articleBody = json.articleBody;
    if (json.wordCount) fd.wordCount = json.wordCount;
    
    if (json.mainEntityOfPage) {
      fd.mainEntityOfPage = typeof json.mainEntityOfPage === 'object' ? json.mainEntityOfPage['@id'] : json.mainEntityOfPage;
    }

    const supportedKeys = ['@context', '@type', 'headline', 'description', 'url', 'image', 'author', 'publisher', 'datePublished', 'dateModified', 'articleSection', 'keywords', 'inLanguage', 'articleBody', 'wordCount', 'mainEntityOfPage'];
    const actualKeys = Object.keys(json);
    const unsupported = actualKeys.filter(k => !supportedKeys.includes(k));
    if (unsupported.length > 0) {
      fd._hasUnsupported = true;
    }
    return fd;
  };

  const handleEditInGenerator = (typeStr: string) => {
    if (!onEditInGenerator) return;
    
    const schemaDef = schemaRegistry.find(s => s.schemaType === typeStr);
    if (!schemaDef) return;

    // Find the first instance of this type in parsed data
    const item = parsedDataCache.find((d: any) => {
      const t = Array.isArray(d['@type']) ? d['@type'][0] : d['@type'];
      return t === typeStr;
    });

    if (!item) return;

    let formData = {};
    if (typeStr === 'Article') {
      formData = mapArticleToFormData(item);
    }
    // Note: Other schemas would need their own mapping logic implemented here.

    onEditInGenerator(schemaDef.id, formData);
  };

  return (
    <div className="schema-validation-panel" style={{ width: '100%' }}>
      <div className="schema-section-title">Validate JSON-LD</div>
      <p className="schema-field-desc" style={{ marginBottom: '1.5rem', color: '#a0a0a0' }}>
        Paste your existing Schema.org code below (raw JSON or wrapped in &lt;script&gt; tags) to check for syntax errors and missing Google rich-result properties.
      </p>

      <textarea
        className="schema-textarea"
        style={{ minHeight: '300px', fontFamily: 'monospace', marginBottom: '1rem' }}
        placeholder="Paste your <script type='application/ld+json'>...</script> here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button className="schema-btn" onClick={handleValidate} style={{ marginBottom: '2rem' }}>
        Validate Schema
      </button>

      {validationResult && (
        <div style={{ marginTop: '1rem' }}>
          {validationResult.detectedTypes.length > 0 && (
            <div className="schema-banner" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="schema-banner-content">
                <strong>Detected Schemas:</strong> {validationResult.detectedTypes.join(', ')}
              </div>
              {onEditInGenerator && validationResult.detectedTypes.includes('Article') && (
                <div style={{ marginTop: '0.5rem' }}>
                  <button 
                    className="schema-btn schema-btn-outline" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                    onClick={() => handleEditInGenerator('Article')}
                  >
                    <Edit3 size={14} /> Edit Article in Generator
                  </button>
                </div>
              )}
            </div>
          )}
          <SchemaHealth validation={validationResult} />
        </div>
      )}
    </div>
  );
}
