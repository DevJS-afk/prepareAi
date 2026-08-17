const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioBuilder.tsx', 'utf8');

code = code.replace(
  '<div className="w-[90vw] h-[90vh] flex flex-col glass-panel rounded-2xl overflow-hidden animate-fade-in shadow-2xl relative">',
  '<div className="w-full h-[100dvh] sm:w-[95vw] sm:h-[95vh] md:w-[90vw] md:h-[90vh] flex flex-col glass-panel sm:rounded-2xl overflow-hidden animate-fade-in shadow-2xl relative">'
);

code = code.replace(
  '<div className="h-16 border-b border-slate-200 dark:border-white/10 bg-slate-200/30 dark:bg-black/20 flex items-center justify-between px-6 shrink-0 backdrop-blur-md">\n            <div className="flex items-center gap-4">',
  '<div className="min-h-[4rem] border-b border-slate-200 dark:border-white/10 bg-slate-200/30 dark:bg-black/20 flex flex-col md:flex-row items-center justify-between p-4 md:px-6 shrink-0 backdrop-blur-md gap-4">\n            <div className="flex items-center gap-4 w-full md:w-auto">'
);

code = code.replace(
  '</div>\n            \n            <div className="flex items-center gap-3">',
  '</div>\n            \n            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 justify-start md:justify-end custom-scrollbar shrink-0">'
);

fs.writeFileSync('src/components/PortfolioBuilder.tsx', code);
console.log("Done");
