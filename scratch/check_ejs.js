const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.git') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.ejs')) {
      results.push(fullPath);
    }
  });
  return results;
}

const ejsFiles = walk('./views');
let hasError = false;

ejsFiles.forEach(f => {
  try {
    const content = fs.readFileSync(f, 'utf8');
    ejs.compile(content, { filename: f });
    console.log('✓ EJS Template OK:', f);
  } catch (err) {
    console.error('✗ EJS Compile Error in:', f, err.message);
    hasError = true;
  }
});

if (!hasError) {
  console.log('\n✅ All ' + ejsFiles.length + ' EJS templates compiled without syntax errors!');
} else {
  process.exit(1);
}
