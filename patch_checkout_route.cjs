const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

code = code.replace(
    'return res.json({ url: "/dashboard?session_id=mock_session_id" });',
    'return res.json({ url: "/payment-success" });'
);

fs.writeFileSync('backend/server.ts', code);
console.log("Patched server.ts checkout url");
