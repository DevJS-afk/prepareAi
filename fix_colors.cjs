const fs = require('fs');
let code = fs.readFileSync('src/components/InterviewSetup.tsx', 'utf8');

// Fix 1: Persona Card unselected title color
code = code.replace(
    "<h4 className={`text-lg font-bold mb-2 ${selectedPersona === key ? 'text-brand-yellow' : 'text-gray-200'}`}>{persona.name}</h4>",
    "<h4 className={`text-lg font-bold mb-2 ${selectedPersona === key ? 'text-brand-yellow' : 'text-slate-900 dark:text-gray-200'}`}>{persona.name}</h4>"
);

// Fix 2: Experience level badge unselected colors
code = code.replace(
    "bg-gray-700 text-slate-600 dark:text-gray-400",
    "bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300"
);

fs.writeFileSync('src/components/InterviewSetup.tsx', code);
console.log("Fixed colors");
