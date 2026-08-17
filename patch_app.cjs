const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import Changelog from './components/Changelog';")) {
    content = content.replace("import LandingPage from './components/LandingPage';", "import LandingPage from './components/LandingPage';\nimport Changelog from './components/Changelog';");
}

if (!content.includes('<Route path="/changelog"')) {
    content = content.replace('<Route path="/about"', '<Route path="/changelog" element={<Changelog onBack={() => navigate(\'/\')} />} />\n            <Route path="/about"');
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched');
