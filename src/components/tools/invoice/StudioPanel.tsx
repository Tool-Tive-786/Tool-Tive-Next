'use client';
import { useInvoiceStore, TemplateId } from '@/lib/store';

export default function StudioPanel() {
  const { colors, setColors, templateId, setTemplate, brandName, setField, currency, locale } = useInvoiceStore();

  const templates: { id: TemplateId; name: string }[] = [
    { id: 'minimal', name: 'Minimal' },
    { id: 'neo-brutal', name: 'Neo-Brutal' },
    { id: 'modern', name: 'Modern' },
    { id: 'corporate', name: 'Corporate' },
    { id: 'creative', name: 'Creative' }
  ];

  const locales = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'ur-PK', label: 'Urdu (Pakistan)' },
    { code: 'hi-IN', label: 'Hindi (India)' },
    { code: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
    { code: 'fr-FR', label: 'French (France)' },
    { code: 'de-DE', label: 'German (Germany)' },
    { code: 'es-ES', label: 'Spanish (Spain)' },
    { code: 'it-IT', label: 'Italian (Italy)' },
    { code: 'pt-BR', label: 'Portuguese (Brazil)' },
    { code: 'ru-RU', label: 'Russian (Russia)' },
    { code: 'zh-CN', label: 'Chinese (Simplified)' },
    { code: 'ja-JP', label: 'Japanese (Japan)' },
    { code: 'ko-KR', label: 'Korean (South Korea)' },
    { code: 'tr-TR', label: 'Turkish (Turkey)' },
    { code: 'bn-BD', label: 'Bengali (Bangladesh)' }
  ];

  return (
    <div className="panel panel-right">
      <div className="brand-header">
        <h2 className="brand-title" style={{ fontSize: '18px' }}>Studio</h2>
      </div>
      
      <div className="section">
        <h2 className="section-title">Brand & Locale</h2>
        <div className="form-group">
          <label className="form-label">Brand Name</label>
          <input className="form-input" type="text" value={brandName} onChange={(e) => setField('brandName', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Currency</label>
            <input className="form-input" type="text" placeholder="e.g. USD, PKR, €" value={currency} onChange={(e) => setField('currency', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Locale</label>
            <select className="form-select" value={locale} onChange={(e) => setField('locale', e.target.value)}>
              {locales.map(l => <option key={l.code} value={l.code} style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}>{l.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Template Style</h2>
        <div className="template-grid">
          {templates.map(tpl => (
            <button
              key={tpl.id}
              className={`template-btn ${templateId === tpl.id ? 'active' : ''}`}
              onClick={() => setTemplate(tpl.id)}
            >
              {tpl.name}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Brand Colors (RGB/HEX)</h2>
        {(Object.keys(colors) as Array<keyof typeof colors>).map(colorKey => (
          <div key={colorKey} className="color-picker-row">
            <label>{colorKey} Color</label>
            <div className="color-picker-wrapper">
              <input
                type="color"
                className="color-input-native"
                value={colors[colorKey]}
                onChange={(e) => setColors({ [colorKey]: e.target.value })}
              />
              <input
                type="text"
                className="color-text-input"
                value={colors[colorKey]}
                onChange={(e) => setColors({ [colorKey]: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
