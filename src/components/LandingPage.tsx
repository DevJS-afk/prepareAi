import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

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
      <nav className="w-full mx-auto px-6 py-6 z-50">
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <img src="/logo.svg" alt="prepareAI logo" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" />
            </div>
            
            {/* Mobile Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-600 dark:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 md:gap-8">
                <div className="flex items-center gap-6">
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
                      <LanguageSwitcher />
                    </>)}
                </div>
            </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
            <div className="md:hidden flex flex-col gap-4 pt-4 mt-4 border-t border-slate-200 dark:border-white/10 animate-fade-in w-full">
                <button onClick={() => { onAbout(); setIsMenuOpen(false); }} className="w-full text-left py-2 text-sm font-medium text-slate-600 dark:text-gray-400">
                    About
                </button>
                <button onClick={() => { scrollToPricing(); setIsMenuOpen(false); }} className="w-full text-left py-2 text-sm font-medium text-slate-600 dark:text-gray-400">
                    Pricing
                </button>
                <button onClick={() => { onLogin(); setIsMenuOpen(false); }} className="w-full text-left py-2 text-sm font-bold text-slate-700 dark:text-white">
                    {t('landing.login')}
                </button>
                <button onClick={() => { onSignup(); setIsMenuOpen(false); }} className="w-full text-left py-2 text-sm font-bold text-brand-blue">
                    {t('landing.getStarted')}
                </button>
                
                {toggleTheme && (
                    <div className="flex items-center gap-4 pt-2 w-full">
                      <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 flex items-center justify-center"
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
                      <LanguageSwitcher />
                    </div>
                )}
            </div>
        )}
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
          
          <h1 className="text-5xl md:text-8xl font-display font-bold text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.1] animate-slide-up text-glow">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full animate-slide-up px-4" style={{ animationDelay: '0.3s' }}>
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
          <div className="w-full mx-auto mt-32 px-4 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
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
          <div className="w-full mx-auto mt-32 mb-10 px-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
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
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> 5 free tokens included</li>
                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> 3 tokens per interview</li>
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
      </section>

      <footer className="w-full border-t border-slate-200/80 dark:border-white/5 py-10 text-center text-slate-500 dark:text-gray-400 text-sm relative z-10 bg-slate-100 dark:bg-black/40 backdrop-blur-md">
          <div className="mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
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
