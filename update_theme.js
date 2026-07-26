const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'src', 'styles');

const replacements = [
  { search: /var\(--color-brand-primary\)/g, replace: 'var(--accent-primary)' },
  { search: /var\(--color-brand-primary,\s*#[a-f0-9]+\)/gi, replace: 'var(--accent-primary)' },
  { search: /var\(--color-brand-primary-hover\)/g, replace: 'var(--accent-primary)' },
  { search: /var\(--color-brand-primary-light\)/g, replace: 'var(--glow-color)' },
  
  // Navy is typically text, but in some cases background. Let's map it to text-primary
  { search: /var\(--color-brand-navy\)/g, replace: 'var(--text-primary)' },
  { search: /var\(--color-brand-navy,\s*#[a-f0-9]+\)/gi, replace: 'var(--text-primary)' },
  
  { search: /var\(--color-slate-600\)/g, replace: 'var(--text-secondary)' },
  { search: /var\(--color-slate-500\)/g, replace: 'var(--text-secondary)' },
  { search: /var\(--color-slate-400\)/g, replace: 'var(--text-secondary)' },
  
  { search: /var\(--color-slate-200\)/g, replace: 'var(--border-color)' },
  { search: /var\(--color-slate-100\)/g, replace: 'var(--border-color)' },
  { search: /var\(--color-slate-50\)/g, replace: 'var(--bg-input)' },
  
  // Common hardcoded colors
  { search: /background-color:\s*#ffffff\s*!important;/g, replace: 'background-color: var(--bg-body) !important;' },
  { search: /background:\s*#fff;/g, replace: 'background: var(--bg-card);' },
  { search: /background-color:\s*#fff;/g, replace: 'background-color: var(--bg-card);' },
  { search: /background:\s*#ffffff;/g, replace: 'background: var(--bg-card);' },
  { search: /background-color:\s*#ffffff;/g, replace: 'background-color: var(--bg-card);' },
  
  // If text color was #fff, it usually means it was on a dark background (e.g. primary color or navy).
  // Now that the primary background is dark, #fff text should be var(--bg-body) if it's on a bright accent?
  // Wait, if it's on a button, color #fff is good. But let's change it to text-primary just in case.
  // Actually, let's leave #fff text alone for a moment, as it's often used for buttons.
  // Wait, the prompt says "--text-primary: #F2EAF4". Let's change color: #fff to color: var(--text-primary).
  { search: /color:\s*#fff;/gi, replace: 'color: var(--bg-body);' },
  { search: /color:\s*#ffffff;/gi, replace: 'color: var(--bg-body);' },
  
  { search: /background-color:\s*#000;/gi, replace: 'background-color: var(--accent-primary);' },
  { search: /background:\s*#000;/gi, replace: 'background: var(--accent-primary);' },
  
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

processDirectory(cssDir);

// Also process page.tsx
const pageTsxPath = path.join(__dirname, 'src', 'app', 'page.tsx');
if (fs.existsSync(pageTsxPath)) {
  let content = fs.readFileSync(pageTsxPath, 'utf8');
  let original = content;
  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }
  // additional specific replacement for page.tsx hardcoded inline styles
  content = content.replace(/background: '#fff'/g, "background: 'var(--bg-card)'");
  content = content.replace(/color: 'var\(--color-slate-600\)'/g, "color: 'var(--text-secondary)'");
  content = content.replace(/color: 'var\(--color-brand-navy\)'/g, "color: 'var(--text-primary)'");
  content = content.replace(/border: '1px solid var\(--color-slate-200\)'/g, "border: '1px solid var(--border-color)'");
  content = content.replace(/boxShadow: '[^']+'/g, "boxShadow: '0 4px 14px var(--glow-color)'");
  
  if (content !== original) {
    fs.writeFileSync(pageTsxPath, content, 'utf8');
    console.log(`Updated: ${pageTsxPath}`);
  }
}

console.log('Migration complete.');
