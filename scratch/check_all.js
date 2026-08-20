const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.git') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const jsFiles = walk('.');
let hasError = false;
jsFiles.forEach(f => {
  try {
    execSync(`node -c "${f}"`);
    console.log('✓ Syntax OK:', f);
  } catch (err) {
    console.error('✗ Syntax Error in:', f, err.message);
    hasError = true;
  }
});
if (!hasError) {
  console.log('\n✅ All ' + jsFiles.length + ' JS files passed syntax validation!');
} else {
  process.exit(1);
}
