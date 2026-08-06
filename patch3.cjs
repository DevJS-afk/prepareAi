const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');
code = code.replace(
  /<\/p>\s*<\/div>/,
  `</p>
        {subscriptionTier === 'free' && (
           <div className="mt-8 flex justify-center">
              <button onClick={() => onNavigate('pricing')} className="flex items-center gap-2 bg-gradient-to-r from-brand-yellow to-yellow-400 text-black font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all transform hover:-translate-y-1">
                 Upgrade to Pro
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                 </svg>
              </button>
           </div>
        )}
      </div>`
);
fs.writeFileSync('src/components/WelcomeScreen.tsx', code);
