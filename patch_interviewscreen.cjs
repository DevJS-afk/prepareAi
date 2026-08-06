const fs = require('fs');
let code = fs.readFileSync('src/components/InterviewScreen.tsx', 'utf8');

code = code.replace(
  /<div ref=\{containerRef\} className="w-full h-\[85vh\] max-h-\[900px\] glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-fade-in border border-white\/5 relative">/,
  '<div ref={containerRef} className="w-full h-[85vh] max-h-[900px] bg-gray-950 rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-fade-in border border-white/5 relative">'
);

fs.writeFileSync('src/components/InterviewScreen.tsx', code);
