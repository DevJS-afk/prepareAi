
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../services/supabaseClient';
import type { SubscriptionTier } from '../types';

interface CVBuilderProps {
  onBack: () => void;
  initialData?: any;
  cvId?: string;
  subscriptionTier?: SubscriptionTier;
  isAdmin?: boolean;
}

interface CustomSection {
    id: string;
    title: string;
    content: string;
}

interface AtsResult {
    score: number;
    missingKeywords: string[];
    suggestions: string[];
    summary: string;
}

type TemplateType = 'modern' | 'classic' | 'creative' | 'minimalist';

const TEMPLATES: Record<TemplateType, { name: string; desc: string }> = {
    modern: {
        name: "Modern Tech",
        desc: "Clean, sans-serif, optimized for readability."
    },
    classic: {
        name: "Classic Professional",
        desc: "Traditional serif, perfect for Finance/Law."
    },
    creative: {
        name: "Creative Studio",
        desc: "Bold layout with sidebar, good for Design/Marketing."
    },
    minimalist: {
        name: "Minimalist",
        desc: "High whitespace, simple, sophisticated."
    }
};

const CVBuilder: React.FC<CVBuilderProps> = ({ onBack, initialData, cvId, subscriptionTier = 'free', isAdmin = false }) => {
  // --- Core Data State ---
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    photo: null as string | null
  });
  const [targetRole, setTargetRole] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  
  // --- UI/Generation State ---
  const [generatedCV, setGeneratedCV] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(0.65); 
  const previewRef = useRef<HTMLDivElement>(null);
  const [currentCvId, setCurrentCvId] = useState<string | undefined>(cvId);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');

  // --- Import State ---
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFileBase64, setImportFileBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- ATS Analyzer State ---
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [isScanningAts, setIsScanningAts] = useState(false);

  useEffect(() => {
    if (initialData) {
        setPersonalInfo(initialData.personalInfo || {
            fullName: '', email: '', phone: '', linkedin: '', location: '', photo: null
        });
        setTargetRole(initialData.targetRole || '');
        setExperience(initialData.experience || '');
        setEducation(initialData.education || '');
        setSkills(initialData.skills || '');
        setCustomSections(initialData.customSections || []);
    }
  }, [initialData]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalInfo(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSection = () => {
      const newSection: CustomSection = {
          id: Date.now().toString(),
          title: '',
          content: ''
      };
      setCustomSections([...customSections, newSection]);
  };

  const handleRemoveSection = (id: string) => {
      setCustomSections(customSections.filter(s => s.id !== id));
  };

  const handleUpdateSection = (id: string, field: 'title' | 'content', value: string) => {
      setCustomSections(customSections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        if (file.type === "application/pdf") {
            reader.onload = (event) => {
                const base64String = event.target?.result as string;
                // Strip the Data URL prefix to get raw base64
                const rawBase64 = base64String.split(',')[1];
                setImportFileBase64(rawBase64);
                setImportText(''); // Clear text if PDF is loaded
            };
            reader.readAsDataURL(file);
        } else {
            // Assume text/markdown/json
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setImportText(text);
                setImportFileBase64(null); // Clear PDF if text is loaded
            };
            reader.readAsText(file);
        }
  };

  const handleAnalyzeResume = async () => {
      if (!importText.trim() && !importFileBase64) return;
      if (!process.env.API_KEY) {
          alert("API Key missing");
          return;
      }
      setIsAnalyzing(true);

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          let contentPart: any;
          if (importFileBase64) {
              contentPart = { inlineData: { mimeType: 'application/pdf', data: importFileBase64 } };
          } else {
              contentPart = { text: importText };
          }

          const prompt = `
            Act as an expert Resume Writer and Parser. 
            Analyze the resume provided. Your task is to:
            1. Parse the information into structured fields.
            2. IMPROVE the content: Use stronger action verbs, clarify achievements, and fix grammar (e.g. change "Worked on API" to "Designed and implemented scalable RESTful APIs").
            3. Return a JSON object matching the exact structure below.

            REQUIRED JSON STRUCTURE:
            {
              "personalInfo": {
                "fullName": "string",
                "email": "string",
                "phone": "string",
                "linkedin": "string",
                "location": "string"
              },
              "targetRole": "string (infer from content if not explicit)",
              "experience": "string (formatted as bullet points)",
              "education": "string (formatted as text/bullets)",
              "skills": "string (comma separated list, extract all relevant skills)",
              "customSections": [
                { "title": "string", "content": "string" }
              ]
            }
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [contentPart, { text: prompt }],
              config: { responseMimeType: 'application/json' }
          });

          const data = JSON.parse(response.text || '{}');
          
          if (data.personalInfo) setPersonalInfo(prev => ({ ...prev, ...data.personalInfo }));
          if (data.targetRole) setTargetRole(data.targetRole);
          if (data.experience) setExperience(data.experience);
          if (data.education) setEducation(data.education);
          if (data.skills) setSkills(data.skills);
          if (data.customSections && Array.isArray(data.customSections)) {
              const mappedSections = data.customSections.map((s: any) => ({
                  id: Date.now().toString() + Math.random(),
                  title: s.title,
                  content: s.content
              }));
              setCustomSections(mappedSections);
          }

          setIsImporting(false);
          setImportText('');
          setImportFileBase64(null);

      } catch (error) {
          console.error("Parsing failed", error);
          alert("Failed to analyze resume. Please ensure the file is readable.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate generation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        const formatContent = (text: any) => {
            if (!text) return '';
            const content = String(text);
            return content.split('\n').map(line => {
                const trimmed = line.trim();
                if (!trimmed) return '';
                if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
                    return `<li>${trimmed.substring(1).trim()}</li>`;
                }
                return `<p>${line}</p>`;
            }).join('');
        };

        // Basic CSS Reset & Common Styles
        const commonStyles = `
            * { box-sizing: border-box; }
            body { margin: 0; padding: 40px; font-size: 11pt; line-height: 1.5; color: #333; background: white; font-family: sans-serif; }
            ul { margin: 0 0 10px 0; padding-left: 20px; }
            li { margin-bottom: 4px; }
            p { margin: 0 0 8px 0; }
            .section { margin-bottom: 25px; }
            .profile-photo { width: 100px; height: 100px; object-fit: cover; border-radius: 50%; position: absolute; top: 40px; right: 40px; }
        `;

        let themeStyles = '';
        switch (selectedTemplate) {
            case 'modern':
                themeStyles = `
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
                    h1 { font-size: 24pt; font-weight: 700; color: #2563eb; margin-bottom: 5px; }
                    .contact-info { font-size: 10pt; color: #666; margin-bottom: 20px; }
                    .section-title { font-size: 12pt; font-weight: 700; color: #1f2937; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 10px; }
                `;
                break;
            case 'classic':
                themeStyles = `
                    body { font-family: 'Georgia', serif; }
                    h1 { font-size: 22pt; text-align: center; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; color: #000; }
                    .contact-info { text-align: center; font-style: italic; margin-bottom: 30px; border-bottom: 1px solid #000; padding-bottom: 20px; }
                    .section-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 10px; color: #000; }
                    .profile-photo { display: none; }
                `;
                break;
            case 'creative':
                themeStyles = `
                    body { font-family: 'Poppins', sans-serif; display: grid; grid-template-columns: 1fr 2fr; gap: 30px; padding: 0; min-height: 100vh; }
                    .sidebar { background: #f3f4f6; padding: 40px 20px; }
                    .main { padding: 40px 30px; }
                    h1 { font-size: 28pt; line-height: 1; margin-bottom: 10px; color: #7c3aed; }
                    .section-title { font-size: 14pt; font-weight: 900; color: #4b5563; margin-bottom: 15px; }
                    .profile-photo { position: static; margin-bottom: 20px; width: 120px; height: 120px; border: 4px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                    .contact-item { margin-bottom: 8px; font-size: 0.9em; word-break: break-word; }
                `;
                break;
            case 'minimalist':
                themeStyles = `
                    body { font-family: 'Courier New', monospace; }
                    h1 { font-size: 20pt; font-weight: normal; margin-bottom: 20px; }
                    .section-title { font-size: 11pt; font-weight: bold; text-decoration: underline; margin-bottom: 15px; }
                    .profile-photo { border-radius: 0; filter: grayscale(100%); }
                `;
                break;
        }

        let contentHtml = '';
        
        if (selectedTemplate === 'creative') {
             contentHtml = `
                <div class="sidebar">
                    ${personalInfo.photo ? `<img src="${personalInfo.photo}" class="profile-photo" />` : ''}
                    <div class="section">
                        <div class="section-title">Contact</div>
                        <div class="contact-item">${personalInfo.email}</div>
                        <div class="contact-item">${personalInfo.phone}</div>
                        <div class="contact-item">${personalInfo.location}</div>
                        ${personalInfo.linkedin ? `<div class="contact-item">${personalInfo.linkedin}</div>` : ''}
                    </div>
                    ${skills ? `
                    <div class="section">
                        <div class="section-title">Skills</div>
                        ${formatContent(skills)}
                    </div>` : ''}
                </div>
                <div class="main">
                    <h1>${personalInfo.fullName}</h1>
                    <h2 style="font-size: 14pt; color: #6b7280; margin-bottom: 30px; font-weight: 500;">${targetRole}</h2>
                    
                    ${experience ? `
                    <div class="section">
                        <div class="section-title">Experience</div>
                        ${formatContent(experience)}
                    </div>` : ''}
                    
                    ${education ? `
                    <div class="section">
                        <div class="section-title">Education</div>
                        ${formatContent(education)}
                    </div>` : ''}

                    ${customSections.map(s => `
                    <div class="section">
                        <div class="section-title">${s.title}</div>
                        ${formatContent(s.content)}
                    </div>`).join('')}
                </div>
             `;
        } else {
            contentHtml = `
                ${personalInfo.photo ? `<img src="${personalInfo.photo}" class="profile-photo" />` : ''}
                <h1>${personalInfo.fullName}</h1>
                <div class="contact-info">
                    ${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}
                    ${personalInfo.linkedin ? ` | ${personalInfo.linkedin}` : ''}
                </div>
                
                ${targetRole ? `<div style="text-align: center; font-size: 14pt; margin-bottom: 30px; font-weight: bold; color: #4b5563;">${targetRole}</div>` : ''}

                ${experience ? `
                <div class="section">
                    <div class="section-title">Experience</div>
                    ${formatContent(experience)}
                </div>` : ''}

                ${education ? `
                <div class="section">
                    <div class="section-title">Education</div>
                    ${formatContent(education)}
                </div>` : ''}

                ${skills ? `
                <div class="section">
                    <div class="section-title">Skills</div>
                    ${formatContent(skills)}
                </div>` : ''}

                ${customSections.map(s => `
                <div class="section">
                    <div class="section-title">${s.title}</div>
                    ${formatContent(s.content)}
                </div>`).join('')}
            `;
        }

        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                  ${commonStyles}
                  ${themeStyles}
              </style>
            </head>
            <body>
              ${contentHtml}
            </body>
          </html>
        `;
        
        setGeneratedCV(fullHtml);
    } catch (error) {
        console.error(error);
        alert("Failed to generate CV. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleScanAts = async () => {
      if (!jobDescription.trim()) return;
      if (!process.env.API_KEY) return;
      
      setIsScanningAts(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          // Construct Resume Context
          const resumeContext = `
            Name: ${personalInfo.fullName}
            Role: ${targetRole}
            Experience: ${experience}
            Education: ${education}
            Skills: ${skills}
            Custom Sections: ${JSON.stringify(customSections)}
          `;

          const prompt = `
            You are an expert Applicant Tracking System (ATS) simulator and Recruiter.
            Compare the following Resume Content against the Job Description.

            RESUME CONTENT:
            ${resumeContext}

            JOB DESCRIPTION:
            ${jobDescription}

            Analyze the match. Return a JSON object with:
            {
                "score": integer (0-100),
                "summary": "1 sentence overview of the match quality.",
                "missingKeywords": ["keyword1", "keyword2"],
                "suggestions": ["specific advice to improve match", "rewrite this bullet point...", "add this skill..."]
            }
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
          });

          setAtsResult(JSON.parse(response.text || '{}'));

      } catch (e: any) {
          console.error("ATS Scan failed", e);
          alert("Scan failed: " + e.message);
      } finally {
          setIsScanningAts(false);
      }
  };

  const handleSave = async () => {
      if (!generatedCV) return;
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

          // Check Limits for Free Tier (Only 1 Resume Allowed) - Admins bypass
          if (!currentCvId && subscriptionTier === 'free' && !isAdmin) {
              const { count } = await supabase.from('cvs').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
              if (count && count >= 1) {
                  alert("Free Plan Limit: You can only save 1 Resume. Please upgrade to Pro for unlimited saves.");
                  setIsSaving(false);
                  return;
              }
          }

          const payload = {
              title: `${targetRole || 'Resume'} - ${new Date().toLocaleDateString()}`,
              content: generatedCV,
              data: { personalInfo, targetRole, experience, education, skills, customSections }
          };

          if (currentCvId) {
              const { error } = await supabase.from('cvs').update(payload).eq('id', currentCvId);
              if (error) throw error;
              alert("Resume updated successfully!");
          } else {
              const { data, error } = await supabase.from('cvs').insert({ ...payload, user_id: user.id }).select();
              if (error) throw error;
              if (data && data[0]) {
                  setCurrentCvId(data[0].id);
              }
              alert("Resume saved successfully to your profile!");
          }

      } catch (err: any) {
          console.error("Error saving CV:", err);
          if (err.code === 'PGRST205' || err.message?.includes('does not exist') || err.code === '42P01') {
              alert("Configuration Error: The 'cvs' table does not exist in your database.\n\nPlease go to the README.md file, copy the SQL script under 'Database Setup', and run it in your Supabase SQL Editor.");
          } else {
              alert("Failed to save resume: " + err.message);
          }
      } finally {
          setIsSaving(false);
      }
  };

  const handlePrint = () => {
    if (!previewRef.current) return;
    const printWindow = window.open('', '', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Resume - ${personalInfo.fullName || 'Candidate'}</title>
            <style>
              body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; font-family: sans-serif; }
              @page { size: A4; margin: 0; }
              @media print {
                body { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            ${generatedCV}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="w-[90vw] h-[90vh] flex flex-col glass-panel rounded-2xl overflow-hidden animate-fade-in shadow-2xl relative">
        
        {/* ATS Modal */}
        {showAtsModal && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-[#1a1a1a] w-full max-w-4xl rounded-2xl border border-white/10 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">ATS Compatibility Checker</h3>
                        </div>
                        <button onClick={() => { setShowAtsModal(false); setAtsResult(null); }} className="text-gray-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {/* Input Side */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col border-r border-white/10">
                            <p className="text-gray-400 text-sm mb-4">Paste the job description below. We'll check your current resume data for keywords and relevance.</p>
                            <textarea 
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="flex-1 bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-brand-blue outline-none resize-none custom-scrollbar mb-4 text-sm"
                                placeholder="Paste Job Description here..."
                            />
                            <button 
                                onClick={handleScanAts}
                                disabled={isScanningAts || !jobDescription}
                                className="w-full py-3 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isScanningAts ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Scanning...</>
                                ) : (
                                    <>Scan & Analyze</>
                                )}
                            </button>
                        </div>

                        {/* Result Side */}
                        <div className="w-full md:w-1/2 p-6 bg-black/20 overflow-y-auto custom-scrollbar">
                            {atsResult ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                                    className={atsResult.score > 75 ? 'text-brand-green' : atsResult.score > 50 ? 'text-brand-yellow' : 'text-brand-red'}
                                                    strokeDasharray={2 * Math.PI * 40}
                                                    strokeDashoffset={2 * Math.PI * 40 * (1 - atsResult.score / 100)}
                                                />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className="text-2xl font-bold text-white">{atsResult.score}%</span>
                                                <span className="text-[10px] uppercase text-gray-500 font-bold">Match</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-white font-bold mb-1">Analysis Summary</h4>
                                            <p className="text-sm text-gray-400 leading-relaxed">{atsResult.summary}</p>
                                        </div>
                                    </div>

                                    {atsResult.missingKeywords.length > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                            <h5 className="text-red-400 font-bold text-xs uppercase tracking-wider mb-3">Missing Keywords</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {atsResult.missingKeywords.map((kw, i) => (
                                                    <span key={i} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs border border-red-500/20">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h5 className="text-brand-blue font-bold text-xs uppercase tracking-wider mb-3">Improvement Plan</h5>
                                        <ul className="space-y-3">
                                            {atsResult.suggestions.map((sugg, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                                    <span className="text-brand-blue font-bold mt-0.5">→</span>
                                                    {sugg}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    <p>Results will appear here after scanning</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Import Modal */}
        {isImporting && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col max-h-[80vh]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Import & Improve Existing CV</h3>
                        <button onClick={() => setIsImporting(false)} className="text-gray-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">Upload a PDF or paste the text content of your current resume below. Our AI will analyze, format, and improve the descriptions for you.</p>
                    
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-300">Resume Content</label>
                        <label className="text-xs text-brand-purple hover:text-purple-400 cursor-pointer flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Upload File (PDF/TXT)
                            <input type="file" accept=".pdf,.txt,.md,.json" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>

                    {importFileBase64 ? (
                        <div className="flex-1 bg-black/30 border border-white/10 rounded-lg p-4 flex items-center justify-center mb-4">
                            <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                <p className="text-white font-medium">PDF File Selected</p>
                                <button onClick={() => setImportFileBase64(null)} className="text-sm text-gray-400 hover:text-white underline mt-2">Remove and Paste Text</button>
                            </div>
                        </div>
                    ) : (
                        <textarea 
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg p-4 text-gray-300 focus:border-brand-purple outline-none resize-none mb-4 custom-scrollbar"
                            placeholder="Paste your resume text here..."
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                        />
                    )}

                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsImporting(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button 
                            onClick={handleAnalyzeResume}
                            disabled={isAnalyzing || (!importText.trim() && !importFileBase64)}
                            className="px-6 py-2 bg-brand-purple hover:bg-purple-600 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze & Import'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="h-16 border-b border-white/10 bg-black/20 flex items-center justify-between px-6 shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-white tracking-tight leading-none">{currentCvId ? 'Edit Resume' : 'AI Resume Builder'}</h2>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{TEMPLATES[selectedTemplate].name} Mode</span>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                 {/* Template Selector */}
                 <div className="relative group">
                     <select 
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
                        className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-white transition-colors cursor-pointer outline-none focus:border-brand-purple"
                     >
                         <option value="modern">Modern Tech</option>
                         <option value="classic">Classic Pro</option>
                         <option value="creative">Creative</option>
                         <option value="minimalist">Minimalist</option>
                     </select>
                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                     </div>
                 </div>

                 <button 
                    onClick={() => setShowAtsModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/30 rounded-lg text-sm font-medium transition-colors text-brand-blue"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ATS Check
                 </button>

                 <button 
                    onClick={() => setIsImporting(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors text-gray-300"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    Import
                 </button>
                 
                 {generatedCV && (
                    <>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-green/20 hover:bg-brand-green/30 border border-brand-green/50 rounded-lg text-sm font-medium transition-colors text-brand-green"
                        >
                            {isSaving ? 'Saving...' : (currentCvId ? 'Update' : 'Save')}
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print
                        </button>
                    </>
                 )}
                 <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !personalInfo.fullName}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-brand-purple to-purple-600 hover:from-purple-500 hover:to-purple-700 rounded-lg text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isGenerating ? (
                        <>
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         Generating...
                        </>
                    ) : (
                        <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         Generate
                        </>
                    )}
                 </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black/40">
            
            {/* Input Panel (Left) */}
            <div className="lg:w-[400px] xl:w-[450px] flex flex-col border-r border-white/5 bg-black/20 overflow-y-auto custom-scrollbar p-6 space-y-8">
                
                {/* Personal Info Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                        Personal Details
                    </h3>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {personalInfo.photo ? (
                                <img src={personalInfo.photo} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            )}
                        </div>
                        <div>
                             <label className="block text-xs text-gray-400 mb-1 cursor-pointer hover:text-white transition-colors">
                                 Upload Photo
                                 <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                             </label>
                             <p className="text-[10px] text-gray-600">Recommended: Square JPG/PNG</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <input 
                            type="text" 
                            placeholder="Full Name" 
                            value={personalInfo.fullName}
                            onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all"
                        />
                         <div className="grid grid-cols-2 gap-3">
                            <input 
                                type="text" 
                                placeholder="Email" 
                                value={personalInfo.email}
                                onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none"
                            />
                            <input 
                                type="text" 
                                placeholder="Phone" 
                                value={personalInfo.phone}
                                onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none"
                            />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Location (City, Country)" 
                            value={personalInfo.location}
                            onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none"
                        />
                        <input 
                            type="text" 
                            placeholder="LinkedIn / Portfolio URL" 
                            value={personalInfo.linkedin}
                            onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none"
                        />
                    </div>
                </div>

                {/* Target Role */}
                <div className="space-y-4">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-purple"></span>
                        Target Role
                    </h3>
                    <input 
                        type="text" 
                        placeholder="e.g. Senior Frontend Engineer" 
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none"
                    />
                </div>

                {/* Experience */}
                <div className="space-y-4">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                        Professional Experience
                    </h3>
                    <textarea 
                        placeholder="Paste your work history here. Don't worry about formatting.&#10;&#10;e.g.&#10;Google - Software Engineer (2020-Present)&#10;- Built a scalable API&#10;- Led a team of 5" 
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full h-40 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none resize-none custom-scrollbar leading-relaxed"
                    />
                </div>

                 {/* Education */}
                 <div className="space-y-4">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-yellow"></span>
                        Education
                    </h3>
                    <textarea 
                        placeholder="e.g.&#10;Stanford University&#10;BS Computer Science, 2018" 
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none resize-none custom-scrollbar"
                    />
                </div>

                {/* Skills */}
                <div className="space-y-4">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-red"></span>
                        Skills
                    </h3>
                    <textarea 
                        placeholder="e.g. JavaScript, React, Node.js, Project Management, Agile" 
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none resize-none custom-scrollbar"
                    />
                </div>

                {/* Custom Sections */}
                <div className="space-y-4 border-t border-white/5 pt-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        Additional Sections
                    </h3>
                    
                    {customSections.map((section) => (
                        <div key={section.id} className="bg-black/20 rounded-lg p-3 border border-white/5 space-y-3 relative group">
                            <input 
                                type="text" 
                                value={section.title}
                                onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                                placeholder="Section Title (e.g. Projects, Languages)"
                                className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-sm font-bold text-white placeholder-gray-600 focus:border-brand-purple outline-none"
                            />
                            <textarea 
                                value={section.content}
                                onChange={(e) => handleUpdateSection(section.id, 'content', e.target.value)}
                                placeholder="Details for this section..."
                                className="w-full h-20 bg-transparent px-2 py-1 text-sm text-gray-300 placeholder-gray-600 outline-none resize-none"
                            />
                            <button 
                                onClick={() => handleRemoveSection(section.id)}
                                className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove Section"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}

                    <button 
                        onClick={handleAddSection}
                        className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 text-sm hover:text-white hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Custom Section
                    </button>
                </div>
            </div>

            {/* Preview Panel (Right) */}
            <div className="flex-1 bg-[#1a1a1a] p-8 overflow-y-auto flex justify-center items-start custom-scrollbar relative">
                
                {/* Zoom Controls */}
                {generatedCV && (
                    <div className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg">
                        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 hover:bg-white/10 rounded text-white transition-colors" title="Zoom Out">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        </button>
                        <span className="text-xs font-mono text-gray-300 w-12 text-center select-none">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-white/10 rounded text-white transition-colors" title="Zoom In">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                )}

                {generatedCV ? (
                     <div 
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                        className="transition-transform duration-200 ease-out origin-top"
                    >
                         <div 
                            ref={previewRef}
                            className="w-[210mm] min-h-[297mm] bg-white text-black shadow-2xl p-[15mm] box-border resume-preview"
                            dangerouslySetInnerHTML={{ __html: generatedCV }}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                        <div className="w-24 h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium">Your resume preview will appear here</p>
                        <p className="text-sm">Select a template, fill details, and click Generate</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CVBuilder;
