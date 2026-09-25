const fs = require('fs');
const path = require('path');

function scan(dir) {
  let queries = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      queries = queries.concat(scan(full));
    } else if (e.name.endsWith('.js') || e.name.endsWith('.jsx')) {
      const content = fs.readFileSync(full, 'utf8');
      const regex = /query\s*\(\s*([`'"])((?:(?!\1)[\s\S])*)\1/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        queries.push({ file: full, sql: match[2].replace(/\s+/g, ' ').trim() });
      }
    }
  }
  return queries;
}

const all = scan('app');
console.log('Total queries in app:', all.length);
const unique = [...new Set(all.map(q => q.sql))];
console.log('Unique SQL patterns:', unique.length);
unique.forEach((s, i) => console.log((i+1) + '. ' + s));
