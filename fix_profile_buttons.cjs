const fs = require('fs');
let content = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf-8');

content = content.replace(/hover:text-blue-300/g, 'hover:text-blue-600 dark:hover:text-blue-300');
content = content.replace(/bg-white\/5/g, 'bg-slate-100 dark:bg-white/5');

fs.writeFileSync('src/components/ProfileScreen.tsx', content);
console.log('Fixed ProfileScreen buttons');
