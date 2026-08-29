import React, { useState } from 'react';
import { Copy, Download, ExternalLink, Check } from 'lucide-react';
import { serializeJsonLd } from '@/lib/schema/validators';

interface SchemaOutputProps {
  data: any;
}

export default function SchemaOutput({ data }: SchemaOutputProps) {
  const [copied, setCopied] = useState(false);

  const scriptWrapped = `<script type="application/ld+json">\n${serializeJsonLd(data)}\n</script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptWrapped);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Copy failed. Please select and copy the code manually.");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([scriptWrapped], { type: 'application/ld+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schema-markup.html'; // Save as html to preserve script tags, or json for raw
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed.");
    }
  };

  const handleTestGoogle = () => {
    window.open('https://search.google.com/test/rich-results', '_blank');
  };

  return (
    <div className="schema-output-panel">
      <div className="schema-code-block">
        <div className="schema-code-header">
          <span className="schema-code-title">JSON-LD Output</span>
          <div className="schema-code-actions">
            <button onClick={handleCopy} aria-label="Copy to clipboard" title="Copy to clipboard">
              {copied ? <Check size={16} className="schema-health-icon success" /> : <Copy size={16} />}
            </button>
            <button onClick={handleDownload} aria-label="Download JSON-LD" title="Download">
              <Download size={16} />
            </button>
          </div>
        </div>
        <pre className="schema-code-content">{scriptWrapped}</pre>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="schema-btn" onClick={handleTestGoogle}>
          Test in Google <ExternalLink size={16} />
        </button>
        <button className="schema-btn schema-btn-outline" onClick={() => window.open('https://validator.schema.org/', '_blank')}>
          Schema.org Validator <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
}
