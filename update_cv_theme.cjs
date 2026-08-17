const fs = require('fs');
let code = fs.readFileSync('src/components/CVBuilder.tsx', 'utf8');

// 1. Remove from top bar
const selectBlock = `                 <div className="relative group">
                     <select 
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
                        className="appearance-none bg-white dark:bg-slate-900/50 hover:bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-slate-900 dark:text-white transition-colors cursor-pointer outline-none focus:border-brand-purple"
                     >
                         <option value="modern">{t('CVBuilder.ModernTech')}</option>
                         <option value="classic">{t('CVBuilder.ClassicProfessional')}</option>
                         <option value="creative">{t('CVBuilder.CreativeStudio')}</option>
                         <option value="minimalist">{t('CVBuilder.Minimalist')}</option>
                     </select>
                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                     </div>
                 </div>`;

code = code.replace(selectBlock, '');

// 2. Insert at the top of the left panel
const topOfPanel = `<div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/5 bg-slate-200/30 dark:bg-black/20 lg:overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 sm:space-y-8 lg:h-full shrink-0">`;

const themeSelectorHTML = `
                {/* Theme & Layout Editor Section */}
                <div className="space-y-4 border-b border-slate-200 dark:border-white/5 pb-6">
                    <h3 className="text-sm font-bold text-brand-purple uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse"></span>
                        CV Style Theme
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'modern', name: t('CVBuilder.ModernTech'), colors: 'bg-white border-brand-purple', desc: 'Clean, sans-serif' },
                            { id: 'classic', name: t('CVBuilder.ClassicProfessional'), colors: 'bg-slate-100 border-gray-400', desc: 'Traditional serif' },
                            { id: 'creative', name: t('CVBuilder.CreativeStudio'), colors: 'bg-[#1a1a1a] border-pink-500', desc: 'Bold layout' },
                            { id: 'minimalist', name: t('CVBuilder.Minimalist'), colors: 'bg-gray-50 border-slate-300', desc: 'High whitespace' },
                        ].map(theme => (
                            <button
                                key={theme.id}
                                type="button"
                                onClick={() => setSelectedTemplate(theme.id as TemplateType)}
                                className={\`flex flex-col text-left p-2 border text-xs transition-all duration-200 rounded-xl \${
                                    selectedTemplate === theme.id 
                                        ? 'bg-white/10 border-brand-purple text-slate-900 dark:text-white shadow-lg shadow-brand-purple/10' 
                                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10'
                                }\`}
                            >
                                <div className="flex items-center gap-1.5 font-bold mb-1">
                                    <span className={\`w-2.5 h-2.5 rounded-full \${theme.colors} border\`}></span>
                                    {theme.name}
                                </div>
                                <span className="text-[10px] text-slate-500 dark:text-gray-500 leading-tight">{theme.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
`;

code = code.replace(topOfPanel, topOfPanel + themeSelectorHTML);

fs.writeFileSync('src/components/CVBuilder.tsx', code);
console.log("Done");
