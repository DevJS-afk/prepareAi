const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const profileMobileButton = `<button 
                        onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} 
                        className={\`w-full text-left text-sm font-medium transition-colors py-2 \${location.pathname === '/profile' ? 'text-brand-blue' : 'text-slate-600 dark:text-gray-300'}\`}
                      >{t('nav.profile')}
                      </button>`;

const newMobileButtons = `<button 
                        onClick={() => { navigate('/changelog'); setIsMenuOpen(false); }} 
                        className={\`w-full text-left text-sm font-medium transition-colors py-2 \${location.pathname === '/changelog' ? 'text-brand-green' : 'text-slate-600 dark:text-gray-300'}\`}
                      >Changelog
                      </button>\n                      ` + profileMobileButton;

if (content.includes("onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}")) {
    content = content.replace(profileMobileButton, newMobileButtons);
    fs.writeFileSync('src/App.tsx', content);
    console.log('Added Changelog to mobile header');
} else {
    console.log('Failed to find profile mobile button in App.tsx');
}
