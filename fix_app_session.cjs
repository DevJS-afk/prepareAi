const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/setSession\(session\);/g, 'setSession(session as any);');
content = content.replace(/setSession\(session\)/g, 'setSession(session as any)');

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed Session typing in App.tsx');
