const fs = require('fs');

let content = fs.readFileSync('backend/server.ts', 'utf8');

const regex = /if \(errStr\.includes\("429"\) \|\| errStr\.toLowerCase\(\)\.includes\("quota"\)\) \{[\s\S]*?\} else \{[\s\S]*?errorMessage = error\.message \|\| "Unknown error";[\s\S]*?\}/;

content = content.replace(regex, `if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
        errorMessage = "AI analysis is currently unavailable due to high traffic or quota limits. Please try again in a few minutes.";
      } else {
        errorMessage = error.message || "An error occurred during AI analysis.";
      }`);

fs.writeFileSync('backend/server.ts', content);
console.log('Removed mock report fallback');
