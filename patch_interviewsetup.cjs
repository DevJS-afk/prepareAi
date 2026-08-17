const fs = require('fs');

let code = fs.readFileSync('src/components/InterviewSetup.tsx', 'utf8');

// replace domain grid styling
code = code.replace(
    /bg-slate-200\/30 dark:bg-black\/20 border-slate-200 dark:border-white\/5 hover:bg-slate-100 dark:hover:bg-white\/5 hover:border-slate-300 dark:border-white\/20/g,
    'bg-white/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10 hover:shadow-sm hover:border-slate-200 dark:hover:border-white/10 shadow-sm'
);

code = code.replace(
    /bg-brand-blue\/10 border-brand-blue shadow-\[0_0_20px_rgba\(66,133,244,0\.2\)\]/g,
    'bg-brand-blue/10 border-brand-blue/30 shadow-[0_0_15px_rgba(66,133,244,0.1)] ring-1 ring-brand-blue/50'
);

// replace level grid styling
code = code.replace(
    /bg-brand-green\/10 border-brand-green shadow-\[0_0_20px_rgba\(52,168,83,0\.2\)\]/g,
    'bg-brand-green/10 border-brand-green/30 shadow-[0_0_15px_rgba(52,168,83,0.1)] ring-1 ring-brand-green/50'
);

// replace persona grid styling
code = code.replace(
    /bg-brand-yellow\/10 border-brand-yellow shadow-\[0_0_20px_rgba\(251,188,5,0\.2\)\]/g,
    'bg-brand-yellow/10 border-brand-yellow/30 shadow-[0_0_15px_rgba(251,188,5,0.1)] ring-1 ring-brand-yellow/50'
);

fs.writeFileSync('src/components/InterviewSetup.tsx', code);
console.log('Patched InterviewSetup.tsx grid styling');
