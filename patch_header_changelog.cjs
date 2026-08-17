const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const profileButton = `<button 
                          onClick={() => navigate('/profile')} 
                          className={\`text-sm font-medium transition-colors relative group \${location.pathname === '/profile' ? 'text-brand-blue' : 'text-slate-600 hover:text-brand-blue dark:text-gray-300 dark:hover:text-brand-blue'}\`}
                        >{t('nav.profile')}<span className={\`absolute -bottom-1 left-0 h-0.5 bg-brand-blue transition-all \${location.pathname === '/profile' ? 'w-full' : 'w-0 group-hover:w-full'}\`}></span>
                        </button>`;

const newButtons = `<button 
                          onClick={() => navigate('/changelog')} 
                          className={\`text-sm font-medium transition-colors relative group \${location.pathname === '/changelog' ? 'text-brand-green' : 'text-slate-600 hover:text-brand-green dark:text-gray-300 dark:hover:text-brand-green'}\`}
                        >Changelog<span className={\`absolute -bottom-1 left-0 h-0.5 bg-brand-green transition-all \${location.pathname === '/changelog' ? 'w-full' : 'w-0 group-hover:w-full'}\`}></span>
                        </button>\n                        ` + profileButton;

if (content.includes("navigate('/profile')")) {
    content = content.replace(profileButton, newButtons);
    fs.writeFileSync('src/App.tsx', content);
    console.log('Added Changelog to header');
} else {
    console.log('Failed to find profile button in App.tsx');
}
