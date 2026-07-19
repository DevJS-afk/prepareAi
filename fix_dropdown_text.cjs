const fs = require('fs');
let content = fs.readFileSync('src/components/InterviewerDashboard.tsx', 'utf-8');

// remove text-white from options in light mode
content = content.replace(/className="bg-slate-100 dark:bg-slate-900 text-white"/g, 'className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white"');

fs.writeFileSync('src/components/InterviewerDashboard.tsx', content);
console.log('Fixed InterviewerDashboard option text colors');
