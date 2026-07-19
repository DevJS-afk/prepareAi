const fs = require('fs');
let content = fs.readFileSync('src/components/InterviewSetup.tsx', 'utf-8');

content = content.replace(/to-blue-700 text-slate-900 dark:text-white/g, 'to-blue-700 text-white');

fs.writeFileSync('src/components/InterviewSetup.tsx', content);
console.log('Fixed blue btn text');
