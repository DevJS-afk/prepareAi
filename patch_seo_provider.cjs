const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Inject the import
if (!content.includes('import SEOProvider from')) {
    content = content.replace("import Dashboard from './components/WelcomeScreen';", "import SEOProvider from './components/SEOProvider';\nimport Dashboard from './components/WelcomeScreen';");
}

// Ensure Toaster is there, then inject SEOProvider right after it
if (!content.includes('<SEOProvider />')) {
    content = content.replace('<Toaster position="top-center" richColors theme="system" />', '<Toaster position="top-center" richColors theme="system" />\n       <SEOProvider />');
}

fs.writeFileSync('src/App.tsx', content);
console.log('Injected SEOProvider into App.tsx');
