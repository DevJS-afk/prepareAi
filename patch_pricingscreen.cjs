const fs = require('fs');

let code = fs.readFileSync('src/components/PricingScreen.tsx', 'utf8');

code = code.replace(/<div className="text-center mb-16">[\s\S]*?<\/div>/, `<div className="text-center mb-12 animate-slide-up">
           <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">Simple, Transparent Pricing</h1>
           <p className="text-xl text-slate-500 dark:text-gray-400 max-w-2xl mx-auto font-light">Start free, upgrade when you need more power</p>
       </div>

       <div className="flex justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
           <div className="bg-slate-200/50 dark:bg-white/5 p-1 rounded-full border border-slate-300/50 dark:border-white/10 flex items-center inline-flex">
               <button className="bg-brand-purple text-white px-6 py-2 rounded-full text-sm font-bold shadow-md">Monthly</button>
               <button className="text-slate-600 dark:text-gray-400 px-6 py-2 rounded-full text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
                   Yearly <span className="text-brand-green text-xs font-bold">Save 20%</span>
               </button>
           </div>
       </div>`);

code = code.replace(/<PlanCard\s+tier="free"[\s\S]*?\/>/, `<PlanCard 
                tier="free"
                name="Free"
                price="$0"
                features={[
                    "1 active event",
                    "10 AI calls per day",
                    "Basic curriculum generation",
                    "Flashcards & quizzes",
                    "Success probability score"
                ]}
            />`);

code = code.replace(/<PlanCard\s+tier="pro"[\s\S]*?\/>/, `<PlanCard 
                tier="pro"
                name="Pro"
                price="$29"
                popular={true}
                features={[
                    "Unlimited events",
                    "Unlimited AI calls",
                    "Document uploads",
                    "Mock simulations & interviews",
                    "Advanced analytics",
                    "Priority AI tutor",
                    "Adaptive difficulty"
                ]}
            />`);

code = code.replace(/<PlanCard\s+tier="recruiter"[\s\S]*?\/>/, `<PlanCard 
                tier="recruiter"
                name="Enterprise"
                price="$99"
                features={[
                    "Everything in Pro",
                    "Team dashboards",
                    "Custom integrations",
                    "Admin analytics",
                    "Dedicated support",
                    "Custom domain",
                    "SLA guarantee"
                ]}
            />`);

// Update the plan card button logic for the new copy
code = code.replace(/{isCurrent \? 'Current Plan' : \(tier === 'free' \? 'Downgrade' : 'Choose Plan'\)}/, `{isCurrent ? 'Current Plan' : (tier === 'free' ? 'Get Started Free' : tier === 'pro' ? '⚡ Start Pro' : 'Contact Sales')}`);

// Also fix the PlanCard styling to be more aligned with LandingPage
code = code.replace(/const PlanCard = \(\{ tier, price, name, features, popular = false \}.*?\{/, `const PlanCard = ({ tier, price, name, features, popular = false }: { tier: SubscriptionTier, price: string, name: string, features: string[], popular?: boolean }) => {
    let sub = "Perfect for trying PrepareAI";
    if (tier === 'pro') sub = "For serious preparation";
    if (tier === 'recruiter') sub = "For teams & organizations";`);

code = code.replace(/<h3 className={`text-2xl font-display font-bold mb-2 \${popular \? 'text-brand-purple' : 'text-slate-900 dark:text-white'}`}>{name}<\/h3>/, `<h3 className={\`text-2xl font-display font-bold mb-2 \${popular ? 'text-brand-purple' : 'text-slate-900 dark:text-white'}\`}>{name}</h3><p className="text-slate-500 dark:text-gray-400 text-sm mb-6">{sub}</p>`);

fs.writeFileSync('src/components/PricingScreen.tsx', code);
console.log('Patched PricingScreen.tsx');
