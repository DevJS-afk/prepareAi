const fs = require('fs');

const landingFile = 'src/components/LandingPage.tsx';
let landingCode = fs.readFileSync(landingFile, 'utf8');

// 1. Add useState import if not present
if (!landingCode.includes('import React, { useState } from')) {
    landingCode = landingCode.replace('import React from \'react\';', 'import React, { useState } from \'react\';');
}

// 2. Add isMenuOpen state
if (!landingCode.includes('isMenuOpen')) {
    const componentStart = landingCode.indexOf('const LandingPage: React.FC<LandingPageProps> = ({');
    const firstParenEnd = landingCode.indexOf('=> {', componentStart) + 4;
    landingCode = landingCode.substring(0, firstParenEnd) + '\n  const [isMenuOpen, setIsMenuOpen] = useState(false);' + landingCode.substring(firstParenEnd);
}

// 3. Update the nav
const navStart = landingCode.indexOf('<nav className="w-full mx-auto px-6 py-6 flex justify-between items-center z-50">');
const navEnd = landingCode.indexOf('</nav>') + '</nav>'.length;

if (navStart !== -1 && navEnd !== -1) {
    const oldNav = landingCode.substring(navStart, navEnd);
    const newNav = `<nav className="w-full mx-auto px-6 py-6 z-50">
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
                      <select
                          className="bg-transparent border-none text-slate-600 dark:text-gray-300 text-sm font-medium focus:ring-0 cursor-pointer outline-none uppercase"
                          value={i18n.language.split('-')[0]}
                          onChange={(e) => i18n.changeLanguage(e.target.value)}
                        >
                          <option value="en" className="bg-white dark:bg-slate-800">🇬🇧 EN</option>
                          <option value="fr" className="bg-white dark:bg-slate-800">🇫🇷 FR</option>
                          <option value="es" className="bg-white dark:bg-slate-800">🇪🇸 ES</option>
                      </select>
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
                      <select
                          className="bg-slate-100 dark:bg-white/5 border-none text-slate-600 dark:text-gray-300 text-sm font-medium focus:ring-0 cursor-pointer outline-none uppercase py-1.5 px-3 rounded-lg"
                          value={i18n.language.split('-')[0]}
                          onChange={(e) => i18n.changeLanguage(e.target.value)}
                        >
                          <option value="en" className="bg-white dark:bg-slate-800">🇬🇧 EN</option>
                          <option value="fr" className="bg-white dark:bg-slate-800">🇫🇷 FR</option>
                          <option value="es" className="bg-white dark:bg-slate-800">🇪🇸 ES</option>
                      </select>
                    </div>
                )}
            </div>
        )}
      </nav>`;
      
    landingCode = landingCode.replace(oldNav, newNav);
    fs.writeFileSync(landingFile, landingCode);
    console.log("Patched LandingPage.tsx");
} else {
    console.log("Could not patch LandingPage.tsx");
}
