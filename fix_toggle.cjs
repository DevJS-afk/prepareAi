const fs = require('fs');
let code = fs.readFileSync('src/components/InterviewSetup.tsx', 'utf8');

code = code.replace(
    "isPracticeMode ? 'bg-brand-green' : 'bg-gray-700'",
    "isPracticeMode ? 'bg-brand-green' : 'bg-slate-300 dark:bg-gray-700'"
);

fs.writeFileSync('src/components/InterviewSetup.tsx', code);
console.log("Fixed toggle");
