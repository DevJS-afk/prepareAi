const fs = require('fs');

function patchApp() {
    const file = 'src/App.tsx';
    let code = fs.readFileSync(file, 'utf8');
    
    // add import
    if (!code.includes('import LanguageSwitcher')) {
        code = code.replace("import CookieBanner from './components/CookieBanner';", "import CookieBanner from './components/CookieBanner';\nimport LanguageSwitcher from './components/LanguageSwitcher';");
    }
    
    // replace select (desktop)
    const oldSelect1 = `<select
                          className="bg-transparent border-none text-slate-600 dark:text-gray-300 text-sm font-medium focus:ring-0 cursor-pointer outline-none uppercase"
                          value={i18n.language.split('-')[0]}
                          onChange={(e) => i18n.changeLanguage(e.target.value)}
                        >
                          <option value="en" className="bg-white dark:bg-slate-800">🇬🇧</option>
                          <option value="fr" className="bg-white dark:bg-slate-800">🇫🇷</option>
                          <option value="es" className="bg-white dark:bg-slate-800">🇪🇸</option>
                        </select>`;
    code = code.replace(oldSelect1, `<LanguageSwitcher />`);
    
    // replace select (mobile)
    const oldSelect2 = `<select
                          className="bg-slate-100 dark:bg-white/5 border-none text-slate-600 dark:text-gray-300 text-sm font-medium focus:ring-0 cursor-pointer outline-none uppercase py-1.5 px-3 rounded-lg"
                          value={i18n.language.split('-')[0]}
                          onChange={(e) => i18n.changeLanguage(e.target.value)}
                        >
                          <option value="en" className="bg-white dark:bg-slate-800">🇬🇧</option>
                          <option value="fr" className="bg-white dark:bg-slate-800">🇫🇷</option>
                          <option value="es" className="bg-white dark:bg-slate-800">🇪🇸</option>
                        </select>`;
    code = code.replace(oldSelect2, `<LanguageSwitcher />`);
    
    fs.writeFileSync(file, code);
    console.log("Patched App.tsx");
}

function patchLanding() {
    const file = 'src/components/LandingPage.tsx';
    let code = fs.readFileSync(file, 'utf8');
    
    // add import
    if (!code.includes('import LanguageSwitcher')) {
        code = code.replace("import { useTranslation } from 'react-i18next';", "import { useTranslation } from 'react-i18next';\nimport LanguageSwitcher from './LanguageSwitcher';");
    }
    
    // replace select (desktop)
    const oldSelect1 = `<select
                          className="bg-transparent border-none text-slate-600 dark:text-gray-300 text-sm font-medium focus:ring-0 cursor-pointer outline-none uppercase"
                          value={i18n.language.split('-')[0]}
                          onChange={(e) => i18n.changeLanguage(e.target.value)}
                        >
                          <option value="en" className="bg-white dark:bg-slate-800">🇬🇧</option>
                          <option value="fr" className="bg-white dark:bg-slate-800">🇫🇷</option>
                          <option value="es" className="bg-white dark:bg-slate-800">🇪🇸</option>
                      </select>`;
    code = code.replace(oldSelect1, `<LanguageSwitcher />`);
    
    // replace select (mobile)
    const oldSelect2 = `<select
                          className="bg-slate-100 dark:bg-white/5 border-none text-slate-600 dark:text-gray-300 text-sm font-medium focus:ring-0 cursor-pointer outline-none uppercase py-1.5 px-3 rounded-lg"
                          value={i18n.language.split('-')[0]}
                          onChange={(e) => i18n.changeLanguage(e.target.value)}
                        >
                          <option value="en" className="bg-white dark:bg-slate-800">🇬🇧</option>
                          <option value="fr" className="bg-white dark:bg-slate-800">🇫🇷</option>
                          <option value="es" className="bg-white dark:bg-slate-800">🇪🇸</option>
                      </select>`;
    code = code.replace(oldSelect2, `<LanguageSwitcher />`);
    
    fs.writeFileSync(file, code);
    console.log("Patched LandingPage.tsx");
}

patchApp();
patchLanding();
