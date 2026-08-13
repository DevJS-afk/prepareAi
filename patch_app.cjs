const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Default to 5
code = code.replace(/setTokens\(profile\?.tokens \?\? 0\);/g, 'setTokens(profile?.tokens ?? 5);');

// Cost 3
code = code.replace(/if \(tokens <= 0\) \{/g, 'if (tokens < 3) {');
code = code.replace(/Token Limit Reached: You have used all your tokens. Please upgrade to Pro for unlimited sessions or use 'Practice Mode'./g, "Token Limit Reached: You need 3 tokens to start an interview. Please upgrade to Pro for unlimited sessions or use 'Practice Mode'.");

code = code.replace(/if \(subscriptionTier === 'free' && tokens > 0 && !isPracticeMode\) \{/g, "if (subscriptionTier === 'free' && tokens >= 3 && !isPracticeMode) {");
code = code.replace(/const newTokens = tokens - 1;/g, 'const newTokens = tokens - 3;');

// Badge colors
code = code.replace(/tokens <= 0 &&/g, 'tokens < 3 &&');

// Insert default tokens 5
code = code.replace(/avatar_url: metaAvatar \|\| ''\s*\}\);/g, "avatar_url: metaAvatar || '',\n                        tokens: 5\n                    });");
code = code.replace(/email: email \|\| ''\s*\}\);/g, "email: email || '',\n                             tokens: 5\n                         });");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for tokens");
