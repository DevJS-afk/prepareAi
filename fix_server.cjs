const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

// Fix title issue
code = code.replace(
  /return res\.json\(\{ description: \`# \$\{title \|\| 'Software Engineer'\}\\n\\n## About Us/g,
  "return res.json({ description: `# ${req.body?.title || 'Software Engineer'}\\n\\n## About Us"
);

// Fix report / uiLabels issue
code = code.replace(
  /return res\.json\(\{ \n          report: report, \/\/ Return original as fallback\n          uiLabels: uiLabels\n        \}\);/g,
  "return res.json({ report: req.body?.report, uiLabels: req.body?.uiLabels });"
);

fs.writeFileSync('backend/server.ts', code);
