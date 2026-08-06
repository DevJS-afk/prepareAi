const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<div className="flex items-center gap-3 cursor-pointer" onClick=\{\(\) => navigate\('\/dashboard'\)\}>([\s\S]*?)<\/p>\n                  <\/div>\n              <\/div>/,
  `<div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                  <img src="/logo.svg" alt="prepareAI logo" className="h-10 w-auto" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400 font-semibold mt-1">
                        {userRole === 'admin' ? 'Admin Mode' : userRole === 'interviewer' ? 'Recruiter Mode' : userRole === 'candidate' ? 'Candidate Mode' : (subscriptionTier === 'pro' ? 'Pro Plan' : 'Free Tier')}
                    </p>
                  </div>
              </div>`
);

fs.writeFileSync('src/App.tsx', code);
