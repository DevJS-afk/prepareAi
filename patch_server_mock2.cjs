const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

// The original file is already modified, so let's just replace the specific line.
code = code.replace(
  /return res.json\(\{ description: "# " \+ \(title \|\| "Software Engineer"\) \+ ".*?\} \);/s,
  'return res.json({ description: "# " + (title || "Software Engineer") + "\\n\\n## About Us\\nWe are a fast-growing company looking for talented individuals.\\n\\n## Key Responsibilities\\n- Design and implement scalable features\\n- Collaborate with cross-functional teams\\n\\n## What We Are Looking For\\n- Strong problem-solving skills\\n- Experience with modern frameworks\\n\\n## Why You\'ll Love Working Here\\n- Competitive salary\\n- Remote-first culture" });'
);

fs.writeFileSync('backend/server.ts', code);
