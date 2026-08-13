const fs = require('fs');
let code = fs.readFileSync('src/components/EndScreen.tsx', 'utf8');

const targetIndex = code.indexOf('<h3 className="text-lg font-bold text-white mb-4">{t(\'EndScreen.actionableAdvice\')}</h3>');
if (targetIndex !== -1) {
    const start = code.lastIndexOf('<div className="glass-panel', targetIndex);
    const end = code.indexOf('</div>', targetIndex) + 6;
    const end2 = code.indexOf('</div>', end) + 6; // closing lg:col-span-8

    const oldBlock = code.substring(start, end2);
    // Let's replace just the inner block
    const newBlock = code.substring(start, end) + `

                 {transcription && transcription.length > 0 && (
                     <div className="glass-panel p-8 rounded-2xl mt-6">
                         <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                             <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
                             {t('EndScreen.transcriptionTitle', 'Interview Transcription & Feedback')}
                         </h3>
                         <div className="space-y-6">
                             {transcription.map((entry, idx) => {
                                 const isUser = entry.speaker === 'user';
                                 const fb = isUser ? feedback.find(f => f.userText === entry.text) : null;
                                 return (
                                     <div key={idx} className={\`p-4 rounded-xl \${isUser ? 'bg-black/20 border border-white/5' : 'bg-brand-blue/10 border border-brand-blue/20'}\`}>
                                         <div className="flex items-center gap-2 mb-2">
                                             <span className={\`text-xs font-bold uppercase tracking-wider \${isUser ? 'text-gray-400' : 'text-brand-blue'}\`}>
                                                 {isUser ? t('EndScreen.you', 'You') : t('EndScreen.aiInterviewer', 'AI Interviewer')}
                                             </span>
                                         </div>
                                         <p className="text-gray-300 text-sm leading-relaxed">{entry.text}</p>
                                         {fb && fb.feedbackText && (
                                             <div className="mt-4 pt-4 border-t border-white/5">
                                                 <div className="text-xs font-bold text-brand-purple uppercase tracking-wider mb-1">{t('EndScreen.aiFeedbackTitle', 'AI Feedback')}</div>
                                                 <p className="text-brand-purple/90 text-sm italic">{fb.feedbackText}</p>
                                             </div>
                                         )}
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                 )}
            </div>`;
    
    code = code.replace(oldBlock, newBlock);
    fs.writeFileSync('src/components/EndScreen.tsx', code);
    console.log("Patched successfully.");
} else {
    console.log("Target not found");
}
