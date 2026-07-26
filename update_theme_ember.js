const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { search: /var\(--bg-body\)/g, replace: 'var(--bg-primary)' },
  { search: /var\(--accent-primary\)/g, replace: 'var(--accent)' },
  { search: /var\(--border-color\)/g, replace: 'var(--border-default)' },
  { search: /var\(--glow-color\)/g, replace: 'var(--accent-glow)' },
  // specific hex colors mapped from previous theme just in case
  { search: /#0a0908/gi, replace: 'var(--bg-primary)' },
  { search: /#181412/gi, replace: 'var(--bg-card)' },
  { search: /#141210/gi, replace: 'var(--bg-input)' },
  { search: /#fafaf9/gi, replace: 'var(--text-primary)' },
  { search: /#c4b5a0/gi, replace: 'var(--text-secondary)' },
  { search: /#f59e0b/gi, replace: 'var(--accent)' },
  { search: /#2a2621/gi, replace: 'var(--border-default)' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
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
console.log('Ember theme variables renamed in src/');
