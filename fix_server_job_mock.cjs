const fs = require('fs');
let content = fs.readFileSync('backend/server.ts', 'utf8');

const regex = /if \(errStr\.includes\("429"\) \|\| errStr\.toLowerCase\(\)\.includes\("quota"\)\) \{\s*console\.log\("Using fallback mock job description due to quota limits\."\);\s*return res\.json\(\{ description: `#.*?` \}\);\s*\} else \{/s;

content = content.replace(regex, `if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
        errorMessage = "AI generation is currently unavailable due to high traffic or quota limits. Please try again in a few minutes.";
      } else {`);

fs.writeFileSync('backend/server.ts', content);
console.log('Fixed mock job description fallback');
