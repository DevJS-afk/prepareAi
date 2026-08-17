const fs = require('fs');
let code = fs.readFileSync('src/components/MotivationLetter.tsx', 'utf8');

code = code.replace(
  '<div className="w-full glass-panel rounded-2xl p-6 md:p-10 animate-fade-in flex flex-col h-[85vh]">',
  '<div className="w-full h-full md:h-[85vh] glass-panel md:rounded-2xl p-4 md:p-10 animate-fade-in flex flex-col relative overflow-hidden">'
);

code = code.replace(
  '<div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">',
  '<div className="flex flex-col md:flex-row gap-4 md:gap-8 flex-1 overflow-y-auto md:overflow-hidden relative">'
);

code = code.replace(
  '<div className="md:w-1/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">',
  '<div className="w-full md:w-1/3 flex flex-col gap-4 md:overflow-y-auto custom-scrollbar pr-0 md:pr-2 shrink-0">'
);

code = code.replace(
  '<div className="md:w-2/3 bg-white text-gray-800 rounded-xl p-8 overflow-y-auto shadow-inner relative">',
  '<div className="w-full md:w-2/3 min-h-[500px] md:min-h-0 bg-white text-gray-800 rounded-xl p-4 md:p-8 md:overflow-y-auto shadow-inner relative flex-1">'
);

fs.writeFileSync('src/components/MotivationLetter.tsx', code);
console.log("Done");
