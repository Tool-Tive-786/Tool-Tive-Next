const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { search: /var\(--color-brand-primary\)/g, replace: 'var(--accent-primary)' },
  { search: /var\(--color-brand-primary,\s*#[a-f0-9]+\)/gi, replace: 'var(--accent-primary)' },
  { search: /var\(--color-brand-primary-hover\)/g, replace: 'var(--accent-primary)' },
  { search: /var\(--color-brand-primary-light\)/g, replace: 'var(--glow-color)' },
  
  { search: /var\(--color-brand-navy\)/g, replace: 'var(--text-primary)' },
  { search: /var\(--color-brand-navy,\s*#[a-f0-9]+\)/gi, replace: 'var(--text-primary)' },
  
  { search: /var\(--color-slate-600\)/g, replace: 'var(--text-secondary)' },
  { search: /var\(--color-slate-500\)/g, replace: 'var(--text-secondary)' },
  { search: /var\(--color-slate-400\)/g, replace: 'var(--text-secondary)' },
  
  { search: /var\(--color-slate-200\)/g, replace: 'var(--border-color)' },
  { search: /var\(--color-slate-100\)/g, replace: 'var(--border-color)' },
  { search: /var\(--color-slate-50\)/g, replace: 'var(--bg-input)' },

  { search: /#0f172a/gi, replace: 'var(--text-primary)' },
  { search: /#ff006e/gi, replace: 'var(--accent-primary)' },
  { search: /#64748b/gi, replace: 'var(--text-secondary)' },
  { search: /#475569/gi, replace: 'var(--text-secondary)' },
  { search: /#94a3b8/gi, replace: 'var(--text-secondary)' },
  { search: /#e2e8f0/gi, replace: 'var(--border-color)' },
  { search: /#f1f5f9/gi, replace: 'var(--bg-input)' },
  { search: /#f8fafc/gi, replace: 'var(--bg-card)' },
  { search: /#d9005f/gi, replace: 'var(--accent-primary)' },
  { search: /#ffe0ee/gi, replace: 'var(--glow-color)' },
  { search: /#eef1f5/gi, replace: 'var(--bg-input)' },

  { search: /background:\s*'#fff'/gi, replace: "background: 'var(--bg-card)'" },
  { search: /background:\s*'#ffffff'/gi, replace: "background: 'var(--bg-card)'" },
  { search: /backgroundColor:\s*'#fff'/gi, replace: "backgroundColor: 'var(--bg-card)'" },
  { search: /backgroundColor:\s*'#ffffff'/gi, replace: "backgroundColor: 'var(--bg-card)'" },
  { search: /color:\s*'#fff'/gi, replace: "color: 'var(--bg-body)'" },
  { search: /color:\s*'#ffffff'/gi, replace: "color: 'var(--bg-body)'" },
  { search: /background:\s*'#000'/gi, replace: "background: 'var(--accent-primary)'" },
  
  { search: /background-color:\s*#ffffff\s*!important;/g, replace: 'background-color: var(--bg-body) !important;' },
  { search: /background:\s*#fff;/g, replace: 'background: var(--bg-card);' },
  { search: /background-color:\s*#fff;/g, replace: 'background-color: var(--bg-card);' },
  { search: /background:\s*#ffffff;/g, replace: 'background: var(--bg-card);' },
  { search: /background-color:\s*#ffffff;/g, replace: 'background-color: var(--bg-card);' },
  { search: /color:\s*#fff;/gi, replace: 'color: var(--bg-body);' },
  { search: /color:\s*#ffffff;/gi, replace: 'color: var(--bg-body);' },

  { search: /box-shadow:[^;]+rgba\(0,0,0,0\.[0-9]+\)/g, replace: 'box-shadow: 0 4px 14px var(--glow-color)' },
  { search: /box-shadow:[^;]+rgba\(15,\s*23,\s*42,\s*0\.[0-9]+\)/g, replace: 'box-shadow: 0 4px 14px var(--glow-color)' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { search, replace } of replacements) {
        content = content.replace(search, replace);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Complete migration across src/');
