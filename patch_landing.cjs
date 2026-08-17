const fs = require('fs');
let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

// Update LandingPageProps
if (!content.includes('onChangelog: () => void;')) {
    content = content.replace('onTerms: () => void;', 'onTerms: () => void;\n  onChangelog: () => void;');
}

// Update component signature
content = content.replace(
    'const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onAbout, onPrivacy, onTerms, theme, toggleTheme }) => {',
    'const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onAbout, onPrivacy, onTerms, onChangelog, theme, toggleTheme }) => {'
);

// Update footer links
const oldFooter = '<a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>';
const newFooter = '<button onClick={onChangelog} className="hover:text-slate-900 dark:hover:text-white transition-colors">Changelog</button>\n                  <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>';
if (!content.includes('>Changelog</button>')) {
    content = content.replace(oldFooter, newFooter);
}

fs.writeFileSync('src/components/LandingPage.tsx', content);
console.log('LandingPage.tsx patched');
