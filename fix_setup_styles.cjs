const fs = require('fs');
let content = fs.readFileSync('src/components/InterviewSetup.tsx', 'utf-8');

// text-gray-100 -> text-slate-900 dark:text-gray-100
content = content.replace(/(?<!dark:)text-gray-100/g, 'text-slate-900 dark:text-gray-100');

// text-gray-300 -> text-slate-600 dark:text-gray-300
content = content.replace(/(?<!dark:)text-gray-300/g, 'text-slate-600 dark:text-gray-300');

// bg-gray-800 -> bg-slate-200 dark:bg-gray-800
content = content.replace(/(?<!dark:)bg-gray-800/g, 'bg-slate-200 dark:bg-gray-800');

// hover:bg-white/5 -> hover:bg-slate-100 dark:hover:bg-white/5
content = content.replace(/hover:bg-white\/5/g, 'hover:bg-slate-100 dark:hover:bg-white/5');

// text-slate-900 dark:text-white in the condition
content = content.replace(/text-gray-300 group-hover:text-slate-900 dark:text-white/g, 'text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white');

fs.writeFileSync('src/components/InterviewSetup.tsx', content);
console.log('Fixed InterviewSetup.tsx styles');
