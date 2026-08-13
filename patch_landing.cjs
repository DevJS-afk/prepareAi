const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

code = code.replace(
    'const [isMenuOpen, setIsMenuOpen] = useState(false);',
    'const [isMenuOpen, setIsMenuOpen] = useState(false);\n  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");'
);

code = code.replace(
    '<button className="bg-brand-purple text-white px-6 py-2 rounded-full text-sm font-bold shadow-md">Monthly</button>\n                      <button className="text-slate-600 dark:text-gray-400 px-6 py-2 rounded-full text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">\n                          Yearly <span className="text-brand-green text-xs font-bold">Save 20%</span>\n                      </button>',
    `<button onClick={() => setBillingCycle('monthly')} className={\`\${billingCycle === 'monthly' ? 'bg-brand-purple text-white shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors'} px-6 py-2 rounded-full text-sm font-bold\`}>Monthly</button>
                      <button onClick={() => setBillingCycle('yearly')} className={\`\${billingCycle === 'yearly' ? 'bg-brand-purple text-white shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors'} px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2\`}>
                          Yearly <span className={\`\${billingCycle === 'yearly' ? 'text-green-300' : 'text-brand-green'} text-xs font-bold\`}>Save 20%</span>
                      </button>`
);

code = code.replace(
    /<span className="text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">\$29<\/span>\s*<span className="text-slate-500 dark:text-gray-400 font-medium">\/month<\/span>/,
    `<span className="text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">{billingCycle === 'monthly' ? '$29' : '$279'}</span>
                          <span className="text-slate-500 dark:text-gray-400 font-medium">{billingCycle === 'monthly' ? '/month' : '/year'}</span>`
);

code = code.replace(
    /<span className="text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">\$99<\/span>\s*<span className="text-slate-500 dark:text-gray-400 font-medium">\/month<\/span>/,
    `<span className="text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">{billingCycle === 'monthly' ? '$99' : '$949'}</span>
                          <span className="text-slate-500 dark:text-gray-400 font-medium">{billingCycle === 'monthly' ? '/month' : '/year'}</span>`
);

fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log("Patched LandingPage.tsx");
