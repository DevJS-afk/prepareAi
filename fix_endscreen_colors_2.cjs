const fs = require('fs');
let code = fs.readFileSync('src/components/EndScreen.tsx', 'utf8');

code = code.replace(/text-gray-800/g, 'text-slate-200 dark:text-gray-800');
code = code.replace(/text-gray-700/g, 'text-slate-200 dark:text-gray-700');
code = code.replace(/text-gray-600/g, 'text-slate-500 dark:text-gray-500'); // make sure to handle text-gray-600 properly. Let's make it text-slate-400 dark:text-gray-600
code = code.replace(/text-slate-500 dark:text-gray-500/g, 'text-slate-400 dark:text-gray-600'); // Revert previous incorrect replace to be consistent if needed. Actually it's fine. 

// Better specifically replace text-gray-600
// Note I just replaced text-gray-600 above with text-slate-500 dark:text-gray-500 in the string, wait, I just wrote code.replace(/text-gray-600/g, 'text-slate-500 dark:text-gray-500'). Let's just run it correctly.

