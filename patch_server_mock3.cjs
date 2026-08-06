const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

const regex = /console\.log\("Using fallback mock job description due to quota limits\."\);\n\s*return res\.json\(\{ description: "# " \+ \(title \|\| "Software Engineer"\) \+ ".*?\} \);/s;

code = code.replace(
  regex,
  'console.log("Using fallback mock job description due to quota limits.");\n        return res.json({ description: "# " + (title || "Software Engineer") + "\\n\\n## About Us\\nWe are a fast-growing company looking for talented individuals.\\n\\n## Key Responsibilities\\n- Design and implement scalable features\\n- Collaborate with cross-functional teams\\n\\n## What We Are Looking For\\n- Strong problem-solving skills\\n- Experience with modern frameworks\\n\\n## Why You\'ll Love Working Here\\n- Competitive salary\\n- Remote-first culture" });'
);

fs.writeFileSync('backend/server.ts', code);
