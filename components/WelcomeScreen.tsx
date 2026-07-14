
import React from 'react';
import type { InterviewConfig } from '../types';

interface DashboardProps {
  onNavigate: (view: 'dashboard' | 'interview-setup' | 'cv-builder' | 'motivation-letter' | 'profile' | 'portfolio-builder' | 'job-board' | 'admin-dashboard') => void;
  userName?: string | null;
  isAdmin?: boolean;
  pendingConfig?: InterviewConfig | null;
  onStartAssigned?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, userName, isAdmin, pendingConfig, onStartAssigned }) => {
  // Candidate Mode: If pendingConfig exists, showing restricted view
  const isCandidateMode = !!pendingConfig;

  return (
    <div className="w-full max-w-7xl animate-slide-up py-8">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight">
           Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">{userName?.split('@')[0] || 'Candidate'}</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl font-light">
          {isCandidateMode 
            ? "You have been invited to complete a skill assessment. Please find your assigned interview below." 
            : "Ready to accelerate your career? Choose a tool to get started."}
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isCandidateMode ? 'justify-center max-w-lg mx-auto md:grid-cols-1 lg:grid-cols-1' : ''}`}>
        
        {/* Assigned Interview Card (Visible to Candidate) */}
        {pendingConfig && (
             <div 
                onClick={onStartAssigned}
                className="glass-panel group p-8 rounded-3xl border border-brand-green/30 hover:border-brand-green cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col shadow-[0_0_30px_rgba(34,197,94,0.1)] hover:shadow-[0_0_50px_rgba(34,197,94,0.2)]"
             >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-6 right-6 animate-pulse">
                    <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-green"></span>
                    </span>
                </div>
                <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-8 text-brand-green group-hover:scale-110 transition-transform duration-500 border border-brand-green/20 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Start Assigned Interview</h3>
                <p className="text-base text-gray-400 leading-relaxed mb-8 flex-grow">
                    Your recruiter has assigned you the <strong className="text-brand-green">{pendingConfig.name}</strong> assessment. Click here to begin your secure session.
                </p>
                <div className="flex items-center text-brand-green font-bold text-lg group-hover:translate-x-2 transition-transform">
                    Join Session <span className="ml-2">→</span>
                </div>
            </div>
        )}

        {/* Regular Tools (Hidden for strict Candidate Mode) */}
        {!isCandidateMode && (
            <>
                <div 
                onClick={() => onNavigate('interview-setup')}
                className="glass-panel group p-8 rounded-3xl border border-white/5 hover:border-brand-blue/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col bg-gradient-to-b from-white/5 to-transparent"
                >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6 text-brand-blue group-hover:scale-110 transition-transform duration-500 border border-brand-blue/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Interview Practice</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-grow">
                    Simulate realistic interviews with an AI recruiter. Get real-time feedback and detailed reports.
                </p>
                <div className="flex items-center text-brand-blue font-bold text-sm group-hover:translate-x-2 transition-transform">
                    Start Session <span className="ml-2">→</span>
                </div>
                </div>

                <div 
                onClick={() => onNavigate('cv-builder')}
                className="glass-panel group p-8 rounded-3xl border border-white/5 hover:border-brand-purple/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col bg-gradient-to-b from-white/5 to-transparent"
                >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center mb-6 text-brand-purple group-hover:scale-110 transition-transform duration-500 border border-brand-purple/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">AI CV Builder</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-grow">
                    Create a professional, ATS-friendly resume. Input your details and let our AI polish your bullet points.
                </p>
                <div className="flex items-center text-brand-purple font-bold text-sm group-hover:translate-x-2 transition-transform">
                    Build CV <span className="ml-2">→</span>
                </div>
                </div>

                <div 
                onClick={() => onNavigate('motivation-letter')}
                className="glass-panel group p-8 rounded-3xl border border-white/5 hover:border-brand-green/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col bg-gradient-to-b from-white/5 to-transparent"
                >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-6 text-brand-green group-hover:scale-110 transition-transform duration-500 border border-brand-green/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Cover Letter Gen</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-grow">
                    Generate persuasive cover letters tailored to specific job descriptions instantly.
                </p>
                <div className="flex items-center text-brand-green font-bold text-sm group-hover:translate-x-2 transition-transform">
                    Write Letter <span className="ml-2">→</span>
                </div>
                </div>

                <div 
                onClick={() => onNavigate('portfolio-builder')}
                className="glass-panel group p-8 rounded-3xl border border-white/5 hover:border-brand-yellow/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col bg-gradient-to-b from-white/5 to-transparent"
                >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-14 h-14 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mb-6 text-brand-yellow group-hover:scale-110 transition-transform duration-500 border border-brand-yellow/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Portfolio Builder</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-grow">
                    Create a stunning, single-page portfolio website. Showcase your projects and skills effortlessly.
                </p>
                <div className="flex items-center text-brand-yellow font-bold text-sm group-hover:translate-x-2 transition-transform">
                    Create Portfolio <span className="ml-2">→</span>
                </div>
                </div>
                <div 
                onClick={() => onNavigate('job-board')}
                className="glass-panel group p-8 rounded-3xl border border-white/5 hover:border-brand-blue/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col bg-gradient-to-b from-white/5 to-transparent"
                >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6 text-brand-blue group-hover:scale-110 transition-transform duration-500 border border-brand-blue/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Job Board</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-grow">
                    Browse active job openings from top platforms tailored to your career goals.
                </p>
                <div className="flex items-center text-brand-blue font-bold text-sm group-hover:translate-x-2 transition-transform">
                    Find Jobs <span className="ml-2">→</span>
                </div>
                </div>
            </>
        )}

        {isAdmin && (
            <div 
              onClick={() => onNavigate('admin-dashboard')}
              className="glass-panel group p-8 rounded-3xl border border-brand-red/30 hover:border-brand-red cursor-pointer transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col shadow-[0_0_30px_rgba(239,68,68,0.1)] hover:shadow-[0_0_50px_rgba(239,68,68,0.2)]"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-brand-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="w-14 h-14 bg-brand-red/10 rounded-2xl flex items-center justify-center mb-6 text-brand-red group-hover:scale-110 transition-transform duration-500 border border-brand-red/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
               </div>
               <h3 className="text-xl font-display font-bold text-white mb-2">Admin Dashboard</h3>
               <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-grow">
                 Access system statistics, manage users, and view platform activity.
               </p>
               <div className="flex items-center text-brand-red font-bold text-sm group-hover:translate-x-2 transition-transform">
                 Open Panel <span className="ml-2">→</span>
               </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
