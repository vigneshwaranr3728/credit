const fs = require('fs');
const path = require('path');

// Copy HTML, CSS, favicon to dist
const srcDir = path.join(__dirname, '../src');
const distDir = path.join(__dirname, '../dist');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// Copy static files
['index.html', 'styles.css', 'favicon.svg'].forEach(f => {
  fs.copyFileSync(path.join(srcDir, f), path.join(distDir, f));
});

console.log('✅ Static files copied to dist/');
