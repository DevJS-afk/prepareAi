const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioBuilder.tsx', 'utf8');

code = code.replace(
  /<div className="bg-\\[#1a1a1a\\] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white\/10 p-6 shadow-2xl flex flex-col max-h-\[80vh\]">/,
  '<div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl flex flex-col max-h-[80vh]">'
);

fs.writeFileSync('src/components/PortfolioBuilder.tsx', code);
