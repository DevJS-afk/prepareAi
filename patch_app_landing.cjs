const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldLanding = `<Route path="/" element={!session ? <LandingPage 
                onLogin={() => navigate('/auth')} 
                onSignup={() => navigate('/auth')} 
                onAbout={() => navigate('/about')} 
                onPrivacy={() => navigate('/privacy')}
                onTerms={() => navigate('/terms')}
                theme={theme}
                toggleTheme={toggleTheme}
              /> : <Navigate to="/dashboard" />} />`;
const newLanding = `<Route path="/" element={!session ? <LandingPage 
                onLogin={() => navigate('/auth')} 
                onSignup={() => navigate('/auth')} 
                onAbout={() => navigate('/about')} 
                onPrivacy={() => navigate('/privacy')}
                onTerms={() => navigate('/terms')}
                onChangelog={() => navigate('/changelog')}
                theme={theme}
                toggleTheme={toggleTheme}
              /> : <Navigate to="/dashboard" />} />`;

if (content.includes('onTerms={() => navigate(\'/terms\')}')) {
    content = content.replace(oldLanding, newLanding);
    fs.writeFileSync('src/App.tsx', content);
    console.log('App.tsx landing patched');
} else {
    console.log('Could not find LandingPage mounting in App.tsx');
}
