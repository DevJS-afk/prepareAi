const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

// Find the start of the mock job description and the end of it
const startIdx = code.indexOf('return res.json({ description: "# " + (title || "Software Engineer") + "');
if (startIdx !== -1) {
  const endIdx = code.indexOf(' } );', startIdx) !== -1 ? code.indexOf(' } );', startIdx) : code.indexOf('} );', startIdx);
  // Actually let's just use regex to replace everything from return res.json to Remote-first culture" });
  
  code = code.replace(
    /return res\.json\(\{ description: "# " \+ \(title \|\| "Software Engineer"\) \+ "[^;]+;/s,
    'return res.json({ description: `# ${title || "Software Engineer"}\\n\\n## About Us\\nWe are a fast-growing company looking for talented individuals.\\n\\n## Key Responsibilities\\n- Design and implement scalable features\\n- Collaborate with cross-functional teams\\n\\n## What We Are Looking For\\n- Strong problem-solving skills\\n- Experience with modern frameworks\\n\\n## Why You\\'ll Love Working Here\\n- Competitive salary\\n- Remote-first culture` });'
  );
  fs.writeFileSync('backend/server.ts', code);
}
