const fs = require('fs');
let content = fs.readFileSync('src/components/Changelog.tsx', 'utf8');
content = content.replace(/\\`inline-flex/g, '`inline-flex');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/Changelog.tsx', content);
console.log('Fixed');
