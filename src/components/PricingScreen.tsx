
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
      const isCurrent = currentTier === tier;
      
      return (
        <div className={`relative glass-panel rounded-3xl p-10 flex flex-col h-full border transition-all duration-500 hover:-translate-y-2 ${popular ? 'border-brand-purple/50 shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:shadow-[0_0_60px_rgba(168,85,247,0.25)] bg-gradient-to-b from-brand-purple/10 to-transparent' : 'border-white/5 bg-gradient-to-b from-white/5 to-transparent hover:border-white/20'}`}>
             {popular && (
                 <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-brand-purple text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                     Most Popular
                 </div>
             )}
             <h3 className={`text-2xl font-display font-bold mb-2 ${popular ? 'text-brand-purple' : 'text-white'}`}>{name}</h3>
             <div className="flex items-baseline gap-1 mb-8">
                 <span className="text-5xl font-extrabold text-white tracking-tight">{price}</span>
                 {price !== 'Free' && <span className="text-gray-400 font-medium">/month</span>}
             </div>
             
             <ul className="space-y-4 mb-8 flex-1">
                 {features.map((feature, idx) => (
                     <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
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
                    ? 'bg-white/5 text-gray-400 cursor-default border border-white/5' 
                    : popular 
                        ? 'bg-white text-black hover:bg-gray-200' 
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
             >
                 {isCurrent ? 'Current Plan' : (tier === 'free' ? 'Downgrade' : 'Choose Plan')}
             </button>
        </div>
      );
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-12 py-8">
       <button onClick={onBack} className="mb-10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Dashboard
       </button>
       
       <div className="text-center mb-16">
           <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Choose Your Path to Success</h1>
           <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">Unlock advanced AI interview features or streamline your hiring process with our dedicated plans.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PlanCard 
                tier="free"
                name="Starter"
                price="Free"
                features={[
                    "1 Full AI Interview Session",
                    "Basic Performance Report",
                    "Standard CV Builder Access",
                    "Limited Feedback"
                ]}
            />
            <PlanCard 
                tier="pro"
                name="Pro Candidate"
                price="$15"
                popular={true}
                features={[
                    "Unlimited AI Interview Sessions",
                    "Advanced Behavioral Analysis",
                    "Unlimited CV & Portfolio Builds",
                    "Priority AI Processing",
                    "Deep Feedback & Action Plans",
                    "Access to all Domain Roles"
                ]}
            />
            <PlanCard 
                tier="recruiter"
                name="Recruiter / Enterprise"
                price="$49"
                features={[
                    "Everything in Pro",
                    "Invite & Manage Candidates",
                    "View Candidate Reports",
                    "Custom Interview Configuration",
                    "Team Dashboard Access",
                    "Dedicated Support"
                ]}
            />
       </div>
    </div>
  );
};

export default PricingScreen;
