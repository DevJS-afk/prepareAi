const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/subscriptionTier={subscriptionTier}`\);\n                }}/g, 
`}}
                 subscriptionTier={subscriptionTier}`);

fs.writeFileSync('src/App.tsx', code);
