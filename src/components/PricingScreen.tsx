
import React from 'react';
import type { SubscriptionTier } from '../types';

interface PricingScreenProps {
  onBack: () => void;
  currentTier: SubscriptionTier;
  userId: string;
  onUpgrade: (plan: SubscriptionTier, price: string, name: string) => void;
}

const PricingScreen: React.FC<PricingScreenProps> = ({ onBack, currentTier, onUpgrade }) => {
  
  const handleSelectPlan = (tier: SubscriptionTier, price: string, name: string) => {
    if (tier === currentTier) return;
    onUpgrade(tier, price, name);
  };

  const PlanCard = ({ tier, price, name, features, popular = false }: { tier: SubscriptionTier, price: string, name: string, features: string[], popular?: boolean }) => {
    let sub = "Perfect for trying PrepareAI";
    if (tier === 'pro') sub = "For serious preparation";
    if (tier === 'recruiter') sub = "For teams & organizations";
      const isCurrent = currentTier === tier;
      
      return (
        <div className={`relative glass-panel rounded-3xl p-10 flex flex-col h-full border transition-all duration-500 hover:-translate-y-2 ${popular ? 'border-brand-purple/50 shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:shadow-[0_0_60px_rgba(168,85,247,0.25)] bg-gradient-to-b from-brand-purple/10 to-transparent' : 'border-slate-200 dark:border-white/5 bg-gradient-to-b from-slate-100 dark:from-white/5 to-transparent hover:border-slate-300 dark:hover:border-white/20'}`}>
             {popular && (
                 <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-brand-purple text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                     Most Popular
                 </div>
             )}
             <h3 className={`text-2xl font-display font-bold mb-2 ${popular ? 'text-brand-purple' : 'text-slate-900 dark:text-white'}`}>{name}</h3><p className="text-slate-500 dark:text-gray-400 text-sm mb-6">{sub}</p>
             <div className="flex items-baseline gap-1 mb-8">
                 <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">{price}</span>
                 {price !== 'Free' && <span className="text-slate-500 dark:text-gray-400 font-medium">/month</span>}
             </div>
             
             <ul className="space-y-4 mb-8 flex-1">
                 {features.map((feature, idx) => (
                     <li key={idx} className="flex items-center gap-3 text-sm text-slate-700 dark:text-gray-300">
                         <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${popular ? 'bg-brand-purple' : 'bg-brand-green'}`}></div>
                         {feature}
                     </li>
                 ))}
             </ul>

             <button
                onClick={() => handleSelectPlan(tier, price, name)}
                disabled={isCurrent}
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${
                    isCurrent 
                    ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-400 cursor-default border border-slate-200 dark:border-white/5' 
                    : popular 
                        ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200' 
                        : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10'
                }`}
             >
                 {isCurrent ? 'Current Plan' : (tier === 'free' ? 'Get Started Free' : tier === 'pro' ? '⚡ Start Pro' : 'Contact Sales')}
             </button>
        </div>
      );
  };

  return (
    <div className="w-full mx-auto animate-fade-in pb-12 py-8">
       <button onClick={onBack} className="mb-10 flex items-center gap-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Dashboard
       </button>
       
       <div className="text-center mb-12 animate-slide-up">
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
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PlanCard 
                tier="free"
                name="Free"
                price="$0"
                features={[
                    "5 free tokens included",
                    "3 tokens per interview",
                    "Basic curriculum generation",
                    "Flashcards & quizzes",
                    "Success probability score"
                ]}
            />
            <PlanCard 
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
            />
            <PlanCard 
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
            />
       </div>
    </div>
  );
};

export default PricingScreen;
