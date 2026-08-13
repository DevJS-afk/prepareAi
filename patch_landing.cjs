const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

code = code.replace(
    /<li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{3\} d="M5 13l4 4L19 7" \/><\/svg> 1 active event<\/li>\s*<li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{3\} d="M5 13l4 4L19 7" \/><\/svg> 10 AI calls per day<\/li>/,
    '<li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> 5 free tokens included</li>\n                          <li className="flex items-center gap-3"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> 3 tokens per interview</li>'
);

fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log("Patched LandingPage.tsx correctly");
