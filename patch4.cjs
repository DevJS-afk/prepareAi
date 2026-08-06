const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update Dashboard props in App.tsx
code = code.replace(
  /<Dashboard onNavigate={\(view\) => {([\s\S]*?)}/g,
  `<Dashboard onNavigate={(view) => {
                    if (view === 'dashboard') navigate('/dashboard');
                    else if (view === 'interview-setup') navigate('/interview/setup');
                    else if (view === 'pricing') navigate('/pricing');
                    else navigate(\`/\${view}\`);
                }}
                 subscriptionTier={subscriptionTier}`
);

fs.writeFileSync('src/App.tsx', code);
