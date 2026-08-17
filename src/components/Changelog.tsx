import React from 'react';
import { useTranslation } from 'react-i18next';

interface ChangelogProps {
  onBack: () => void;
}

const Changelog: React.FC<ChangelogProps> = ({ onBack }) => {
  const { t } = useTranslation();

  const releases = [
    {
      version: 'v1.3.0',
      date: 'August 16, 2026',
      title: 'Seamless Auto-Recording & Real-Time Feedback',
      changes: [
        { type: 'feature', text: 'Implemented automatic video recording upon entering the live interview studio.' },
        { type: 'feature', text: 'Added Web Audio API integration for flawless mixing of user microphone and AI voice.' },
        { type: 'improvement', text: 'Redesigned the live interview screen to prioritize the user\'s camera in a full-screen background format with a Picture-in-Picture AI interviewer.' },
        { type: 'fix', text: 'Removed generic mock data fallbacks when rate limits are hit; replaced with explicit error handling.' },
      ]
    },
    {
      version: 'v1.2.0',
      date: 'July 22, 2026',
      title: 'Career Documents & Portfolio Builders',
      changes: [
        { type: 'feature', text: 'Introduced the ATS-friendly CV Builder with real-time preview.' },
        { type: 'feature', text: 'Added the Smart Cover Letter generator tailored to job descriptions.' },
        { type: 'improvement', text: 'Enhanced UI elements across the platform for better accessibility.' },
      ]
    },
    {
      version: 'v1.1.0',
      date: 'June 05, 2026',
      title: 'Recruiter Dashboard & Analytics',
      changes: [
        { type: 'feature', text: 'Launched the Recruiter Dashboard for generating invite links and tracking candidates.' },
        { type: 'feature', text: 'Added granular performance metrics (Clarity, Pacing) to End Interview reports.' },
        { type: 'fix', text: 'Resolved an issue with transcription lag during extended interview sessions.' },
      ]
    },
    {
      version: 'v1.0.0',
      date: 'May 10, 2026',
      title: 'Initial Release: prepareAI',
      changes: [
        { type: 'feature', text: 'Launched the core AI Interview coaching engine.' },
        { type: 'feature', text: 'Added multi-language support (15+ languages).' },
        { type: 'feature', text: 'Integrated facial expression and confidence tracking modules.' },
      ]
    }
  ];

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-brand-blue/20 text-brand-blue border-brand-blue/30';
      case 'fix': return 'bg-brand-red/20 text-red-500 border-brand-red/30';
      case 'improvement': return 'bg-brand-green/20 text-brand-green border-brand-green/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-white transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-brand-purple/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
          <div className="absolute -bottom-40 left-20 w-96 h-96 bg-brand-blue/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-6 py-12 relative z-10">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
        </button>

        <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Changelog</h1>
            <p className="text-lg text-slate-600 dark:text-gray-400">Discover the latest updates, improvements, and fixes to prepareAI.</p>
        </div>

        <div className="space-y-12">
            {releases.map((release, index) => (
                <div key={index} className="relative pl-8 md:pl-0">
                    <div className="md:grid md:grid-cols-4 md:gap-8 items-start">
                        <div className="mb-4 md:mb-0 md:col-span-1 md:sticky md:top-24">
                            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-1">{release.version}</h2>
                            <p className="text-sm text-slate-500 dark:text-gray-400">{release.date}</p>
                        </div>
                        
                        <div className="md:col-span-3 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/50 dark:bg-black/20 shadow-sm relative">
                            {/* Timeline connector line (desktop) */}
                            <div className="hidden md:block absolute -left-[2.85rem] top-8 w-8 border-t-2 border-slate-200 dark:border-white/10 border-dashed"></div>
                            {/* Timeline dot */}
                            <div className="absolute -left-10 top-7 md:-left-[3.2rem] w-4 h-4 rounded-full bg-slate-50 dark:bg-dark-bg border-4 border-brand-blue z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{release.title}</h3>
                            
                            <ul className="space-y-4">
                                {release.changes.map((change, i) => (
                                    <li key={i} className="flex flex-col sm:flex-row sm:items-start gap-3">
                                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded border text-xs font-bold uppercase tracking-wider shrink-0 sm:mt-0.5 ${getBadgeColor(change.type)}`}>
                                            {change.type}
                                        </span>
                                        <span className="text-slate-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                            {change.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Vertical line connecting entries */}
                    {index !== releases.length - 1 && (
                        <div className="absolute left-[-2rem] top-12 bottom-[-3rem] md:left-[-3rem] md:bottom-[-3rem] w-px bg-slate-200 dark:bg-white/10 -z-10 hidden sm:block"></div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Changelog;
