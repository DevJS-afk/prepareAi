const fs = require('fs');
let content = fs.readFileSync('src/components/CVBuilder.tsx', 'utf8');

// 1. Add state for cvLanguage
const stateToAdd = `
  const [cvLanguage, setCvLanguage] = useState<string>('Original');
  const GLOBAL_LANGUAGES = [
    'Original',
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Arabic',
    'Russian',
    'Portuguese',
    'Hindi',
    'Italian',
    'Korean'
  ];
`;
content = content.replace(/(const \[generatedCV, setGeneratedCV\] = useState<string>\(''\);)/, `$1${stateToAdd}`);

// 2. Add language selector in the UI
const selectorUI = `
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                        Language
                    </h3>
                    <select 
                        value={cvLanguage}
                        onChange={(e) => setCvLanguage(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/50 outline-none text-slate-900 dark:text-white"
                    >
                        {GLOBAL_LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                        {t('CVBuilder.PersonalDetails')}
`;
content = content.replace(/<div className="space-y-4">\s*<h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">\s*<span className="w-2 h-2 rounded-full bg-brand-blue"><\/span>\s*\{t\('CVBuilder\.PersonalDetails'\)\}/, selectorUI);


// 3. Update handleGenerate to call Gemini for translation if language is not Original
const oldSetGeneratedCV = `setGeneratedCV(fullHtml);`;
const newSetGeneratedCV = `
        let finalHtml = fullHtml;
        if (cvLanguage !== 'Original') {
            try {
                const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
                const prompt = \`
                    Translate the following HTML CV content into \${cvLanguage}.
                    Maintain EXACTLY the same HTML structure, tags, classes, and styles.
                    Translate all visible text, including hardcoded section titles like 'Experience' or 'Education'.
                    Do NOT wrap the response in markdown blocks. Return only the raw HTML string.
                    
                    HTML to translate:
                    \${fullHtml}
                \`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-3.1-pro-preview',
                    contents: prompt,
                });
                
                if (response.text) {
                    finalHtml = response.text;
                    if (finalHtml.startsWith('\`\`\`html')) {
                        finalHtml = finalHtml.replace(/^\`\`\`html\\n/, '').replace(/\\n\`\`\`$/, '');
                    }
                }
            } catch (err) {
                console.error("Translation failed", err);
                toast.error("Failed to translate CV. Showing original.");
            }
        }
        setGeneratedCV(finalHtml);
`;

content = content.replace(oldSetGeneratedCV, newSetGeneratedCV);

fs.writeFileSync('src/components/CVBuilder.tsx', content);
console.log('CVBuilder patched');
