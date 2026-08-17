const fs = require('fs');
let code = fs.readFileSync('src/components/EndScreen.tsx', 'utf8');

// Replace text-white where it isn't part of another class like hover:text-white
// Be careful with buttons and other places where it should stay white.
// In EndScreen.tsx, we have a few buttons.

code = code.replace(/text-white/g, 'text-slate-900 dark:text-white');
// Revert for buttons
code = code.replace(/text-slate-900 dark:text-white focus:outline-none/g, 'text-slate-900 dark:text-white focus:outline-none'); 
code = code.replace(/bg-brand-purple py-4 rounded-xl font-bold text-slate-900 dark:text-white/g, 'bg-brand-purple py-4 rounded-xl font-bold text-white');

// For <select className="bg-slate-900 text-slate-900 dark:text-white">
code = code.replace(/className="bg-slate-900 text-slate-900 dark:text-white"/g, 'className="bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white"');

// Fix text-gray-*
code = code.replace(/text-gray-200/g, 'text-slate-700 dark:text-gray-200');
code = code.replace(/text-gray-300/g, 'text-slate-600 dark:text-gray-300');
code = code.replace(/text-gray-400/g, 'text-slate-500 dark:text-gray-400');
code = code.replace(/text-gray-500/g, 'text-slate-500 dark:text-gray-500');

// Fix borders border-white/5 etc -> border-slate-200 dark:border-white/5
code = code.replace(/border-white\/5/g, 'border-slate-200 dark:border-white/5');
code = code.replace(/border-white\/10/g, 'border-slate-200 dark:border-white/10');
code = code.replace(/bg-white\/5/g, 'bg-slate-100 dark:bg-white/5');
code = code.replace(/bg-black\/20/g, 'bg-slate-100 dark:bg-black/20');
code = code.replace(/bg-brand-purple\/15 border-brand-purple\/30/g, 'bg-brand-purple/10 dark:bg-brand-purple/15 border-brand-purple/20 dark:border-brand-purple/30');

// Fix back/next buttons at the bottom.
// <button onClick={onRestart} className="w-full bg-white py-4 rounded-xl font-bold text-black">
code = code.replace(/bg-white py-4 rounded-xl font-bold text-black/g, 'bg-slate-200 dark:bg-white py-4 rounded-xl font-bold text-slate-900 dark:text-black');

fs.writeFileSync('src/components/EndScreen.tsx', code);
console.log("Fixed EndScreen colors");
