const fs = require('fs');
let content = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf-8');

// Fix text inside gradient avatar
content = content.replace(/text-5xl font-bold text-slate-900 dark:text-white/g, 'text-5xl font-bold text-white');

// Fix text inside bg-black/50 overlay
content = content.replace(/span className="text-xs font-bold text-slate-900 dark:text-white"/g, 'span className="text-xs font-bold text-white"');

// Fix pronouns pill
content = content.replace(/bg-white\/5 text-gray-300/g, 'bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-gray-300');

fs.writeFileSync('src/components/ProfileScreen.tsx', content);
console.log('Fixed ProfileScreen specific styles');
