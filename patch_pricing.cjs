const fs = require('fs');
let code = fs.readFileSync('src/components/PricingScreen.tsx', 'utf8');

code = code.replace(
    'const PricingScreen: React.FC<PricingScreenProps> = ({ onBack, currentTier, onUpgrade }) => {',
    'const PricingScreen: React.FC<PricingScreenProps> = ({ onBack, currentTier, onUpgrade }) => {\n  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">("monthly");'
);

code = code.replace(
    'const PlanCard = ({ tier, price, name, features, popular = false }: { tier: SubscriptionTier, price: string, name: string, features: string[], popular?: boolean }) => {',
    'const PlanCard = ({ tier, price, name, features, popular = false, isYearly = false }: { tier: SubscriptionTier, price: string, name: string, features: string[], popular?: boolean, isYearly?: boolean }) => {'
);

code = code.replace(
    '{price !== \'Free\' && <span className="text-slate-500 dark:text-gray-400 font-medium">/month</span>}',
    '{price !== \'$0\' && <span className="text-slate-500 dark:text-gray-400 font-medium">{isYearly ? "/year" : "/month"}</span>}'
);

code = code.replace(
    '<button className="bg-brand-purple text-white px-6 py-2 rounded-full text-sm font-bold shadow-md">Monthly</button>\n               <button className="text-slate-600 dark:text-gray-400 px-6 py-2 rounded-full text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">\n                   Yearly <span className="text-brand-green text-xs font-bold">Save 20%</span>\n               </button>',
    `<button onClick={() => setBillingCycle('monthly')} className={\`\${billingCycle === 'monthly' ? 'bg-brand-purple text-white shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors'} px-6 py-2 rounded-full text-sm font-bold\`}>Monthly</button>
               <button onClick={() => setBillingCycle('yearly')} className={\`\${billingCycle === 'yearly' ? 'bg-brand-purple text-white shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors'} px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2\`}>
                   Yearly <span className={\`\${billingCycle === 'yearly' ? 'text-green-300' : 'text-brand-green'} text-xs font-bold\`}>Save 20%</span>
               </button>`
);

code = code.replace(
    'price="$29"',
    'price={billingCycle === "monthly" ? "$29" : "$279"}\n                isYearly={billingCycle === "yearly"}'
);

code = code.replace(
    'price="$99"',
    'price={billingCycle === "monthly" ? "$99" : "$949"}\n                isYearly={billingCycle === "yearly"}'
);

// fix Free
code = code.replace(
    'price="$0"',
    'price="$0"\n                isYearly={billingCycle === "yearly"}'
);

fs.writeFileSync('src/components/PricingScreen.tsx', code);
console.log("Patched PricingScreen.tsx");
