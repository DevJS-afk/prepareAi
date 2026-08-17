const fs = require('fs');

const content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

const additionalFeatures = `
              <div className="glass-panel p-8 rounded-3xl text-left border border-slate-200/80 dark:border-white/5 hover:border-yellow-500/50 dark:hover:border-yellow-500/50 transition-all duration-500 hover:-translate-y-2 group shadow-sm">
                  <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 text-yellow-500 group-hover:scale-110 transition-transform duration-500 border border-yellow-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-slate-950 dark:text-white mb-3">Resume & Portfolio Builder</h3>
                  <p className="text-slate-600 dark:text-gray-400 leading-relaxed">Leverage AI to construct ATS-friendly resumes and stunning career portfolios tailored to your industry.</p>
              </div>
              <div className="glass-panel p-8 rounded-3xl text-left border border-slate-200/80 dark:border-white/5 hover:border-red-500/50 dark:hover:border-red-500/50 transition-all duration-500 hover:-translate-y-2 group shadow-sm">
                  <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform duration-500 border border-red-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-slate-950 dark:text-white mb-3">Recruiter Dashboard</h3>
                  <p className="text-slate-600 dark:text-gray-400 leading-relaxed">Dedicated tools for organizations to generate invite links, configure custom interviews, and track candidate reports.</p>
              </div>
              <div className="glass-panel p-8 rounded-3xl text-left border border-slate-200/80 dark:border-white/5 hover:border-pink-500/50 dark:hover:border-pink-500/50 transition-all duration-500 hover:-translate-y-2 group shadow-sm">
                  <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 text-pink-500 group-hover:scale-110 transition-transform duration-500 border border-pink-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-slate-950 dark:text-white mb-3">Smart Cover Letters</h3>
                  <p className="text-slate-600 dark:text-gray-400 leading-relaxed">Automate the generation of customized cover letters dynamically adjusted for specific job postings and roles.</p>
              </div>
`;

// Insert additionalFeatures before the Trusted By comment
const newContent = content.replace('{/* Trusted By / Collab Section */}', additionalFeatures + '\n          {/* Trusted By / Collab Section */}');

fs.writeFileSync('src/components/LandingPage.tsx', newContent);
console.log("Replaced");
