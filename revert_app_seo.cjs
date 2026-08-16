const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// We know that `<><RouteMeta ... />{` was added.
// We can remove it.
content = content.replace(/<><RouteMeta[^>]+>\s*\{/g, '');

// We know that we added `</>}</>} />` or `}</>} />` or `</>} />` in places we shouldn't have.
// Let's just fix the ends of the elements.
// Actually, it's safer to just replace all `</>} />` with `} />` 
// and `}</>} />` with `} />`
// Wait, `}</>} />` => `} />`
content = content.replace(/\}\<\/}\>\s*\/\>/g, '} />');
content = content.replace(/\<\/}\>\s*\/\>/g, ' />');
content = content.replace(/\}<\/\>\} \/>/g, '} />');
content = content.replace(/<\/\>\} \/>/g, '} />'); // for cases like onBack={() => navigate('/')}</>} />

// Let's do a more robust cleanup
content = content.replace(/<\/\>\}\s*\/\>/g, ' />'); 
content = content.replace(/\}\s*<\/\>\}\s*\/\>/g, '} />');

// Let's review the messy ones:
// navigate('/')}</>} /> -> navigate('/')} />
content = content.replace(/navigate\('\/'\)\}<\/\>\}\s*\/\>/g, "navigate('/')} />");
content = content.replace(/navigate\('\/dashboard'\)\}<\/\>\}\s*\/\>/g, "navigate('/dashboard')} />");

fs.writeFileSync('src/App.tsx.clean', content);
