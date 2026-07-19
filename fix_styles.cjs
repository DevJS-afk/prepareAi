const fs = require('fs');

const filesToFix = [
  'src/components/AdminDashboard.tsx',
  'src/components/InterviewerDashboard.tsx',
  'src/components/ProfileScreen.tsx',
  'src/components/InterviewSetup.tsx'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');

  // Replace text-white where it's likely used for main text, but carefully.
  content = content.replace(/(?<!dark:)(?<!text-)text-white/g, 'text-slate-900 dark:text-white');
  
  // Revert buttons and elements with explicit colors
  content = content.replace(/bg-brand-([a-z]+) text-slate-900 dark:text-white/g, 'bg-brand-$1 text-white');
  content = content.replace(/bg-slate-900 text-slate-900 dark:text-white/g, 'bg-slate-900 text-white');
  content = content.replace(/bg-slate-950 text-slate-900 dark:text-white/g, 'bg-slate-950 text-white');
  content = content.replace(/bg-red-500 text-slate-900 dark:text-white/g, 'bg-red-500 text-white');
  content = content.replace(/bg-blue-600 text-slate-900 dark:text-white/g, 'bg-blue-600 text-white');
  content = content.replace(/bg-black text-slate-900 dark:text-white/g, 'bg-black text-white');

  // Some button classes have text-white before the bg- class
  content = content.replace(/text-slate-900 dark:text-white(\s*[^>]*?(?:bg-brand-[a-z]+|bg-slate-900|bg-red-500))/g, 'text-white$1');
  
  // bg-black/30 or bg-black/40 to bg-slate-100 dark:bg-black/40
  content = content.replace(/(?<!dark:)bg-black\/30/g, 'bg-slate-200/50 dark:bg-black/30');
  content = content.replace(/(?<!dark:)bg-black\/40/g, 'bg-slate-200/70 dark:bg-black/40');
  content = content.replace(/(?<!dark:)bg-black\/20/g, 'bg-slate-200/30 dark:bg-black/20');
  
  // bg-slate-900 inside dropdowns/selects
  content = content.replace(/(?<!dark:)bg-slate-900/g, 'bg-white dark:bg-slate-900');
  content = content.replace(/(?<!dark:)bg-slate-800/g, 'bg-slate-100 dark:bg-slate-800');
  
  // text-gray-400 to text-slate-600 dark:text-gray-400
  content = content.replace(/(?<!dark:)text-gray-400/g, 'text-slate-600 dark:text-gray-400');
  content = content.replace(/(?<!dark:)text-gray-500/g, 'text-slate-500 dark:text-gray-500');

  // border-white/10 to border-slate-200 dark:border-white/10
  content = content.replace(/(?<!dark:)border-white\/5/g, 'border-slate-200 dark:border-white/5');
  content = content.replace(/(?<!dark:)border-white\/10/g, 'border-slate-200 dark:border-white/10');
  content = content.replace(/(?<!dark:)border-white\/20/g, 'border-slate-300 dark:border-white/20');

  // Remove redundant classes if created
  content = content.replace(/text-slate-900 dark:text-slate-900 dark:text-white/g, 'text-slate-900 dark:text-white');

  fs.writeFileSync(file, content);
});

console.log('Fixed styles in components');
