const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioBuilder.tsx', 'utf8');

code = code.replace(
  /console\.error\("Import failed", error\);/g,
  `const errStrConsole = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));\n          if (!(errStrConsole.includes("429") || errStrConsole.toLowerCase().includes("quota"))) {\n            console.error("Import failed", error);\n          }`
);

code = code.replace(
  /console\.error\(error\);/g,
  `const errStrConsole2 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));\n        if (!(errStrConsole2.includes("429") || errStrConsole2.toLowerCase().includes("quota"))) {\n            console.error(error);\n        }`
);

fs.writeFileSync('src/components/PortfolioBuilder.tsx', code);
