const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

code = code.replace(
  /<div className="flex items-center gap-3 cursor-pointer group" onClick=\{\(\) => window.scrollTo\(\{ top: 0, behavior: 'smooth' \}\)\}>([\s\S]*?)<\/span>\n        <\/div>/,
  `<div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.svg" alt="prepareAI logo" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" />
        </div>`
);

fs.writeFileSync('src/components/LandingPage.tsx', code);
