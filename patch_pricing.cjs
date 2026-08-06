const fs = require('fs');
let code = fs.readFileSync('src/components/PricingScreen.tsx', 'utf8');

code = code.replace(
  /className={`relative glass-panel rounded-3xl p-10 flex flex-col h-full border transition-all duration-500 hover:-translate-y-2 \$\{popular \? 'border-brand-purple\/50 shadow-\[0_0_40px_rgba\(168,85,247,0\.15\)\] hover:shadow-\[0_0_60px_rgba\(168,85,247,0\.25\)\] bg-gradient-to-b from-brand-purple\/10 to-transparent' : 'border-white\/5 bg-gradient-to-b from-white\/5 to-transparent hover:border-white\/20'\}`}/g,
  "className={`relative glass-panel rounded-3xl p-10 flex flex-col h-full border transition-all duration-500 hover:-translate-y-2 ${popular ? 'border-brand-purple/50 shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:shadow-[0_0_60px_rgba(168,85,247,0.25)] bg-gradient-to-b from-brand-purple/10 to-transparent' : 'border-slate-200 dark:border-white/5 bg-gradient-to-b from-slate-100 dark:from-white/5 to-transparent hover:border-slate-300 dark:hover:border-white/20'}`}"
);

code = code.replace(
  /className={`text-2xl font-display font-bold mb-2 \$\{popular \? 'text-brand-purple' : 'text-white'\}`}/g,
  "className={`text-2xl font-display font-bold mb-2 ${popular ? 'text-brand-purple' : 'text-slate-900 dark:text-white'}`}"
);

code = code.replace(
  /<span className="text-5xl font-extrabold text-white tracking-tight">/g,
  '<span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">'
);

code = code.replace(
  /<span className="text-gray-400 font-medium">\/month<\/span>/g,
  '<span className="text-slate-500 dark:text-gray-400 font-medium">/month</span>'
);

code = code.replace(
  /className="flex items-center gap-3 text-sm text-gray-300"/g,
  'className="flex items-center gap-3 text-sm text-slate-700 dark:text-gray-300"'
);

code = code.replace(
  /'bg-white\/5 text-gray-400 cursor-default border border-white\/5'/g,
  "'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-400 cursor-default border border-slate-200 dark:border-white/5'"
);

code = code.replace(
  /'bg-white text-black hover:bg-gray-200'/g,
  "'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'"
);

code = code.replace(
  /'bg-white\/10 text-white hover:bg-white\/20 border border-white\/10'/g,
  "'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10'"
);

code = code.replace(
  /className="mb-10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"/g,
  'className="mb-10 flex items-center gap-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors group"'
);

code = code.replace(
  /className="text-4xl md:text-5xl font-display font-bold text-white mb-6"/g,
  'className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6"'
);

code = code.replace(
  /className="text-xl text-gray-400 max-w-2xl mx-auto font-light"/g,
  'className="text-xl text-slate-500 dark:text-gray-400 max-w-2xl mx-auto font-light"'
);

fs.writeFileSync('src/components/PricingScreen.tsx', code);
