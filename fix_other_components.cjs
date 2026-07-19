const fs = require('fs');

const filesToFix = [
  'src/components/JobBoard.tsx',
  'src/components/CVBuilder.tsx',
  'src/components/MotivationLetter.tsx',
  'src/components/PortfolioBuilder.tsx'
];

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');

  // Replace text-white where it's likely used for main text
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
  
  // Also hover gradient stuff
  content = content.replace(/to-blue-700 text-slate-900 dark:text-white/g, 'to-blue-700 text-white');
  content = content.replace(/to-purple-700 text-slate-900 dark:text-white/g, 'to-purple-700 text-white');

  // bg-black/30 or bg-black/40 or bg-black/50 to bg-slate-100 dark:bg-black/X
  content = content.replace(/(?<!dark:)bg-black\/30/g, 'bg-slate-200/50 dark:bg-black/30');
  content = content.replace(/(?<!dark:)bg-black\/40/g, 'bg-slate-200/70 dark:bg-black/40');
  content = content.replace(/(?<!dark:)bg-black\/50/g, 'bg-slate-200/80 dark:bg-black/50');
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

  // remove text-white from options in light mode
  content = content.replace(/className="bg-slate-100 dark:bg-slate-900 text-white"/g, 'className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white"');
  content = content.replace(/className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"/g, 'className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"');

  fs.writeFileSync(file, content);
});

console.log('Fixed other component styles');
