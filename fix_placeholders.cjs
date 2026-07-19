const fs = require('fs');

const files = ['src/components/InterviewerDashboard.tsx', 'src/components/CVBuilder.tsx', 'src/components/InterviewSetup.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/placeholder-gray-600/g, 'placeholder-slate-400 dark:placeholder-gray-600');
  content = content.replace(/placeholder-gray-500/g, 'placeholder-slate-400 dark:placeholder-gray-500');
  fs.writeFileSync(file, content);
});

console.log('Fixed placeholders');
