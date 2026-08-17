const fs = require('fs');
let content = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

// 1. Update TabView type
content = content.replace(
    "type TabView = 'history' | 'cvs' | 'letters' | 'portfolios';", 
    "type TabView = 'history' | 'progress' | 'cvs' | 'letters' | 'portfolios';"
);

// 2. Add Recharts imports
const importTarget = "import { updateEmail, updatePassword } from 'firebase/auth';";
const importReplacement = `${importTarget}\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';`;
if (!content.includes('recharts')) {
    content = content.replace(importTarget, importReplacement);
}

// 3. Add Progress Tab Button
const historyTabStr = `                  <button \n                    onClick={() => setActiveTab('history')}\n                    className={\`pb-2 text-sm font-bold transition-colors whitespace-nowrap \${activeTab === 'history' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white'}\`}\n                  >\n                      Session History\n                  </button>`;

const progressTabStr = `                  <button \n                    onClick={() => setActiveTab('progress')}\n                    className={\`pb-2 text-sm font-bold transition-colors whitespace-nowrap \${activeTab === 'progress' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white'}\`}\n                  >\n                      Progress\n                  </button>`;

if (!content.includes("setActiveTab('progress')")) {
    content = content.replace(historyTabStr, historyTabStr + '\n' + progressTabStr);
}

fs.writeFileSync('src/components/ProfileScreen.tsx', content);
console.log('Progress tab button and types added');
