const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioBuilder.tsx', 'utf8');

code = code.replace(
  '<div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-200/70 dark:bg-black/40">',
  '<div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-slate-200/70 dark:bg-black/40 relative">'
);

code = code.replace(
  '<div className="lg:w-[400px] xl:w-[450px] flex flex-col border-r border-slate-200 dark:border-white/5 bg-slate-200/30 dark:bg-black/20 overflow-y-auto custom-scrollbar p-6 space-y-8">',
  '<div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/5 bg-slate-200/30 dark:bg-black/20 lg:overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 sm:space-y-8 lg:h-full shrink-0">'
);

code = code.replace(
  '<div className="flex-1 bg-white dark:bg-[#1a1a1a] p-0 overflow-hidden relative flex flex-col">',
  '<div className="flex-1 min-h-[500px] lg:min-h-0 bg-white dark:bg-[#1a1a1a] p-0 lg:overflow-hidden relative flex flex-col">'
);

fs.writeFileSync('src/components/PortfolioBuilder.tsx', code);
console.log("Done");
