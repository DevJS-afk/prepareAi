const fs = require('fs');

const appFile = 'src/App.tsx';
let appCode = fs.readFileSync(appFile, 'utf8');

// 1. Add useState
if (!appCode.includes('isMenuOpen')) {
    appCode = appCode.replace('const [theme, setTheme] = useState', 'const [isMenuOpen, setIsMenuOpen] = useState(false);\n  const [theme, setTheme] = useState');
}

// 2. Replace the header section
const headerStart = appCode.indexOf('<header className="w-full sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-dark-bg/60 border-b border-slate-200/80 dark:border-white/5 shadow-md">');
const headerEnd = appCode.indexOf('</header>') + '</header>'.length;

if (headerStart !== -1 && headerEnd !== -1) {
    const oldHeader = appCode.substring(headerStart, headerEnd);
    const newHeader = `<header className="w-full sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-dark-bg/60 border-b border-slate-200/80 dark:border-white/5 shadow-md">
           <div className="w-full mx-auto px-4 sm:px-6 py-4">
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                      <img src="/logo.svg" alt="prepareAI logo" className="h-10 w-auto" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400 font-semibold mt-1">
                            {userRole === 'admin' ? 'Admin Mode' : userRole === 'interviewer' ? 'Recruiter Mode' : userRole === 'candidate' ? 'Candidate Mode' : (subscriptionTier === 'pro' ? 'Pro Plan' : 'Free Tier')}
                        </p>
                      </div>
                  </div>
                  
                  {/* Mobile Menu Toggle */}
                  <div className="flex items-center gap-2 sm:hidden">
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
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-slate-600 dark:text-gray-300 text-sm font-medium">{session.user.email}</p>
                    </div>
                    <div className="h-6 w-px bg-slate-200 dark:bg-gray-700 hidden sm:block"></div>
                    <div className="flex items-center gap-4">
                        {userRole !== 'admin' && (
                            <button  
                                onClick={() => navigate('/pricing')} 
                                className={\`text-sm font-bold transition-all px-4 py-1.5 rounded-full \${location.pathname === '/pricing' ? 'bg-brand-yellow text-black' : 'bg-gradient-to-r from-brand-yellow to-yellow-400 text-black shadow hover:shadow-md transform hover:-translate-y-0.5'}\`}
                            >
                                {subscriptionTier === 'free' ? 'Upgrade' : 'Plans'}
                            </button>
                        )}
                        {userRole === 'admin' && (
                            <button 
                                onClick={() => navigate('/admin-dashboard')}
                                className={\`text-sm font-bold transition-colors relative group \${location.pathname === '/admin-dashboard' ? 'text-brand-red' : 'text-slate-600 hover:text-brand-red dark:text-gray-300 dark:hover:text-brand-red'}\`}
                            >{t('nav.admin')}<span className={\`absolute -bottom-1 left-0 h-0.5 bg-brand-red transition-all \${location.pathname === '/admin-dashboard' ? 'w-full' : 'w-0 group-hover:w-full'}\`}></span>
                            </button>
                        )}
                        {(userRole === 'interviewer' || userRole === 'admin') && (
                            <button 
                                onClick={() => navigate('/interviewer-dashboard')}
                                className={\`text-sm font-bold transition-colors relative group \${location.pathname === '/interviewer-dashboard' ? 'text-brand-purple' : 'text-slate-600 hover:text-brand-purple dark:text-gray-300 dark:hover:text-brand-purple'}\`}
                            >{t('nav.candidates')}<span className={\`absolute -bottom-1 left-0 h-0.5 bg-brand-purple transition-all \${location.pathname === '/interviewer-dashboard' ? 'w-full' : 'w-0 group-hover:w-full'}\`}></span>
                            </button>
                        )}
                        
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1.5 mr-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Credits</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{tokens}</span>
                            {tokens <= 0 && <span className="text-[10px] font-bold bg-brand-red/10 text-brand-red px-1.5 rounded-sm">0</span>}
                        </div>
                        <button 
                          onClick={() => navigate('/profile')} 
                          className={\`text-sm font-medium transition-colors relative group \${location.pathname === '/profile' ? 'text-brand-blue' : 'text-slate-600 hover:text-brand-blue dark:text-gray-300 dark:hover:text-brand-blue'}\`}
                        >{t('nav.profile')}<span className={\`absolute -bottom-1 left-0 h-0.5 bg-brand-blue transition-all \${location.pathname === '/profile' ? 'w-full' : 'w-0 group-hover:w-full'}\`}></span>
                        </button>
                        <button 
                          onClick={toggleTheme} 
                          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 transition-colors duration-200 flex items-center justify-center"
                          aria-label="Toggle Theme"
                          id="theme-toggle"
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
                        <button 
                          onClick={handleLogout} 
                          className="text-slate-600 hover:text-brand-red dark:text-gray-300 dark:hover:text-brand-red font-medium text-sm transition-colors relative group"
                        >
                          Log out
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-red transition-all group-hover:w-full"></span>
                        </button>
                    </div>
                  </div>
              </div>
              
              {/* Mobile Navigation Menu */}
              {isMenuOpen && (
                <div className="sm:hidden flex flex-col gap-4 pt-4 mt-4 border-t border-slate-200 dark:border-white/10 animate-fade-in">
                  <div className="text-left">
                    <p className="text-slate-600 dark:text-gray-300 text-sm font-medium">{session.user.email}</p>
                  </div>
                  
                  <div className="flex flex-col gap-4 items-start">
                      {userRole !== 'admin' && (
                          <button  
                              onClick={() => { navigate('/pricing'); setIsMenuOpen(false); }} 
                              className={\`w-full text-left text-sm font-bold transition-all px-4 py-2 rounded-lg \${location.pathname === '/pricing' ? 'bg-brand-yellow text-black' : 'bg-gradient-to-r from-brand-yellow to-yellow-400 text-black shadow'}\`}
                          >
                              {subscriptionTier === 'free' ? 'Upgrade' : 'Plans'}
                          </button>
                      )}
                      
                      {userRole === 'admin' && (
                          <button 
                              onClick={() => { navigate('/admin-dashboard'); setIsMenuOpen(false); }}
                              className={\`w-full text-left text-sm font-bold transition-colors py-2 \${location.pathname === '/admin-dashboard' ? 'text-brand-red' : 'text-slate-600 dark:text-gray-300'}\`}
                          >{t('nav.admin')}
                          </button>
                      )}
                      {(userRole === 'interviewer' || userRole === 'admin') && (
                          <button 
                              onClick={() => { navigate('/interviewer-dashboard'); setIsMenuOpen(false); }}
                              className={\`w-full text-left text-sm font-bold transition-colors py-2 \${location.pathname === '/interviewer-dashboard' ? 'text-brand-purple' : 'text-slate-600 dark:text-gray-300'}\`}
                          >{t('nav.candidates')}
                          </button>
                      )}
                      
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1.5 w-max">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Credits</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{tokens}</span>
                          {tokens <= 0 && <span className="text-[10px] font-bold bg-brand-red/10 text-brand-red px-1.5 rounded-sm">0</span>}
                      </div>
                      
                      <button 
                        onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} 
                        className={\`w-full text-left text-sm font-medium transition-colors py-2 \${location.pathname === '/profile' ? 'text-brand-blue' : 'text-slate-600 dark:text-gray-300'}\`}
                      >{t('nav.profile')}
                      </button>
                      
                      <div className="flex items-center gap-4 w-full">
                        <button 
                          onClick={toggleTheme} 
                          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 transition-colors duration-200 flex items-center justify-center bg-slate-100 dark:bg-white/5"
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
                      
                      <button 
                        onClick={handleLogout} 
                        className="w-full text-left text-brand-red font-medium text-sm transition-colors py-2 mt-2"
                      >
                        Log out
                      </button>
                  </div>
                </div>
              )}
           </div>
         </header>`;
         
    appCode = appCode.replace(oldHeader, newHeader);
    fs.writeFileSync(appFile, appCode);
    console.log("Patched App.tsx");
} else {
    console.log("Could not patch App.tsx");
}
