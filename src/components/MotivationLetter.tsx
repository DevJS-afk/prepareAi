
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../services/firebaseClient';

interface MotivationLetterProps {
  onBack: () => void;
}

const MotivationLetter: React.FC<MotivationLetterProps> = ({ onBack }) => {
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [background, setBackground] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
        alert("API Key missing");
        return;
    }
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Write a compelling motivation letter (cover letter) for the following application:
        
        CANDIDATE DETAILS:
        Name: ${candidateName}
        Email: ${candidateEmail}
        
        TARGET ROLE:
        Job Title: ${jobTitle}
        Company: ${company}
        
        CANDIDATE BACKGROUND & KEY STRENGTHS:
        ${background}
        
        INSTRUCTIONS:
        - Tone: Professional, enthusiastic, and confident. 
        - Format: Standard business letter format. Include a header with the candidate's name and email, and the date.
        - Length: Keep it concise (under 300 words).
        - Structure: Introduction (hook), Body (skills/experience mapped to role), Conclusion (call to action).`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: prompt,
        });
        
        setGeneratedLetter(response.text || '');
    } catch (error) {
        const errStrConsole = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
        if (!(errStrConsole.includes("429") || errStrConsole.toLowerCase().includes("quota"))) {
            console.error(error);
        }
        const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
        if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
            alert("We have temporarily exceeded our AI service quota. Please try again later.");
        } else {
            alert("Failed to generate letter. Please try again.");
        }
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSave = async () => {
      if (!generatedLetter) return;
      if (!supabase) {
          alert("Database connection not available.");
          return;
      }
      
      setIsSaving(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
              alert("You must be logged in to save.");
              return;
          }

          const { error } = await supabase.from('motivation_letters').insert({
              user_id: user.id,
              title: `Cover Letter - ${company}`,
              job_title: jobTitle,
              company: company,
              content: generatedLetter
          });

          if (error) throw error;
          alert("Letter saved successfully to your profile!");
      } catch (err: any) {
          console.error("Error saving letter:", err);
          alert("Failed to save letter: " + err.message);
      } finally {
          setIsSaving(false);
      }
  };

  return (
     <div className="w-full glass-panel rounded-2xl p-6 md:p-10 animate-fade-in flex flex-col h-[85vh]">
         <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Motivation Letter AI</h2>
            </div>
             <div className="flex items-center gap-3">
                {generatedLetter && (
                    <>
                         <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-brand-green/20 border border-brand-green/50 rounded-lg font-bold text-brand-green text-sm hover:bg-brand-green/30 transition-colors"
                         >
                            {isSaving ? 'Saving...' : 'Save'}
                         </button>
                         <button className="px-4 py-2 bg-brand-green rounded-lg font-bold text-slate-900 dark:text-white text-sm hover:bg-green-600 transition-colors shadow-lg" onClick={() => navigator.clipboard.writeText(generatedLetter)}>
                            Copy Text
                         </button>
                    </>
                )}
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
             {/* Inputs */}
             <div className="md:w-1/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                 
                 <div className="space-y-3 p-4 bg-slate-200/30 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
                    <h3 className="text-sm font-bold text-gray-300 uppercase">Your Details</h3>
                    <div>
                        <input 
                            type="text" 
                            value={candidateName} 
                            onChange={(e) => setCandidateName(e.target.value)} 
                            className="w-full bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-green outline-none placeholder-slate-400 dark:placeholder-gray-500"
                            placeholder="Your Full Name"
                        />
                    </div>
                    <div>
                        <input 
                            type="text" 
                            value={candidateEmail} 
                            onChange={(e) => setCandidateEmail(e.target.value)} 
                            className="w-full bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-green outline-none placeholder-slate-400 dark:placeholder-gray-500"
                            placeholder="Your Email Address"
                        />
                    </div>
                 </div>

                 <div className="space-y-3 p-4 bg-slate-200/30 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
                     <h3 className="text-sm font-bold text-gray-300 uppercase">Target Role</h3>
                     <div>
                        <input 
                            type="text" 
                            value={jobTitle} 
                            onChange={(e) => setJobTitle(e.target.value)} 
                            className="w-full bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-green outline-none placeholder-slate-400 dark:placeholder-gray-500"
                            placeholder="Job Title (e.g. UX Designer)"
                        />
                    </div>
                     <div>
                        <input 
                            type="text" 
                            value={company} 
                            onChange={(e) => setCompany(e.target.value)} 
                            className="w-full bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-green outline-none placeholder-slate-400 dark:placeholder-gray-500"
                            placeholder="Company Name"
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-semibold text-slate-600 dark:text-gray-400 mb-2">Why you? (Keywords/Background)</label>
                    <textarea 
                        value={background} 
                        onChange={(e) => setBackground(e.target.value)} 
                        className="w-full min-h-[150px] bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-green outline-none resize-none"
                        placeholder="E.g. 5 years experience, passion for clean design, managed team of 3, won innovation award..."
                    />
                </div>
                
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !jobTitle || !company}
                    className="w-full py-4 bg-gradient-to-r from-brand-green to-green-700 rounded-xl font-bold text-slate-900 dark:text-white shadow-lg hover:shadow-brand-green/30 transition-all disabled:opacity-50 mt-2 shrink-0"
                >
                    {isGenerating ? 'Writing...' : 'Draft Letter'}
                </button>
             </div>

             {/* Output */}
             <div className="md:w-2/3 bg-white text-gray-800 rounded-xl p-8 overflow-y-auto shadow-inner relative">
                 {generatedLetter ? (
                     <textarea 
                        className="w-full h-full bg-transparent border-none outline-none resize-none font-serif text-lg leading-relaxed"
                        value={generatedLetter}
                        onChange={(e) => setGeneratedLetter(e.target.value)}
                     />
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 dark:text-gray-400 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p>Generated letter will appear here.</p>
                    </div>
                 )}
             </div>
        </div>
     </div>
  );
};

export default MotivationLetter;
