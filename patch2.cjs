const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');
code = code.replace(/view: 'dashboard' \| 'interview-setup'/g, "view: 'dashboard' | 'interview-setup' | 'pricing'");
fs.writeFileSync('src/components/WelcomeScreen.tsx', code);
