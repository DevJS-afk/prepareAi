const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes("import { Toaster, toast } from 'sonner';")) {
  appCode = appCode.replace("import React,", "import { Toaster, toast } from 'sonner';\nimport React,");
}

if (!appCode.includes("<Toaster position=")) {
  appCode = appCode.replace(/<div className="min-h-screen relative flex flex-col items-center bg-slate-50 dark:bg-\[\#030712\] text-slate-800 dark:text-white transition-colors duration-300">/, "<div className=\"min-h-screen relative flex flex-col items-center bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-white transition-colors duration-300\">\n       <Toaster position=\"top-center\" richColors theme=\"system\" />");
}

appCode = appCode.replace(/alert\(/g, "toast.error("); // Or maybe toast( for neutral ones? The token one is an error/warning.

fs.writeFileSync('src/App.tsx', appCode);
