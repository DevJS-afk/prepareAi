const fs = require('fs');

let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

// Update Logo in Navbar
content = content.replace(
    '<img src="/logo.svg" alt="prepareAI logo" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" />',
    '<img src="/logo.svg" alt="prepareAI logo" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" />\n                <span className="font-display font-bold text-xl text-slate-900 dark:text-white ml-2">prepareAI</span>'
);

// Update Hero text and add auth context
const oldHero = `<h1 className="text-5xl md:text-8xl font-display font-bold text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.1] animate-slide-up text-glow">
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
          </div>`;

const newHero = `<h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.1] animate-slide-up text-glow">
              Master Your Next Interview <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-purple to-brand-red">with prepareAI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-gray-400 max-w-2xl mb-12 leading-relaxed animate-slide-up font-light" style={{ animationDelay: '0.1s' }}>
              The ultimate AI-assisted interview coaching platform. Practice with AI, get instant feedback, and ace your recruitment process.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 animate-slide-up justify-center" style={{ animationDelay: '0.2s' }}>
              <button onClick={onSignup} className="group relative px-8 py-4 bg-brand-blue rounded-xl font-bold text-lg text-white overflow-hidden transition-all hover:scale-105 shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:shadow-brand-blue/30">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span>{t('landing.startFree')}</span>
              </button>
              <button onClick={onAbout} className="px-8 py-4 bg-slate-200/60 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300/80 dark:border-white/10 text-slate-800 dark:text-white rounded-xl font-bold text-lg backdrop-blur-md transition-all hover:border-slate-400 dark:hover:border-white/30">{t('landing.howItWorks')}</button>
          </div>
          
          <p className="mt-6 text-sm text-slate-500 dark:text-gray-400 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
              Sign in with Google to save your interview sessions and track your coaching progress.
          </p>`;

if (content.includes("{t('landing.heroTitle1')}")) {
    content = content.replace(oldHero, newHero);
    console.log('Hero updated');
}

// Update Footer to use prepareAI consistently and make Privacy and Terms anchor links if needed
const oldFooter = `<footer className="w-full border-t border-slate-200/80 dark:border-white/5 py-10 text-center text-slate-500 dark:text-gray-400 text-sm relative z-10 bg-slate-100 dark:bg-black/40 backdrop-blur-md">
          <div className="mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
              <p>&copy; {new Date().getFullYear()} prepareAI. Built by DevJs.</p>
              <div className="flex gap-8 mt-4 md:mt-0">
                  <button onClick={onAbout} className="hover:text-slate-900 dark:hover:text-white transition-colors">About</button>
                  <button onClick={onPrivacy} className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</button>
                  <button onClick={onTerms} className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</button>
                  <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
              </div>
          </div>
      </footer>`;
      
const newFooter = `<footer className="w-full border-t border-slate-200/80 dark:border-white/5 py-10 text-center text-slate-500 dark:text-gray-400 text-sm relative z-10 bg-slate-100 dark:bg-black/40 backdrop-blur-md">
          <div className="mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                  <img src="/logo.svg" alt="prepareAI logo" className="h-6 w-auto opacity-70" />
                  <span className="font-bold text-slate-900 dark:text-white opacity-70">prepareAI</span>
                  <span className="ml-2">&copy; {new Date().getFullYear()}. Built by DevJs.</span>
              </div>
              <div className="flex gap-8 mt-4 md:mt-0">
                  <button onClick={onAbout} className="hover:text-slate-900 dark:hover:text-white transition-colors">About</button>
                  <a href="/privacy" onClick={(e) => { e.preventDefault(); onPrivacy(); }} className="hover:text-slate-900 dark:hover:text-white transition-colors underline underline-offset-2">Privacy Policy</a>
                  <a href="/terms" onClick={(e) => { e.preventDefault(); onTerms(); }} className="hover:text-slate-900 dark:hover:text-white transition-colors underline underline-offset-2">Terms of Service</a>
                  <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
              </div>
          </div>
      </footer>`;

if (content.includes('prepareAI. Built by DevJs')) {
    content = content.replace(oldFooter, newFooter);
    console.log('Footer updated');
}

fs.writeFileSync('src/components/LandingPage.tsx', content);
