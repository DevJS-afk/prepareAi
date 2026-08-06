const fs = require('fs');
let code = fs.readFileSync('src/components/CVBuilder.tsx', 'utf8');

const oldPrompt = `"experience": "string (formatted as bullet points)",
              "education": "string (formatted as text/bullets)",`;

const newPrompt = `"experience": "string (retain exactly: **Company | Role** \\n- Bullet 1\\n- Bullet 2)",
              "education": "string (retain exactly: **Institution** \\nDegree/Details)",`;

code = code.replace(oldPrompt, newPrompt);

fs.writeFileSync('src/components/CVBuilder.tsx', code);
