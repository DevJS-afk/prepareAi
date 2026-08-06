const fs = require('fs');
let code = fs.readFileSync('src/components/CVBuilder.tsx', 'utf8');

code = code.replace(
/return marked\.parse\(String\(text\), \{ async: false \}\) as string;/g,
"return marked.parse(String(text), { async: false, breaks: true }) as string;"
);

fs.writeFileSync('src/components/CVBuilder.tsx', code);
