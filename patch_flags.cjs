const fs = require('fs');

function patchFile(file) {
    let code = fs.readFileSync(file, 'utf8');
    const oldCode = `<option value="en" className="bg-white dark:bg-slate-800">EN</option>
                      <option value="fr" className="bg-white dark:bg-slate-800">FR</option>
                      <option value="es" className="bg-white dark:bg-slate-800">ES</option>`;
    const newCode = `<option value="en" className="bg-white dark:bg-slate-800">🇬🇧 EN</option>
                      <option value="fr" className="bg-white dark:bg-slate-800">🇫🇷 FR</option>
                      <option value="es" className="bg-white dark:bg-slate-800">🇪🇸 ES</option>`;
                      
    if (code.includes(oldCode)) {
        code = code.replace(oldCode, newCode);
        fs.writeFileSync(file, code);
        console.log("Patched " + file);
    } else {
        console.log("Could not find code in " + file);
    }
}

patchFile('src/App.tsx');
patchFile('src/components/LandingPage.tsx');
