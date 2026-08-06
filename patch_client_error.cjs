const fs = require('fs');
let code = fs.readFileSync('src/hooks/useInterview.ts', 'utf8');

code = code.replace(
  /console\.error\("Initialization failed:", e\);/g,
  `const errStrConsole = String(e) + " " + JSON.stringify(e, Object.getOwnPropertyNames(e || {}));\n        if (!(errStrConsole.includes("429") || errStrConsole.toLowerCase().includes("quota"))) {\n          console.error("Initialization failed:", e);\n        }`
);

code = code.replace(
  /console\.error\("Error getting feedback:", error\);/g,
  `const errStrConsole2 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));\n      if (!(errStrConsole2.includes("429") || errStrConsole2.toLowerCase().includes("quota"))) {\n        console.error("Error getting feedback:", error);\n      }`
);

fs.writeFileSync('src/hooks/useInterview.ts', code);
