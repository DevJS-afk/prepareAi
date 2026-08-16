const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// I will just download the original App.tsx or revert it using string manipulation
// since I know what the replacements did.

// Actually, I can just replace `<><RouteMeta ... /> ` with `<><RouteMeta ... />{`
// And `</>}` with `}</>}`
// Wait, for `element={<><RouteMeta ... />`

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.includes('<RouteMeta')) {
        // find `<><RouteMeta ... /> `
        const parts = line.split(' /> ');
        if (parts.length > 1 && line.includes('element={<><RouteMeta')) {
            // It means there is a space after `/>` which separates the meta tag from the JS code
            // example: `element={<><RouteMeta title="..." /> !session ? <LandingPage...`
            // We want to replace ` /> ` with ` />{`
            line = line.replace(' /> ', ' />{');
        }
        
        // Also fix the closing tag if it exists on the same line
        if (line.endsWith('</>} />')) {
            line = line.replace('</>} />', '}</>} />');
        }
    } else if (line.endsWith('</>} />')) {
        // Close bracket for multi-line elements
        line = line.replace('</>} />', '}</>} />');
    } else if (line.endsWith('</>} />            ) : <Navigate to="/auth" />} />')) {
        line = line.replace('</>} />            ) : <Navigate to="/auth" />} />', '}</>} />            ) : <Navigate to="/auth" />} />');
    }
    
    // Some routes were just `element={<><RouteMeta ... /> <AboutUs ... /></>} />`
    // where they didn't start with a JS expression.
    // If it starts with `<Component`, it's valid JSX and doesn't need `{}`
    // But we replaced it blindly. Let's see if we added `{` before `<Component`
    
    lines[i] = line;
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log('Fixed App.tsx syntax');

