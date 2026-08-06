const fs = require('fs');
let code = fs.readFileSync('src/components/MotivationLetter.tsx', 'utf8');

code = code.replace(
  /console\.error\(error\);/g,
  `const errStrConsole = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));\n        if (!(errStrConsole.includes("429") || errStrConsole.toLowerCase().includes("quota"))) {\n            console.error(error);\n        }`
);

fs.writeFileSync('src/components/MotivationLetter.tsx', code);
