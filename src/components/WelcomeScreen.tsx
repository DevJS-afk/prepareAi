import React from 'react';
import type { InterviewConfig } from '../types';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
  onNavigate: (view: 'dashboard' | 'interview-setup' | 'cv-builder' | 'motivation-letter' | 'profile' | 'portfolio-builder' | 'job-board' | 'admin-dashboard') => void;
  userName?: string | null;
  isAdmin?: boolean;
  pendingConfig?: InterviewConfig | null;
  onStartAssigned?: () => void;
  lastUsedConfig?: InterviewConfig | null;
  onStartLastUsed?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, userName, isAdmin, pendingConfig, onStartAssigned, lastUsedConfig, onStartLastUsed }) => {
  const { t } = useTranslation();

  const isCandidateMode = !!pendingConfig;

  return (
    <div className="w-full max-w-7xl mx-auto animate-slide-up py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
          {t('welcome.title')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green">{userName?.split('@')[0] || 'Candidate'}</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
          {isCandidateMode 
             ? t('welcome.candidateSubtitle')
             : t('welcome.userSubtitle')}
        </p>

        
      </div>

      {/* Grid Section */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isCandidateMode ? 'max-w-xl mx-auto' : ''}`}>
        
        {/* Candidate View */}
        {pendingConfig && (
             <div 
                onClick={onStartAssigned}
                className="col-span-full glass-panel group p-10 rounded-[2rem] border border-brand-green/30 hover:border-brand-green cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-lg dark:shadow-[0_0_30px_rgba(34,197,94,0.1)] dark:hover:shadow-[0_0_50px_rgba(34,197,94,0.2)] bg-gradient-to-br from-white to-brand-green/5 dark:from-white/5 dark:to-brand-green/10"
             >
                <div className="absolute inset-0 bg-brand-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative shrink-0">
                  <div className="absolute -inset-4 rounded-full bg-brand-green/20 animate-pulse"></div>
                  <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green group-hover:scale-110 transition-transform duration-500 border-2 border-brand-green/30 relative z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                  </div>
                </div>

                <div className="text-center md:text-left flex-grow">
                  <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">{t('welcome.startAssigned')}</h3>
                  <p className="text-lg text-slate-600 dark:text-gray-300 leading-relaxed mb-6">
                      Your recruiter has assigned you the <strong className="text-brand-green">{pendingConfig.name}</strong> assessment. Click here to begin your secure session.
                  </p>
                  <div className="inline-flex items-center text-brand-green font-bold text-lg group-hover:translate-x-2 transition-transform bg-brand-green/10 px-6 py-3 rounded-full">
                      {t('welcome.joinSession')} <span className="ml-2">→</span>
                  </div>
                </div>
            </div>
        )}

        {!isCandidateMode && (
            <>
                {/* Quick Start */}
                {lastUsedConfig && (
                    <div 
                      onClick={onStartLastUsed}
                      className="glass-panel group p-8 rounded-[2rem] border border-orange-500/30 hover:border-orange-500/60 cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col bg-gradient-to-br from-white to-orange-500/5 dark:from-white/5 dark:to-orange-500/10 shadow-md hover:shadow-xl"
                    >
                        <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-8 text-orange-500 group-hover:scale-110 transition-transform duration-500 border border-orange-500/20 relative z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-3">{t('welcome.quickStart')}</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-8 flex-grow">
                            Resume your last interview: <strong className="text-orange-500">{lastUsedConfig.name}</strong>
                        </p>
                        <div className="flex items-center text-orange-500 font-bold text-sm group-hover:translate-x-2 transition-transform">
                            Launch Now <span className="ml-2">→</span>
                        </div>
                    </div>
                )}

                {/* Interview Practice - Large Feature Card */}
                <div 
                onClick={() => onNavigate('interview-setup')}
                className={`${lastUsedConfig ? 'md:col-span-1 lg:col-span-2' : 'md:col-span-2 lg:col-span-2'} glass-panel group rounded-[2rem] border border-slate-200/80 dark:border-white/10 hover:border-brand-blue/50 dark:hover:border-brand-blue/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col md:flex-row bg-white/40 dark:bg-gradient-to-br dark:from-white/5 dark:to-brand-blue/10 shadow-md hover:shadow-xl p-0`}
                >
                  <div className="w-full md:w-2/5 h-48 md:h-auto relative overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80" alt="Interview Practice" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white dark:to-[#030712] opacity-0 md:opacity-90 hidden md:block"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#030712] to-transparent opacity-90 md:hidden"></div>
                  </div>
                  
                  <div className="p-8 md:p-10 flex flex-col justify-center flex-grow relative z-10">
                    <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform duration-500 border border-brand-blue/20 shadow-inner mb-6 bg-white dark:bg-slate-900 md:-ml-12 md:mt-0 -mt-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    
                    <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">Interview Practice</h3>
                    <p className="text-base text-slate-600 dark:text-gray-400 leading-relaxed mb-6 max-w-md">
                        Simulate realistic interviews with an AI recruiter. Get real-time feedback and detailed reports.
                    </p>
                    <div className="flex items-center text-brand-blue font-bold text-base group-hover:translate-x-2 transition-transform mt-auto">
                        Start Session <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>

                {/* AI CV Builder */}
                <div 
                onClick={() => onNavigate('cv-builder')}
                className="glass-panel group rounded-[2rem] border border-slate-200/80 dark:border-white/10 hover:border-brand-purple/50 dark:hover:border-brand-purple/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col bg-white/40 dark:bg-gradient-to-b dark:from-white/5 dark:to-transparent shadow-md hover:shadow-xl p-0"
                >
                  <div className="h-40 w-full relative overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80" alt="CV Builder" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#030712] to-transparent opacity-90"></div>
                  </div>
                  <div className="p-8 pt-0 flex flex-col flex-grow relative z-10">
                      <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center mb-6 text-brand-purple group-hover:scale-110 transition-transform duration-500 border border-brand-purple/20 -mt-7 bg-white dark:bg-slate-900 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                      </div>
                      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-3">AI CV Builder</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-6 flex-grow">
                          Create a professional, ATS-friendly resume. Input your details and let our AI polish your bullet points.
                      </p>
                      <div className="flex items-center text-brand-purple font-bold text-sm group-hover:translate-x-2 transition-transform">
                          Build CV <span className="ml-2">→</span>
                      </div>
                  </div>
                </div>

                {/* Cover Letter Gen */}
                <div 
                onClick={() => onNavigate('motivation-letter')}
                className="glass-panel group rounded-[2rem] border border-slate-200/80 dark:border-white/10 hover:border-brand-green/50 dark:hover:border-brand-green/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col bg-white/40 dark:bg-gradient-to-b dark:from-white/5 dark:to-transparent shadow-md hover:shadow-xl p-0"
                >
                  <div className="h-40 w-full relative overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1554774853-719586f82d77?w=800&q=80" alt="Cover Letter Generator" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#030712] to-transparent opacity-90"></div>
                  </div>
                  <div className="p-8 pt-0 flex flex-col flex-grow relative z-10">
                      <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-6 text-brand-green group-hover:scale-110 transition-transform duration-500 border border-brand-green/20 -mt-7 bg-white dark:bg-slate-900 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                      </div>
                      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-3">Cover Letter Gen</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-6 flex-grow">
                          Generate persuasive cover letters tailored to specific job descriptions instantly.
                      </p>
                      <div className="flex items-center text-brand-green font-bold text-sm group-hover:translate-x-2 transition-transform">
                          Write Letter <span className="ml-2">→</span>
                      </div>
                  </div>
                </div>

                {/* Portfolio Builder */}
                <div 
                onClick={() => onNavigate('portfolio-builder')}
                className="glass-panel group rounded-[2rem] border border-slate-200/80 dark:border-white/10 hover:border-brand-yellow/50 dark:hover:border-brand-yellow/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col bg-white/40 dark:bg-gradient-to-b dark:from-white/5 dark:to-transparent shadow-md hover:shadow-xl p-0"
                >
                  <div className="h-40 w-full relative overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" alt="Portfolio Builder" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#030712] to-transparent opacity-90"></div>
                  </div>
                  <div className="p-8 pt-0 flex flex-col flex-grow relative z-10">
                      <div className="w-14 h-14 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mb-6 text-brand-yellow group-hover:scale-110 transition-transform duration-500 border border-brand-yellow/20 -mt-7 bg-white dark:bg-slate-900 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                      </div>
                      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-3">Portfolio Builder</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-6 flex-grow">
                          Create a stunning, single-page portfolio website. Showcase your projects and skills effortlessly.
                      </p>
                      <div className="flex items-center text-brand-yellow font-bold text-sm group-hover:translate-x-2 transition-transform">
                          Build Portfolio <span className="ml-2">→</span>
                      </div>
                  </div>
                </div>

                {/* Job Board */}
                <div 
                onClick={() => onNavigate('job-board')}
                className="glass-panel group rounded-[2rem] border border-slate-200/80 dark:border-white/10 hover:border-brand-teal/50 dark:hover:border-teal-500/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col bg-white/40 dark:bg-gradient-to-b dark:from-white/5 dark:to-transparent shadow-md hover:shadow-xl p-0"
                >
                  <div className="h-40 w-full relative overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80" alt="Job Board" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#030712] to-transparent opacity-90"></div>
                  </div>
                  <div className="p-8 pt-0 flex flex-col flex-grow relative z-10">
                      <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 text-teal-500 group-hover:scale-110 transition-transform duration-500 border border-teal-500/20 -mt-7 bg-white dark:bg-slate-900 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                      </div>
                      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-3">{t('welcome.jobBoard')}</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-6 flex-grow">
                          Browse active job openings from top platforms tailored to your career goals.
                      </p>
                      <div className="flex items-center text-teal-500 font-bold text-sm group-hover:translate-x-2 transition-transform">
                          Find Jobs <span className="ml-2">→</span>
                      </div>
                  </div>
                </div>
            
            </>
        )}

        {isAdmin && (
            <div 
              onClick={() => onNavigate('admin-dashboard')}
              className="lg:col-span-3 glass-panel group p-8 rounded-[2rem] border border-brand-red/30 hover:border-brand-red cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-md hover:shadow-lg dark:shadow-[0_0_30px_rgba(239,68,68,0.05)] dark:hover:shadow-[0_0_50px_rgba(239,68,68,0.15)] bg-gradient-to-r from-transparent to-brand-red/5"
            >
               <div className="w-14 h-14 shrink-0 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform duration-500 border border-brand-red/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
               </div>
               <div className="flex-grow text-center md:text-left">
                 <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">Admin Dashboard</h3>
                 <p className="text-sm text-slate-600 dark:text-gray-400">
                   Access system statistics, manage users, and view platform activity.
                 </p>
               </div>
               <div className="flex items-center text-brand-red font-bold text-sm group-hover:translate-x-2 transition-transform bg-brand-red/10 px-4 py-2 rounded-full whitespace-nowrap">
                 Open Panel <span className="ml-2">→</span>
               </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

