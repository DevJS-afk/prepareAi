const fs = require('fs');
let content = fs.readFileSync('src/components/InterviewerDashboard.tsx', 'utf-8');

content = content.replace(/to-purple-700 text-slate-900 dark:text-white/g, 'to-purple-700 text-white');
content = content.replace(/to-blue-600 text-slate-900 dark:text-white/g, 'to-blue-600 text-white');

fs.writeFileSync('src/components/InterviewerDashboard.tsx', content);
console.log('Fixed purple btn text');
