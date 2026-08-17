const fs = require('fs');

function patchFile(file) {
    let code = fs.readFileSync(file, 'utf8');
    const replacements = [
        { old: '🇬🇧 EN', new: '🇬🇧' },
        { old: '🇫🇷 FR', new: '🇫🇷' },
        { old: '🇪🇸 ES', new: '🇪🇸' }
    ];
    
    let modified = false;
    for (const r of replacements) {
        if (code.includes(r.old)) {
            code = code.split(r.old).join(r.new);
            modified = true;
        }
    }
    
    if (modified) {
        fs.writeFileSync(file, code);
        console.log("Patched " + file);
    } else {
        console.log("Could not find code in " + file);
    }
}

patchFile('src/App.tsx');
patchFile('src/components/LandingPage.tsx');
