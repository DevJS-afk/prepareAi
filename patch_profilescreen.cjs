const fs = require('fs');

let code = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

code = code.replace(
    /className="glass-panel p-6 rounded-xl hover:bg-slate-100 dark:bg-white\/5 transition-all cursor-pointer group border border-slate-200 dark:border-white\/5 hover:border-brand-blue\/30 relative overflow-hidden"/g,
    'className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer group border border-transparent shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-white/10 relative overflow-hidden"'
);

fs.writeFileSync('src/components/ProfileScreen.tsx', code);
console.log('Patched ProfileScreen.tsx');
