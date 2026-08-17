const fs = require('fs');

function updateLandingPage() {
    let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

    const newPricingSection = `      {/* Pricing Section */}
      <section id="pricing" className="w-full py-24 relative z-10 border-t border-slate-200/80 dark:border-white/5 bg-slate-100/50 dark:bg-black/40 backdrop-blur-sm transition-colors duration-300">
         <div className="mx-auto px-6 max-w-6xl">
              <div className="text-center mb-12 animate-slide-up">
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-950 dark:text-white mb-6">Simple, Transparent Pricing</h2>
                  <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Start free, upgrade when you need more power</p>
              </div>

              <div className="flex justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="bg-slate-200/50 dark:bg-white/5 p-1 rounded-full border border-slate-300/50 dark:border-white/10 flex items-center inline-flex">
                      <button className="bg-brand-purple text-white px-6 py-2 rounded-full text-sm font-bold shadow-md">Monthly</button>
                      <button className="text-slate-600 dark:text-gray-400 px-6 py-2 rounded-full text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
                          Yearly <span className="text-brand-green text-xs font-bold">Save 20%</span>
                      </button>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  {/* Free */}
                  <div className="glass-panel p-10 rounded-3xl border border-slate-200/80 dark:border-white/5 flex flex-col hover:border-slate-300/80 dark:hover:border-white/20 transition-all duration-300 bg-gradient-to-b from-slate-100/30 to-transparent dark:from-white/5 shadow-sm text-left">
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-white mb-2 font-display">Free</h3>
                      <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">Perfect for trying PrepareAI</p>
                      <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">$0</span>
                          <span className="text-slate-500 dark:text-gray-400 font-medium">/month</span>
                      </div>
                      <button onClick={onSignup} className="w-full py-3 mb-8 rounded-xl font-bold bg-slate-900/5 hover:bg-slate-900/10 text-slate-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white transition-all border border-slate-200 dark:border-white/10 shadow-sm">Get Started Free</button>
                      <ul className="space-y-4 flex-1 text-slate-700 dark:text-gray-300 text-sm">
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> 1 active event</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> 10 AI calls per day</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Basic curriculum generation</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Flashcards & quizzes</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Success probability score</li>
                      </ul>
                  </div>

                  {/* Pro */}
                  <div className="glass-panel p-10 rounded-3xl border border-brand-purple/50 flex flex-col relative transform md:-translate-y-4 shadow-lg shadow-brand-purple/10 dark:shadow-[0_0_50px_rgba(168,85,247,0.15)] hover:shadow-xl hover:shadow-brand-purple/20 transition-all duration-300 bg-gradient-to-b from-brand-purple/5 to-transparent dark:from-brand-purple/10 text-left">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-brand-purple text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-lg border border-white/20">Most Popular</div>
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-white mb-2 font-display">Pro</h3>
                      <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">For serious preparation</p>
                      <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">$29</span>
                          <span className="text-slate-500 dark:text-gray-400 font-medium">/month</span>
                      </div>
                      <button onClick={onSignup} className="w-full py-3 mb-8 rounded-xl font-bold bg-gradient-to-r from-brand-purple to-blue-500 hover:opacity-90 text-white transition-all shadow-md flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                          Start Pro
                      </button>
                      <ul className="space-y-4 flex-1 text-slate-700 dark:text-gray-300 text-sm">
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Unlimited events</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Unlimited AI calls</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Document uploads</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Mock simulations & interviews</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Advanced analytics</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Priority AI tutor</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Adaptive difficulty</li>
                      </ul>
                  </div>

                  {/* Enterprise */}
                  <div className="glass-panel p-10 rounded-3xl border border-slate-200/80 dark:border-white/5 flex flex-col hover:border-slate-300/80 dark:hover:border-white/20 transition-all duration-300 bg-gradient-to-b from-slate-100/30 to-transparent dark:from-white/5 shadow-sm text-left">
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-white mb-2 font-display">Enterprise</h3>
                      <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">For teams & organizations</p>
                      <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">$99</span>
                          <span className="text-slate-500 dark:text-gray-400 font-medium">/month</span>
                      </div>
                      <button onClick={onSignup} className="w-full py-3 mb-8 rounded-xl font-bold bg-slate-900/5 hover:bg-slate-900/10 text-slate-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white transition-all border border-slate-200 dark:border-white/10 shadow-sm">Contact Sales</button>
                      <ul className="space-y-4 flex-1 text-slate-700 dark:text-gray-300 text-sm">
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Everything in Pro</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Team dashboards</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Custom integrations</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Admin analytics</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Dedicated support</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Custom domain</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> SLA guarantee</li>
                      </ul>
                  </div>
              </div>
         </div>
      </section>`;

    const startIdx = code.indexOf('{/* Pricing Section */}');
    const endIdx = code.indexOf('</section>', startIdx) + 10;
    
    if (startIdx !== -1 && endIdx > startIdx) {
        code = code.substring(0, startIdx) + newPricingSection + code.substring(endIdx);
        fs.writeFileSync('src/components/LandingPage.tsx', code);
        console.log('Updated LandingPage.tsx pricing section.');
    } else {
        console.log('Could not find Pricing Section in LandingPage.tsx');
    }
}

updateLandingPage();
