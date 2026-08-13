const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{tokens < 3 && <span className="text-\[10px\] font-bold bg-brand-red\/10 text-brand-red px-1.5 rounded-sm">0<\/span>\}/g, '{tokens < 3 && <span className="text-[10px] font-bold bg-brand-red/10 text-brand-red px-1.5 rounded-sm">Low</span>}');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched badges");
