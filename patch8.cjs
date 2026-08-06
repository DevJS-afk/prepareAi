const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /className={`text-sm font-bold transition-all px-3 py-1\.5 rounded-full border \${location.pathname === '\/pricing' \? 'bg-brand-yellow text-black border-brand-yellow' : 'bg-transparent text-brand-yellow border-brand-yellow hover:bg-brand-yellow\/10'}`}/g,
  "className={`text-sm font-bold transition-all px-4 py-1.5 rounded-full ${location.pathname === '/pricing' ? 'bg-brand-yellow text-black' : 'bg-gradient-to-r from-brand-yellow to-yellow-400 text-black shadow hover:shadow-md transform hover:-translate-y-0.5'}`}"
);

fs.writeFileSync('src/App.tsx', code);
