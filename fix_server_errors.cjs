const fs = require('fs');

let content = fs.readFileSync('backend/server.ts', 'utf-8');

// For generate-report
content = content.replace(
  /let errorMessage = error\.message \|\| "Unknown error";\n\s*if \(errorMessage\.includes\("429"\) \|\| errorMessage\.includes\("quota"\)\) \{\n\s*errorMessage = "We have temporarily exceeded our AI service quota\. Please try again later\.";\n\s*\}/g,
  `let errorMessage = "Unknown error";\n      const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));\n      if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {\n        errorMessage = "We have temporarily exceeded our AI service quota. Please try again later.";\n      } else {\n        errorMessage = error.message || "Unknown error";\n      }`
);

// For translate-report
content = content.replace(
  /console\.error\("Error translating report on server:", error\);\n\s*res\.status\(500\)\.json\(\{ error: error\.message \}\);/g,
  `console.error("Error translating report on server:", error);\n      let errorMessage = "Unknown error";\n      const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));\n      if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {\n        errorMessage = "We have temporarily exceeded our AI service quota. Please try again later.";\n      } else {\n        errorMessage = error.message || "Unknown error";\n      }\n      res.status(500).json({ error: errorMessage });`
);

// For generate-job-description
content = content.replace(
  /console\.error\("Error generating job description on server:", error\);\n\s*res\.status\(500\)\.json\(\{ error: error\.message \}\);/g,
  `console.error("Error generating job description on server:", error);\n      let errorMessage = "Unknown error";\n      const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));\n      if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {\n        errorMessage = "We have temporarily exceeded our AI service quota. Please try again later.";\n      } else {\n        errorMessage = error.message || "Unknown error";\n      }\n      res.status(500).json({ error: errorMessage });`
);

fs.writeFileSync('backend/server.ts', content);
console.log('Fixed server.ts errors');
