const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

code = code.replace(
  /console\.error\("Error generating report on server:", error\);/g,
  `const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));\n      if (!(errStr.includes("429") || errStr.toLowerCase().includes("quota"))) {\n        console.error("Error generating report on server:", error);\n      }`
);

code = code.replace(
  /console\.error\("Error translating report on server:", error\);/g,
  `const errStr2 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));\n      if (!(errStr2.includes("429") || errStr2.toLowerCase().includes("quota"))) {\n        console.error("Error translating report on server:", error);\n      }`
);

code = code.replace(
  /console\.error\("Error generating job description on server:", error\);/g,
  `const errStr3 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));\n      if (!(errStr3.includes("429") || errStr3.toLowerCase().includes("quota"))) {\n        console.error("Error generating job description on server:", error);\n      }`
);

// We should also remove the redundant errStr generation in the catch block if it's already generated. 
// Actually, let's just make it cleaner.
