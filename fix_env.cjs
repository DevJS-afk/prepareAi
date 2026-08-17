const fs = require('fs');
let content = fs.readFileSync('src/components/CVBuilder.tsx', 'utf8');
content = content.replace(/import\.meta\.env\.VITE_GEMINI_API_KEY \|\| ''/g, 'process.env.API_KEY');
fs.writeFileSync('src/components/CVBuilder.tsx', content);
console.log('Fixed env variable usage');
