import { toast } from 'sonner';

import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { domains, DomainKey, LevelKey, InterviewConfig, personas, PersonaKey } from '../types';

interface InterviewSetupProps {
  onStart: (config: InterviewConfig, practiceMode: boolean) => void;
  onBack: () => void;
}

const GENERIC_LEVEL_INSTRUCTIONS: Record<LevelKey, string> = {
  'junior': 'You are an interviewer for a Junior level position. Your goal is to assess fundamental knowledge and potential. Ask foundational questions and focus on core concepts. Start by introducing yourself and asking the first question.',
  'mid-level': 'You are an interviewer for a Mid-Level position. Focus on practical application, problem-solving, and past experience. Ask about how they handle specific scenarios and their workflow. Start by introducing yourself and asking the first question.',
  'senior': 'You are an interviewer for a Senior level position. Focus on strategy, leadership, complex problem-solving, and architectural decisions. Expect high-level thinking and deep expertise. Start by introducing yourself and asking the first question.'
};

const domainIcons: Record<DomainKey, React.ReactNode> = {
  'software-engineering': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  'product-management': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  'ux-design': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  'data-science': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  'project-management': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  'marketing': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  'human-resources': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  'business-analyst': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'sales-representative': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  'customer-success': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'finance': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'operations': (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart, onBack }) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainKey | 'custom' | ''>('');
  const [customDomainName, setCustomDomainName] = useState('');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LevelKey | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaKey>('friendly');
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  
  // Resume Personalization State
  const [resumeContext, setResumeContext] = useState<string>('');
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  const selectedConfig = useMemo(() => {
    if (selectedDomain === 'custom') {
        if (customDomainName && customRoleTitle && selectedLevel) {
             const baseInstruction = GENERIC_LEVEL_INSTRUCTIONS[selectedLevel];
             return {
                 name: customRoleTitle,
                 description: `Custom interview for ${customRoleTitle} in ${customDomainName}`,
                 systemInstruction: `You are an expert interviewer for a ${selectedLevel} ${customRoleTitle} role in the field of ${customDomainName}. ${baseInstruction}`
             };
        }
        return null;
    }
    if (selectedDomain && selectedLevel) {
      return domains[selectedDomain].levels[selectedLevel];
    }
    return null;
  }, [selectedDomain, selectedLevel, customDomainName, customRoleTitle]);
  
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>, isAutofill: boolean = false) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!process.env.API_KEY) {
          toast.error("API Key missing");
          return;
      }

      setIsAnalyzingResume(true);
      setResumeFileName(file.name);

      try {
          const reader = new FileReader();
          reader.onload = async (event) => {
              const base64String = event.target?.result as string;
              // Support PDF (raw base64) or Text
              let contentPart: any;
              
              if (file.type === "application/pdf") {
                  const rawBase64 = base64String.split(',')[1];
                  contentPart = { inlineData: { mimeType: 'application/pdf', data: rawBase64 } };
              } else {
                  // For text files, just use text
                  contentPart = { text: base64String }; 
              }

              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              
              const prompt = `Analyze this resume. Return a JSON object with the following structure:
              {
                "summary": "Concise summary of the candidate's background, key roles, and major achievements (max 3 sentences).",
                "skills": ["Skill 1", "Skill 2", ...],
                "suggestedRole": "The most fitting Job Title for this candidate (e.g. Senior Product Manager)",
                "suggestedIndustry": "The primary industry (e.g. FinTech, Healthcare, E-commerce)"
              }
              Do not use markdown formatting for the JSON.`;
              
              const response = await ai.models.generateContent({
                  model: 'gemini-3.1-pro-preview',
                  contents: [contentPart, { text: prompt }],
                  config: { responseMimeType: 'application/json' }
              });

              const data = JSON.parse(response.text || '{}');
              setResumeContext(data.summary || '');
              setExtractedSkills(data.skills || []);
              
              if (isAutofill && selectedDomain === 'custom') {
                  if (data.suggestedRole) setCustomRoleTitle(data.suggestedRole);
                  if (data.suggestedIndustry) setCustomDomainName(data.suggestedIndustry);
              }

              setIsAnalyzingResume(false);
          };

          if (file.type === "application/pdf") {
              reader.readAsDataURL(file);
          } else {
              reader.readAsText(file);
          }

      } catch (err) {
          const errStrConsoleSetup = String(err) + " " + JSON.stringify(err, Object.getOwnPropertyNames(err || {}));
          if (!(errStrConsoleSetup.includes("429") || errStrConsoleSetup.toLowerCase().includes("quota"))) {
              console.error(err);
          }
          const errStr = String(err) + " " + JSON.stringify(err, Object.getOwnPropertyNames(err || {}));
          if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
              toast.error("We have temporarily exceeded our AI service quota. Please try again later.");
          } else {
              toast.error("Failed to analyze resume.");
          }
          setIsAnalyzingResume(false);
          setResumeFileName(null);
          setExtractedSkills([]);
      }
  };

  const handleStartClick = () => {
    if (!selectedConfig) return;

    let finalSystemInstruction = selectedConfig.systemInstruction;
    if (selectedDomain === 'software-engineering' && selectedTechnology && domains['software-engineering'].technologies) {
      const technologyName = domains['software-engineering'].technologies[selectedTechnology];
      finalSystemInstruction = finalSystemInstruction.replace(/{technology}/g, technologyName);
    }

    const personaModifier = personas[selectedPersona].modifier;
    
    let systemInstruction = `${finalSystemInstruction} In terms of your personality as an interviewer, please adhere to the following: ${personaModifier}`;
    
    // Add User Resume Context
    if (resumeContext) {
        systemInstruction += `\n\nCONTEXT FROM CANDIDATE RESUME:\nSUMMARY: ${resumeContext}\nSKILLS: ${extractedSkills.join(', ')}\nUse this context to tailor your questions and verify their skills.`;
    }

    if (customInstructions.trim()) {
      systemInstruction += ` Additionally, please follow these user-provided custom instructions: ${customInstructions.trim()}`;
    }

    // Optimization and Diversity instructions
    systemInstruction += `\n\n[CRITICAL INSTRUCTIONS]: Keep all questions and responses extremely concise to optimize token usage. Do NOT give long preambles. Additionally, to ensure diversity across interviews, do NOT use standard, textbook questions. Start with a uniquely generated, non-obvious question based on the candidate's skills or a hypothetical scenario. (Random Seed for variation: ${Math.random()}).`;

    const finalConfig: InterviewConfig = {
      ...selectedConfig,
      systemInstruction,
      persona: selectedPersona,
    };
    onStart(finalConfig, isPracticeMode);
  };

  const isSoftwareEngineering = selectedDomain === 'software-engineering';
  const isStartDisabled = !selectedConfig || (isSoftwareEngineering && !selectedTechnology) || isAnalyzingResume;

  // Helper to get step number logic
  const steps = [
      { id: 1, title: 'Domain', active: true, completed: !!selectedDomain },
      { id: 2, title: 'Details', active: !!selectedDomain, completed: (isSoftwareEngineering ? !!selectedTechnology : true) && !!selectedLevel && (selectedDomain === 'custom' ? !!(customDomainName && customRoleTitle) : true) },
      { id: 3, title: 'Persona', active: !!selectedDomain && !!selectedLevel, completed: !!selectedPersona },
  ];

  return (
    <div className="w-full glass-panel rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
      {/* Header / Progress */}
      <div className="bg-slate-200/30 dark:bg-black/20 p-6 border-b border-slate-200 dark:border-white/5 relative">
         <button onClick={onBack} className="absolute top-6 left-6 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
         </button>
         <div className="flex justify-between items-center mb-6 pl-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Configure Your Interview</h2>
            <div className="flex items-center gap-2">
                 <span className="text-sm font-medium text-slate-600 dark:text-gray-400">Step {steps.findIndex(s => !s.completed) === -1 ? 3 : steps.findIndex(s => !s.completed) + 1} of 3</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
             {steps.map((step) => (
                 <div key={step.id} className="flex-1 flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${step.active ? (step.completed ? 'bg-brand-green border-brand-green text-white' : 'bg-brand-blue border-brand-blue text-white') : 'bg-transparent border-gray-600 text-slate-500 dark:text-gray-500'}`}>
                         {step.completed ? '✓' : step.id}
                     </div>
                     <div className="h-1 flex-1 bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-500 ${step.completed ? 'bg-brand-green' : (step.active ? 'bg-brand-blue' : 'bg-transparent')}`} style={{ width: step.completed ? '100%' : (step.active ? '50%' : '0%') }}></div>
                     </div>
                 </div>
             ))}
         </div>
      </div>

      <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
        {/* Step 1: Domain Selection */}
        <section className="mb-12">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-gray-100">
                <span className="w-1.5 h-6 bg-brand-blue rounded-full"></span>
                Select Your Field
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(Object.keys(domains) as DomainKey[]).map((key) => (
                <button
                    key={key}
                    onClick={() => {
                        setSelectedDomain(key);
                        setSelectedLevel(null);
                        setSelectedTechnology(null);
                    }}
                    className={`group relative p-4 rounded-xl text-left border transition-all duration-300 ${
                        selectedDomain === key 
                        ? 'bg-brand-blue/20 border-brand-blue shadow-[0_0_20px_rgba(66,133,244,0.3)]' 
                        : 'bg-white/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10 hover:shadow-sm hover:border-slate-200 dark:hover:border-white/10 shadow-sm'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedDomain === key ? 'bg-brand-blue text-white' : 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400'}`}>
                            {domainIcons[key]}
                        </div>
                        {selectedDomain === key && <div className="w-2 h-2 rounded-full bg-brand-blue shadow-[0_0_10px_#4285F4]"></div>}
                    </div>
                    <p className={`font-semibold text-sm ${selectedDomain === key ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                        {domains[key].name}
                    </p>
                </button>
                ))}
                
                {/* Custom Option */}
                <button
                    onClick={() => {
                        setSelectedDomain('custom');
                        setSelectedLevel(null);
                        setSelectedTechnology(null);
                        setCustomDomainName('');
                        setCustomRoleTitle('');
                        setExtractedSkills([]);
                        setResumeFileName(null);
                    }}
                    className={`group relative p-4 rounded-xl text-left border transition-all duration-300 ${
                        selectedDomain === 'custom'
                        ? 'bg-brand-blue/20 border-brand-blue shadow-[0_0_20px_rgba(66,133,244,0.3)]' 
                        : 'bg-white/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10 hover:shadow-sm hover:border-slate-200 dark:hover:border-white/10 shadow-sm'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedDomain === 'custom' ? 'bg-brand-blue text-white' : 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        {selectedDomain === 'custom' && <div className="w-2 h-2 rounded-full bg-brand-blue shadow-[0_0_10px_#4285F4]"></div>}
                    </div>
                    <p className={`font-semibold text-sm ${selectedDomain === 'custom' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                        Other / Custom
                    </p>
                </button>
            </div>
        </section>

        {/* Step 2: Tech & Level */}
        {selectedDomain && (
            <div className="animate-fade-in space-y-12">
                
                {/* Tech Stack (Only for SWE) */}
                {isSoftwareEngineering && (
                    <section>
                         <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-gray-100">
                            <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
                            Choose Technology Stack
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries((domains[selectedDomain].technologies || {})).map(([key, name]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTechnology(key)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                                        selectedTechnology === key 
                                        ? 'bg-brand-purple text-white border-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                                        : 'bg-slate-200/30 dark:bg-black/20 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:bg-white/10 hover:border-white/30'
                                    }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Custom Inputs (Only for Custom) */}
                {selectedDomain === 'custom' && (
                    <section>
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-gray-100">
                            <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
                            Custom Role Details
                        </h3>
                        
                        {/* Autofill from CV CTA */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 border border-brand-purple/20 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-purple" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    Autofill from Resume
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">Upload your CV (PDF) and we'll automatically extract your target Role, Industry, and Skills.</p>
                            </div>
                            <label className={`cursor-pointer bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 border border-slate-200 dark:border-white/10 ${isAnalyzingResume ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isAnalyzingResume ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    'Select PDF File'
                                )}
                                <input type="file" accept=".pdf,.txt,.md" className="hidden" onChange={(e) => handleResumeUpload(e, true)} disabled={isAnalyzingResume} />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-gray-400 mb-2">Industry / Field</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Architecture, Marine Biology"
                                    value={customDomainName}
                                    onChange={(e) => setCustomDomainName(e.target.value)}
                                    className="w-full bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none placeholder-slate-400 dark:placeholder-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-gray-400 mb-2">Job Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Senior Architect"
                                    value={customRoleTitle}
                                    onChange={(e) => setCustomRoleTitle(e.target.value)}
                                    className="w-full bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none placeholder-slate-400 dark:placeholder-gray-600"
                                />
                            </div>
                        </div>

                        {/* Extracted Skills Selection */}
                        {extractedSkills.length > 0 && (
                            <div className="mt-6 animate-fade-in">
                                <label className="block text-sm font-semibold text-slate-600 dark:text-gray-400 mb-2">Select a Skill to Focus On (Optional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {extractedSkills.map((skill, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (customRoleTitle.includes(skill)) return;
                                                setCustomRoleTitle(`${customRoleTitle ? customRoleTitle + ' - ' : ''}${skill}`);
                                            }}
                                            className="px-3 py-1.5 bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-full text-xs text-slate-600 dark:text-gray-300 hover:bg-brand-blue/20 hover:text-brand-blue hover:border-brand-blue/30 transition-all"
                                        >
                                            + {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                <section>
                     <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-gray-100">
                        <span className="w-1.5 h-6 bg-brand-green rounded-full"></span>
                        Experience Level
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(['junior', 'mid-level', 'senior'] as LevelKey[]).map((key) => {
                            let name = key.charAt(0).toUpperCase() + key.slice(1);
                            let desc = GENERIC_LEVEL_INSTRUCTIONS[key];
                            
                            if (selectedDomain !== 'custom') {
                                 const level = domains[selectedDomain].levels[key];
                                 name = level.name;
                                 desc = level.description;
                            } else {
                                if (key === 'junior') { name = 'Junior / Entry'; desc = 'Focuses on fundamentals and core concepts.'; }
                                if (key === 'mid-level') { name = 'Mid-Level'; desc = 'Covers practical application and problem solving.'; }
                                if (key === 'senior') { name = 'Senior / Lead'; desc = 'Deep dive into strategy, complexity, and leadership.'; }
                            }

                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedLevel(key)}
                                    className={`p-6 rounded-xl text-left border transition-all duration-300 h-full flex flex-col ${
                                        selectedLevel === key 
                                        ? 'bg-brand-green/10 border-brand-green/30 shadow-[0_0_15px_rgba(52,168,83,0.1)] ring-1 ring-brand-green/50' 
                                        : 'bg-white/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10 hover:shadow-sm hover:border-slate-200 dark:hover:border-white/10 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                         <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${selectedLevel === key ? 'bg-brand-green text-white' : 'bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300'}`}>
                                            {key}
                                         </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{name}</h4>
                                    <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed flex-grow">{desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>
        )}
        
        {/* Step 3: Persona & Context */}
        {selectedDomain && selectedLevel && (!isSoftwareEngineering || selectedTechnology) && (
            <section className="mt-12 animate-fade-in">
                 <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900 dark:text-gray-100">
                    <span className="w-1.5 h-6 bg-brand-yellow rounded-full"></span>
                    Interviewer Persona
                </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {(Object.keys(personas) as PersonaKey[]).map((key) => {
                    const persona = personas[key];
                    return (
                        <button
                        key={key}
                        onClick={() => setSelectedPersona(key)}
                        className={`p-6 rounded-xl text-left border transition-all duration-300 ${
                            selectedPersona === key 
                            ? 'bg-brand-yellow/10 border-brand-yellow/30 shadow-[0_0_15px_rgba(251,188,5,0.1)] ring-1 ring-brand-yellow/50' 
                            : 'bg-white/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10 hover:shadow-sm hover:border-slate-200 dark:hover:border-white/10 shadow-sm'
                        }`}
                        >
                            <h4 className={`text-lg font-bold mb-2 ${selectedPersona === key ? 'text-brand-yellow' : 'text-slate-900 dark:text-gray-200'}`}>{persona.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{persona.description}</p>
                        </button>
                    );
                    })}
                </div>

                {/* Personalize Section */}
                <div className="bg-slate-200/30 dark:bg-black/20 rounded-xl p-6 border border-slate-200 dark:border-white/5">
                     <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Personalize Context</h4>
                     
                     {/* Resume Upload */}
                     <div className="mb-6">
                         <label className="block text-sm font-semibold text-slate-600 dark:text-gray-300 mb-2">
                             {resumeFileName ? 'Resume Uploaded' : 'Upload Resume (PDF/Text)'}
                         </label>
                         <p className="text-xs text-slate-500 dark:text-gray-500 mb-3">We will extract your skills and experience to tailor the interview.</p>
                         
                         {resumeFileName ? (
                             <div className="flex flex-col gap-3">
                                 <div className="flex items-center gap-3 bg-brand-blue/10 border border-brand-blue/30 rounded-lg p-3">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                     <span className="text-sm text-slate-900 dark:text-white font-medium flex-1 truncate">{resumeFileName}</span>
                                     <button onClick={() => { setResumeContext(''); setExtractedSkills([]); setResumeFileName(null); }} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                     </button>
                                 </div>
                                 {extractedSkills.length > 0 && (
                                     <div className="flex flex-wrap gap-2">
                                         {extractedSkills.map((skill, i) => (
                                             <span key={i} className="px-2 py-1 bg-white/5 border border-slate-200 dark:border-white/10 rounded text-xs text-slate-600 dark:text-gray-300">
                                                 {skill}
                                             </span>
                                         ))}
                                     </div>
                                 )}
                             </div>
                         ) : (
                             <label className={`flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all ${isAnalyzingResume ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                 <input type="file" accept=".pdf,.txt,.md" className="hidden" onChange={(e) => handleResumeUpload(e, false)} disabled={isAnalyzingResume} />
                                 {isAnalyzingResume ? (
                                     <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span className="text-sm text-slate-600 dark:text-gray-300">Extracting Skills...</span>
                                     </>
                                 ) : (
                                     <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        <span className="text-sm text-slate-600 dark:text-gray-300">Click to Upload Resume (PDF)</span>
                                     </>
                                 )}
                             </label>
                         )}
                     </div>

                     <label className="block text-sm font-semibold text-slate-600 dark:text-gray-300 mb-2">Custom Instructions (Optional)</label>
                     <textarea
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        className="w-full bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-gray-600"
                        rows={2}
                        placeholder="E.g., 'Ask specific questions about system design scalability' or 'Be very critical about edge cases'."
                    />
                </div>
            </section>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-6 bg-slate-200/30 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <label className="flex items-center cursor-pointer group">
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={isPracticeMode} onChange={() => setIsPracticeMode(!isPracticeMode)} />
                <div className={`w-12 h-7 rounded-full transition-colors duration-300 ${isPracticeMode ? 'bg-brand-green' : 'bg-slate-300 dark:bg-gray-700'}`}></div>
                <div className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${isPracticeMode ? 'translate-x-5' : ''}`}></div>
            </div>
            <div className="ml-3">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-green transition-colors">Practice Mode</span>
                <span className="block text-xs text-slate-500 dark:text-gray-500">No scoring, just chat.</span>
            </div>
        </label>

        <button
            onClick={handleStartClick}
            disabled={isStartDisabled}
            className="w-full md:w-auto bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg hover:shadow-brand-blue/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5"
        >
            Start Interview
        </button>
      </div>
    </div>
  );
};

export default InterviewSetup;
