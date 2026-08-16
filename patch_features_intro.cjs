const fs = require('fs');

let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

const intro = `
          <div className="w-full mx-auto mt-32 px-4 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6 animate-fade-in">Everything you need to succeed</h2>
              <p className="text-slate-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">Our platform provides a complete suite of AI-powered tools designed to help you prepare for interviews, build your career documents, and stand out to recruiters.</p>
          </div>
`;

content = content.replace('{/* Feature Grid */}', intro + '\n          {/* Feature Grid */}');

fs.writeFileSync('src/components/LandingPage.tsx', content);
console.log("Replaced intro");
