const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'src', 'styles');

const replacements = [
  { search: /#0f172a/gi, replace: 'var(--text-primary)' },
  { search: /#ff006e/gi, replace: 'var(--accent-primary)' },
  { search: /#64748b/gi, replace: 'var(--text-secondary)' },
  { search: /#475569/gi, replace: 'var(--text-secondary)' },
  { search: /#94a3b8/gi, replace: 'var(--text-secondary)' },
  { search: /#e2e8f0/gi, replace: 'var(--border-color)' },
  { search: /#f1f5f9/gi, replace: 'var(--bg-input)' },
  { search: /#f8fafc/gi, replace: 'var(--bg-card)' },
  { search: /#d9005f/gi, replace: 'var(--accent-primary)' },
  { search: /#ffe0ee/gi, replace: 'var(--glow-color)' }
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

const pageTsxPath = path.join(__dirname, 'src', 'app', 'page.tsx');
if (fs.existsSync(pageTsxPath)) {
  let content = fs.readFileSync(pageTsxPath, 'utf8');
  let original = content;
  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }
  if (content !== original) {
    fs.writeFileSync(pageTsxPath, content, 'utf8');
    console.log(`Updated: ${pageTsxPath}`);
  }
}

console.log('Hex migration complete.');
