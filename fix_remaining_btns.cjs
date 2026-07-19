const fs = require('fs');

let intDash = fs.readFileSync('src/components/InterviewerDashboard.tsx', 'utf-8');
intDash = intDash.replace(/bg-brand-purple flex items-center justify-center text-xl font-bold text-slate-900 dark:text-white/g, 'bg-brand-purple flex items-center justify-center text-xl font-bold text-white');
fs.writeFileSync('src/components/InterviewerDashboard.tsx', intDash);

let profScr = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf-8');
profScr = profScr.replace(/bg-brand-blue rounded-lg text-sm font-bold text-slate-900 dark:text-white/g, 'bg-brand-blue rounded-lg text-sm font-bold text-white');
profScr = profScr.replace(/bg-brand-blue rounded-lg text-xs font-bold text-slate-900 dark:text-white/g, 'bg-brand-blue rounded-lg text-xs font-bold text-white');

profScr = profScr.replace(/bg-white\/10 hover:bg-brand-purple\/50/g, 'bg-slate-200 dark:bg-white/10 hover:bg-brand-purple/20 dark:hover:bg-brand-purple/50');
profScr = profScr.replace(/bg-white\/10 hover:bg-brand-green\/50/g, 'bg-slate-200 dark:bg-white/10 hover:bg-brand-green/20 dark:hover:bg-brand-green/50');
profScr = profScr.replace(/bg-white\/10 hover:bg-brand-yellow\/50/g, 'bg-slate-200 dark:bg-white/10 hover:bg-brand-yellow/20 dark:hover:bg-brand-yellow/50');

fs.writeFileSync('src/components/ProfileScreen.tsx', profScr);

let intSet = fs.readFileSync('src/components/InterviewSetup.tsx', 'utf-8');
intSet = intSet.replace(/bg-brand-blue border-brand-blue text-slate-900 dark:text-white/g, 'bg-brand-blue border-brand-blue text-white');
fs.writeFileSync('src/components/InterviewSetup.tsx', intSet);

console.log('Fixed remaining buttons');
