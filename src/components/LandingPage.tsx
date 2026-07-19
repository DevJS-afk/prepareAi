import React from 'react';
import { useTranslation } from 'react-i18next';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
  onAbout: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onAbout, onPrivacy, onTerms, theme, toggleTheme }) => {
  const { t, i18n } = useTranslation();

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-white transition-colors duration-300 selection:bg-brand-purple selection:text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand-blue/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-brand-purple/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-brand-green/5 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] dark:opacity-[0.05]"></div>
      </div>

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-purple rounded-xl opacity-80 group-hover:opacity-100 transition-opacity blur-sm"></div>
                <div className="relative w-full h-full bg-slate-900 dark:bg-black/50 rounded-xl border border-white/10 flex items-center justify-center backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.5 1.43 4.15 4.14 4.15 7.41 0 1.25-.36 2.42-1.05 3.4z"/></svg>
                </div>
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-slate-950 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-gray-400 transition-all">
                prepare<span className="text-brand-blue">AI</span>
            </span>
        </div>
        <div className="flex items-center gap-6 md:gap-8">
            <div className="hidden md:flex items-center gap-6">
                <button onClick={onAbout} className="text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors relative group">
                    About
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-blue transition-all group-hover:w-full"></span>
                </button>
                <button onClick={scrollToPricing} className="text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors relative group">
                    Pricing
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-purple transition-all group-hover:w-full"></span>
                </button>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
                <button onClick={onLogin} className="text-sm font-bold text-slate-700 dark:text-white hover:text-brand-blue dark:hover:text-brand-blue transition-colors">{t('landing.login')}</button>
                <button onClick={onSignup} className="px-4 py-2 bg-slate-950 text-white dark:bg-white dark:text-black rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-gray-100 transition-all shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]">{t('landing.getStarted')}</button>
                
                {toggleTheme && (<>
                  <button 
                    onClick={toggleTheme} 
                    className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 transition-colors duration-200 flex items-center justify-center"
                    aria-label="Toggle Theme"
                    id="landing-theme-toggle"
                  >
                    {theme === 'dark' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>
                  <select
                      className="bg-transparent border-none text-slate-600 dark:text-gray-300 text-sm font-medium focus:ring-0 cursor-pointer outline-none uppercase"
                      value={i18n.language.split('-')[0]}
                      onChange={(e) => i18n.changeLanguage(e.target.value)}
                    >
                      <option value="en" className="bg-white dark:bg-slate-800">EN</option>
                      <option value="fr" className="bg-white dark:bg-slate-800">FR</option>
                      <option value="es" className="bg-white dark:bg-slate-800">ES</option>
                  </select>
                </>)}
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center px-6 text-center z-10 pt-16 pb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-300/60 dark:border-white/10 mb-8 animate-fade-in hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-default backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Powered by Gemini 2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-display font-bold text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.1] max-w-5xl animate-slide-up text-glow">
              {t('landing.heroTitle1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-purple to-brand-red">{t('landing.heroTitle2')}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-gray-400 max-w-2xl mb-12 leading-relaxed animate-slide-up font-light" style={{ animationDelay: '0.1s' }}>
              {t('landing.heroSubtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <button onClick={onSignup} className="group relative px-8 py-4 bg-brand-blue rounded-xl font-bold text-lg text-white overflow-hidden transition-all hover:scale-105 shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:shadow-brand-blue/30">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span>{t('landing.startFree')}</span>
              </button>
              <button onClick={onAbout} className="px-8 py-4 bg-slate-200/60 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300/80 dark:border-white/10 text-slate-800 dark:text-white rounded-xl font-bold text-lg backdrop-blur-md transition-all hover:border-slate-400 dark:hover:border-white/30">{t('landing.howItWorks')}</button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-7xl w-full animate-slide-up px-4" style={{ animationDelay: '0.3s' }}>
              <div className="glass-panel p-8 rounded-3xl text-left border border-slate-200/80 dark:border-white/5 hover:border-brand-blue/50 dark:hover:border-brand-blue/50 transition-all duration-500 hover:-translate-y-2 group shadow-sm">
                  <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6 text-brand-blue group-hover:scale-110 transition-transform duration-500 border border-brand-blue/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-slate-950 dark:text-white mb-3">Real-time Simulation</h3>
                  <p className="text-slate-600 dark:text-gray-400 leading-relaxed">Speak naturally with an AI that mimics human cadence, interruptions, and follow-up questions.</p>
              </div>
              <div className="glass-panel p-8 rounded-3xl text-left border border-slate-200/80 dark:border-white/5 hover:border-brand-purple/50 dark:hover:border-brand-purple/50 transition-all duration-500 hover:-translate-y-2 group shadow-sm">
                  <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center mb-6 text-brand-purple group-hover:scale-110 transition-transform duration-500 border border-brand-purple/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-slate-950 dark:text-white mb-3">Instant Feedback</h3>
                  <p className="text-slate-600 dark:text-gray-400 leading-relaxed">Get detailed breakdowns of your clarity, technical accuracy, and soft skills immediately after finishing.</p>
              </div>
              <div className="glass-panel p-8 rounded-3xl text-left border border-slate-200/80 dark:border-white/5 hover:border-brand-green/50 dark:hover:border-brand-green/50 transition-all duration-500 hover:-translate-y-2 group shadow-sm">
                  <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-6 text-brand-green group-hover:scale-110 transition-transform duration-500 border border-brand-green/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-slate-950 dark:text-white mb-3">Career Tailored</h3>
                  <p className="text-slate-600 dark:text-gray-400 leading-relaxed">Customize your interviewer's persona and difficulty level for roles in Engineering, Product, and more.</p>
              </div>
          </div>

          {/* Trusted By / Collab Section */}
          <div className="w-full max-w-7xl mx-auto mt-32 px-4 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <p className="text-sm font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-10">Trusted by candidates who landed offers at</p>
              <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-60 dark:opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                  <span className="text-2xl font-bold font-sans text-slate-900 dark:text-white">Google</span>
                  <span className="text-3xl font-bold font-serif italic pb-1 text-slate-900 dark:text-white">Meta</span>
                  <span className="text-2xl font-black font-sans tracking-tighter text-slate-900 dark:text-white">Amazon</span>
                  <span className="text-3xl font-bold font-sans text-red-500 tracking-wider">NETFLIX</span>
                  <span className="text-2xl font-bold font-sans tracking-wide text-slate-900 dark:text-white">Stripe</span>
              </div>
          </div>

          {/* Testimonials Section */}
          <div className="w-full max-w-7xl mx-auto mt-32 mb-10 px-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6 animate-fade-in">Don't just take our word for it</h2>
                  <p className="text-slate-600 dark:text-gray-400 text-lg">Join thousands of candidates who transformed their interview skills.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  {/* Testimonial 1 */}
                  <div className="glass-panel p-8 rounded-3xl relative border border-slate-200/80 dark:border-white/5 hover:border-brand-blue/30 dark:hover:border-brand-blue/30 transition-all duration-300 shadow-sm">
                      <div className="absolute top-8 left-8 text-brand-blue/10 dark:text-brand-blue/20">
                          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                      </div>
                      <p className="text-slate-700 dark:text-gray-300 relative z-10 pt-8 mb-6 italic leading-relaxed">"The AI interviewer was incredibly realistic. It interrupted me just like a real person would, which completely prepared me for my actual Meta interview. I landed the job!"</p>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">S</div>
                          <div>
                              <p className="text-slate-900 dark:text-white font-bold">Sarah Jenkins</p>
                              <p className="text-sm text-brand-blue font-medium">Software Engineer</p>
                          </div>
                      </div>
                  </div>
                  {/* Testimonial 2 */}
                  <div className="glass-panel p-8 rounded-3xl relative border border-slate-200/80 dark:border-white/5 hover:border-brand-purple/30 dark:hover:border-brand-purple/30 transition-all duration-300 shadow-sm">
                      <div className="absolute top-8 left-8 text-brand-purple/10 dark:text-brand-purple/20">
                           <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                      </div>
                      <p className="text-slate-700 dark:text-gray-300 relative z-10 pt-8 mb-6 italic leading-relaxed">"The instant feedback report was a game changer. It highlighted exactly where my behavioral answers lacked STAR methodology. My confidence skyrocketed."</p>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">M</div>
                          <div>
                              <p className="text-slate-900 dark:text-white font-bold">Marcus Chen</p>
                              <p className="text-sm text-brand-purple font-medium">Product Manager</p>
                          </div>
                      </div>
                  </div>
                  {/* Testimonial 3 */}
                  <div className="glass-panel p-8 rounded-3xl relative border border-slate-200/80 dark:border-white/5 hover:border-brand-green/30 dark:hover:border-brand-green/30 transition-all duration-300 shadow-sm">
                      <div className="absolute top-8 left-8 text-brand-green/10 dark:text-brand-green/20">
                           <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                      </div>
                      <p className="text-slate-700 dark:text-gray-300 relative z-10 pt-8 mb-6 italic leading-relaxed">"As a recruiter, using prepareAI to pre-screen candidates has saved our team hundreds of hours. The custom rubrics ensure we only talk to the best fits."</p>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-green-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">E</div>
                          <div>
                              <p className="text-slate-900 dark:text-white font-bold">Elena Rodriguez</p>
                              <p className="text-sm text-brand-green font-medium">Talent Acquisition</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </main>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-24 relative z-10 border-t border-slate-200/80 dark:border-white/5 bg-slate-100/50 dark:bg-black/40 backdrop-blur-sm transition-colors duration-300">
         <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20 animate-slide-up">
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-950 dark:text-white mb-6">Simple, Transparent Pricing</h2>
                  <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Invest in your career. Start for free, upgrade when you're ready to master your skills.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  {/* Free */}
                  <div className="glass-panel p-10 rounded-3xl border border-slate-200/80 dark:border-white/5 flex flex-col hover:border-slate-300/80 dark:hover:border-white/20 transition-all duration-300 bg-gradient-to-b from-slate-100/30 to-transparent dark:from-white/5 shadow-sm">
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-white mb-2 font-display">Starter</h3>
                      <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">Perfect for trying out the platform.</p>
                      <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">Free</span>
                      </div>
                      <ul className="space-y-4 mb-8 flex-1 text-slate-700 dark:text-gray-300">
                          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div> 1 Full AI Interview Session</li>
                          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div> Basic Performance Report</li>
                          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div> Standard CV Builder</li>
                      </ul>
                      <button onClick={onSignup} className="w-full py-4 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all border border-transparent dark:border-white/10">{t('landing.getStarted')}</button>
                  </div>

                  {/* Pro */}
                  <div className="glass-panel p-10 rounded-3xl border border-brand-purple/50 flex flex-col relative transform md:-translate-y-4 shadow-lg shadow-brand-purple/10 dark:shadow-[0_0_50px_rgba(168,85,247,0.15)] hover:shadow-xl hover:shadow-brand-purple/20 transition-all duration-300 bg-gradient-to-b from-brand-purple/5 to-transparent dark:from-brand-purple/10">
                      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-brand-purple text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">Most Popular</div>
                      <h3 className="text-2xl font-bold text-brand-purple mb-2 font-display">Pro Candidate</h3>
                      <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">For serious job seekers.</p>
                      <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">$15</span>
                          <span className="text-slate-500 dark:text-gray-400 font-medium">/month</span>
                      </div>
                      <ul className="space-y-4 mb-8 flex-1 text-slate-700 dark:text-gray-300">
                          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-purple"></div> Unlimited AI Sessions</li>
                          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-purple"></div> Advanced Behavioral Analysis</li>
                          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-purple"></div> Unlimited CV & Portfolio Builds</li>
                          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-purple"></div> Priority AI Processing</li>
                      </ul>
                      <button onClick={onSignup} className="w-full py-4 rounded-xl font-bold bg-brand-purple hover:bg-brand-purple/90 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all shadow-md">Start Pro Trial</button>
                  </div>

                  {/* Recruiter */}
                  <div className="glass-panel p-10 rounded-3xl border border-slate-200/80 dark:border-white/5 flex flex-col hover:border-slate-300/80 dark:hover:border-brand-green/30 transition-all duration-300 bg-gradient-to-b from-slate-100/30 to-transparent dark:from-white/5 shadow-sm">
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-white mb-2 font-display">Recruiter</h3>
                      <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">Scale your hiring process.</p>
                      <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">$49</span>
                          <span className="text-slate-500 dark:text-gray-400 font-medium">/month</span>
                      </div>
                      <ul className="space-y-4 mb-8 flex-1 text-slate-700 dark:text-gray-300">
                          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div> Everything in Pro</li>
                          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div> Invite & Manage Candidates</li>
                          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div> View Candidate Reports</li>
                          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div> Custom Interview Config</li>
                      </ul>
                      <button onClick={onSignup} className="w-full py-4 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all border border-transparent dark:border-white/10">Contact Sales</button>
                  </div>
              </div>
         </div>
      </section>

      <footer className="w-full border-t border-slate-200/80 dark:border-white/5 py-10 text-center text-slate-500 dark:text-gray-400 text-sm relative z-10 bg-slate-100 dark:bg-black/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
              <p>&copy; {new Date().getFullYear()} prepareAI. Built by DevJs.</p>
              <div className="flex gap-8 mt-4 md:mt-0">
                  <button onClick={onAbout} className="hover:text-slate-900 dark:hover:text-white transition-colors">About</button>
                  <button onClick={onPrivacy} className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</button>
                  <button onClick={onTerms} className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</button>
                  <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
