const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

code = code.replace(
  /console\.error\("Error generating report on server:", error\);/g,
  `const errStrConsole1 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));\n      if (!(errStrConsole1.includes("429") || errStrConsole1.toLowerCase().includes("quota"))) {\n        console.error("Error generating report on server:", error);\n      }`
);

code = code.replace(
  /console\.error\("Error translating report on server:", error\);/g,
  `const errStrConsole2 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));\n      if (!(errStrConsole2.includes("429") || errStrConsole2.toLowerCase().includes("quota"))) {\n        console.error("Error translating report on server:", error);\n      }`
);

code = code.replace(
  /console\.error\("Error generating job description on server:", error\);/g,
  `const errStrConsole3 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));\n      if (!(errStrConsole3.includes("429") || errStrConsole3.toLowerCase().includes("quota"))) {\n        console.error("Error generating job description on server:", error);\n      }`
);

fs.writeFileSync('backend/server.ts', code);
