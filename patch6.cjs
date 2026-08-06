const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
`                    else if (view === 'pricing') navigate('/pricing');
                    else navigate(\`/\${view}\`);
                }}
                 }}
                 subscriptionTier={subscriptionTier}`,
`                    else if (view === 'pricing') navigate('/pricing');
                    else navigate(\`/\${view}\`);
                }}
                 subscriptionTier={subscriptionTier}`
);

fs.writeFileSync('src/App.tsx', code);
