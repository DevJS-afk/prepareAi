const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

code = code.replace(
    'if (!process.env.STRIPE_SECRET_KEY) {\n        return res.status(500).json({ error: "Stripe is not configured" });\n      }',
    'if (!process.env.STRIPE_SECRET_KEY) {\n        console.log("Stripe is not configured, returning mock success URL");\n        return res.json({ url: "/dashboard?session_id=mock_session_id" });\n      }'
);

fs.writeFileSync('backend/server.ts', code);
console.log("Patched server.ts checkout");
