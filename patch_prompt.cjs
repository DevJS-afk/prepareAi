const fs = require('fs');
let code = fs.readFileSync('src/components/CVBuilder.tsx', 'utf8');

code = code.replace(
  /"experience": "string \\(formatted as bullet points\\)",/g,
  '"experience": "string (formatted with **Company/Role** on one line and bullet points `- ` for achievements)",'
);

code = code.replace(
  /"education": "string \\(formatted as text\/bullets\\)",/g,
  '"education": "string (formatted with **Institution** on one line and details below)",'
);

fs.writeFileSync('src/components/CVBuilder.tsx', code);
