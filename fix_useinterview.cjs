const fs = require('fs');

let content = fs.readFileSync('src/hooks/useInterview.ts', 'utf-8');

content = content.replace(
  /console\.error\("Initialization failed:", e\);\n\s*const errorMessage = e instanceof Error \? e\.message : "An unknown error occurred during setup\.";\n\s*setError\(\`Failed to initialize interview: \$\{errorMessage\}\`\);/g,
  `console.error("Initialization failed:", e);\n        let errorMessage = e instanceof Error ? e.message : "An unknown error occurred during setup.";\n        const errStr = String(e) + " " + JSON.stringify(e, Object.getOwnPropertyNames(e || {}));\n        if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {\n            errorMessage = "We have temporarily exceeded our AI service quota. Please try again later.";\n        }\n        setError(\`Failed to initialize interview: \$\{errorMessage\}\`);`
);

fs.writeFileSync('src/hooks/useInterview.ts', content);
console.log('Fixed useInterview');
