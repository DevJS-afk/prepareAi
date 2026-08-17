const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    "setSessionCount(count || 0);\n            setTokens(profile?.tokens ?? 5);",
    "setSessionCount(count || 0);\n            let updatedTokens = profile?.tokens ?? 5;\n            if ((count || 0) === 0 && updatedTokens === 0) {\n                updatedTokens = 5;\n                supabase!.from('profiles').update({ tokens: 5 }).eq('id', uid).then();\n            }\n            setTokens(updatedTokens);"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed tokens in App.tsx");
