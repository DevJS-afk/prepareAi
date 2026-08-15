import { toast } from 'sonner';
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../services/firebaseClient';
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
  const { t } = useTranslation();
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
  
  const [generatedCV, setGeneratedCV] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(0.65); 
  const previewRef = useRef<HTMLDivElement>(null);
  const [currentCvId, setCurrentCvId] = useState<string | undefined>(cvId);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');

  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFileBase64, setImportFileBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
                const rawBase64 = base64String.split(',')[1];
                setImportFileBase64(rawBase64);
                setImportText('');
            };
            reader.readAsDataURL(file);
        } else {
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setImportText(text);
                setImportFileBase64(null);
            };
            reader.readAsText(file);
        }
  };

  const handleAnalyzeResume = async () => {
      if (!importText.trim() && !importFileBase64) return;
      if (!process.env.API_KEY) {
          toast.error("API Key missing");
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
              "experience": "string (retain exactly: **Company | Role** \n- Bullet 1\n- Bullet 2)",
              "education": "string (retain exactly: **Institution** \nDegree/Details)",
              "skills": "string (comma separated list, extract all relevant skills)",
              "customSections": [
                { "title": "string", "content": "string" }
              ]
            }
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-3.1-pro-preview',
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
          const errStrConsoleCV = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
          if (!(errStrConsoleCV.includes("429") || errStrConsoleCV.toLowerCase().includes("quota"))) {
              console.error("Parsing failed", error);
          }
          const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
          if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
              toast.error("We have temporarily exceeded our AI service quota. Please try again later.");
          } else {
              toast.error("Failed to analyze resume. Please ensure the file is readable.");
          }
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
const formatContent = (text: any) => {
            if (!text) return '';
            return marked.parse(String(text), { async: false, breaks: true }) as string;
        };

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
                    .profile-photo { width: 90px; height: 90px; border-radius: 50%; position: absolute; top: 40px; right: 40px; border: 1px solid #ccc; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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
        const errStrConsoleCV2 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
        if (!(errStrConsoleCV2.includes("429") || errStrConsoleCV2.toLowerCase().includes("quota"))) {
            console.error(error);
        }
        const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
        if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
            toast.error("We have temporarily exceeded our AI service quota. Please try again later.");
        } else {
            toast.error("Failed to generate CV. Please try again.");
        }
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
              model: 'gemini-3.1-pro-preview',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
          });

          setAtsResult(JSON.parse(response.text || '{}'));

      } catch (e: any) {
          const errStrConsoleCV3 = String(e) + " " + JSON.stringify(e, Object.getOwnPropertyNames(e || {}));
          if (!(errStrConsoleCV3.includes("429") || errStrConsoleCV3.toLowerCase().includes("quota"))) {
              console.error("ATS Scan failed", e);
          }
          const errStr = String(e) + " " + JSON.stringify(e, Object.getOwnPropertyNames(e || {}));
          if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
              toast.error("We have temporarily exceeded our AI service quota. Please try again later.");
          } else {
              toast.error("Scan failed: " + e.message);
          }
      } finally {
          setIsScanningAts(false);
      }
  };

  const handleSave = async () => {
      if (!generatedCV) return;
      if (!supabase) {
          toast.error("Database connection not available.");
          return;
      }
      
      setIsSaving(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
              toast.error("You must be logged in to save.");
              return;
          }

          if (!currentCvId && subscriptionTier === 'free' && !isAdmin) {
              const { count } = await supabase.from('cvs').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
              if (count && count >= 1) {
                  toast.error("Free Plan Limit: You can only save 1 Resume. Please upgrade to Pro for unlimited saves.");
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
              toast.success("Resume updated successfully!");
          } else {
              const { data, error } = await supabase.from('cvs').insert({ ...payload, user_id: user.id }).select();
              if (error) throw error;
              if (data && data[0]) {
                  setCurrentCvId(data[0].id);
              }
              toast.success("Resume saved successfully to your profile!");
          }

      } catch (err: any) {
          console.error("Error saving CV:", err);
          
              toast.error("Failed to save resume: " + err.message);
          
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
              body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: sans-serif; }
              img { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              @page { size: A4; margin: 0; }
              @media print {
                body, img { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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

      const imgs = printWindow.document.getElementsByTagName('img');
      const promises = Array.from(imgs).map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
          const origSrc = img.src;
          img.src = '';
          img.src = origSrc;
        });
      });

      Promise.all(promises).then(() => {
        setTimeout(() => {
          try {
            printWindow.print();
          } catch (e) {
            console.error("Print error", e);
          }
        }, 500);
      }).catch(() => {
        printWindow.print();
      });
    }
  };

  return (
    <div className="w-full h-[100dvh] sm:w-[95vw] sm:h-[95vh] md:w-[90vw] md:h-[90vh] flex flex-col glass-panel sm:rounded-2xl overflow-hidden animate-fade-in shadow-2xl relative">
        
        {showAtsModal && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#1a1a1a] w-full rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-200/70 dark:bg-black/40">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('CVBuilder.ATSModalTitle')}</h3>
                        </div>
                        <button onClick={() => { setShowAtsModal(false); setAtsResult(null); }} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2 p-6 flex flex-col border-r border-slate-200 dark:border-white/10">
                            <p className="text-slate-600 dark:text-gray-400 text-sm mb-4">{t('CVBuilder.ATSDescription')}</p>
                            <textarea 
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="flex-1 bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:border-brand-blue outline-none resize-none custom-scrollbar mb-4 text-sm"
                                placeholder={t('CVBuilder.PasteJobDescription')}
                            />
                            <button 
                                onClick={handleScanAts}
                                disabled={isScanningAts || !jobDescription}
                                className="w-full py-3 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isScanningAts ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {t('CVBuilder.Scanning')}</>
                                ) : (
                                    <>{t('CVBuilder.ScanAndAnalyze')}</>
                                )}
                            </button>
                        </div>

                        <div className="w-full md:w-1/2 p-6 bg-slate-200/30 dark:bg-black/20 overflow-y-auto custom-scrollbar">
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
                                                <span className="text-2xl font-bold text-slate-900 dark:text-white">{atsResult.score}%</span>
                                                <span className="text-[10px] uppercase text-slate-500 dark:text-gray-500 font-bold">{t('CVBuilder.Match')}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-slate-900 dark:text-white font-bold mb-1">{t('CVBuilder.AnalysisSummary')}</h4>
                                            <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{atsResult.summary}</p>
                                        </div>
                                    </div>

                                    {atsResult.missingKeywords.length > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                            <h5 className="text-red-400 font-bold text-xs uppercase tracking-wider mb-3">{t('CVBuilder.MissingKeywords')}</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {atsResult.missingKeywords.map((kw, i) => (
                                                    <span key={i} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs border border-red-500/20">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h5 className="text-brand-blue font-bold text-xs uppercase tracking-wider mb-3">{t('CVBuilder.ImprovementPlan')}</h5>
                                        <ul className="space-y-3">
                                            {atsResult.suggestions.map((sugg, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/5">
                                                    <span className="text-brand-blue font-bold mt-0.5">→</span>
                                                    {sugg}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-gray-500 opacity-60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    <p>{t('CVBuilder.NoResults')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {isImporting && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl flex flex-col max-h-[80vh]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('CVBuilder.ImportModalTitle')}</h3>
                        <button onClick={() => setIsImporting(false)} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p className="text-slate-600 dark:text-gray-400 text-sm mb-4">{t('CVBuilder.ImportDescription')}</p>
                    
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-300">{t('CVBuilder.ResumeContent')}</label>
                        <label className="text-xs text-brand-purple hover:text-purple-400 cursor-pointer flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            {t('CVBuilder.UploadFile')}
                            <input type="file" accept=".pdf,.txt,.md,.json" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>

                    {importFileBase64 ? (
                        <div className="flex-1 bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-4 flex items-center justify-center mb-4">
                            <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                <p className="text-slate-900 dark:text-white font-medium">{t('CVBuilder.PDFSelected')}</p>
                                <button onClick={() => setImportFileBase64(null)} className="text-sm text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white underline mt-2">{t('CVBuilder.RemoveAndPaste')}</button>
                            </div>
                        </div>
                    ) : (
                        <textarea 
                            className="flex-1 bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-4 text-gray-300 focus:border-brand-purple outline-none resize-none mb-4 custom-scrollbar"
                            placeholder={t('CVBuilder.PasteYourResumeTextHere')}
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                        />
                    )}

                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsImporting(false)} className="px-4 py-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white">Cancel</button>
                        <button 
                            onClick={handleAnalyzeResume}
                            disabled={isAnalyzing || (!importText.trim() && !importFileBase64)}
                            className="px-6 py-2 bg-brand-purple hover:bg-purple-600 text-slate-900 dark:text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {isAnalyzing ? t('CVBuilder.Analyzing') : t('CVBuilder.AnalyzeAndImport')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="min-h-[4rem] border-b border-slate-200 dark:border-white/10 bg-slate-200/30 dark:bg-black/20 flex flex-col md:flex-row items-center justify-between p-4 md:px-6 shrink-0 backdrop-blur-md gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">{currentCvId ? t('CVBuilder.EditResume') : t('CVBuilder.AIResumeBuilder')}</h2>
                    <span className="text-[10px] text-slate-600 dark:text-gray-400 uppercase tracking-widest">{TEMPLATES[selectedTemplate].name} Mode</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 justify-start md:justify-end custom-scrollbar shrink-0">


                 <button 
                    onClick={() => setShowAtsModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/30 rounded-lg text-sm font-medium transition-colors text-brand-blue"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('CVBuilder.ATSCheck')}
                 </button>

                 <button 
                    onClick={() => setIsImporting(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium transition-colors text-gray-300"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    {t('CVBuilder.Import')}
                 </button>
                 
                 {generatedCV && (
                    <>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-green/20 hover:bg-brand-green/30 border border-brand-green/50 rounded-lg text-sm font-medium transition-colors text-brand-green"
                        >
                            {isSaving ? '...' : (currentCvId ? t('CVBuilder.Update') : t('CVBuilder.Save'))}
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-slate-900 dark:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            {t('CVBuilder.Print')}
                        </button>
                    </>
                 )}
                 <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !personalInfo.fullName}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-brand-purple to-purple-600 hover:from-purple-500 hover:to-purple-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isGenerating ? (
                        <>
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         {t('CVBuilder.Generating')}
                        </>
                    ) : (
                        <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         {t('CVBuilder.Generate')}
                        </>
                    )}
                 </button>
            </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-slate-200/70 dark:bg-black/40 relative">
            
            <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/5 bg-slate-200/30 dark:bg-black/20 lg:overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 sm:space-y-8 lg:h-full shrink-0">
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
                                className={`flex flex-col text-left p-2 border text-xs transition-all duration-200 rounded-xl ${
                                    selectedTemplate === theme.id 
                                        ? 'bg-white/10 border-brand-purple text-slate-900 dark:text-white shadow-lg shadow-brand-purple/10' 
                                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-1.5 font-bold mb-1">
                                    <span className={`w-2.5 h-2.5 rounded-full ${theme.colors} border`}></span>
                                    {theme.name}
                                </div>
                                <span className="text-[10px] text-slate-500 dark:text-gray-500 leading-tight">{theme.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                        {t('CVBuilder.PersonalDetails')}
                    </h3>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {personalInfo.photo ? (
                                <img src={personalInfo.photo} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            )}
                        </div>
                        <div>
                             <label className="block text-xs text-slate-600 dark:text-gray-400 mb-1 cursor-pointer hover:text-slate-900 dark:text-white transition-colors">
                                 {t('CVBuilder.UploadPhoto')}
                                 <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                             </label>
                             <p className="text-[10px] text-gray-600">{t('CVBuilder.RecommendedSquare')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <input 
                            type="text" 
                            placeholder={t('CVBuilder.FullName')}
                            value={personalInfo.fullName}
                            onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                            className="bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all"
                        />
                         <div className="grid grid-cols-2 gap-3">
                            <input 
                                type="text" 
                                placeholder={t('CVBuilder.Email')}
                                value={personalInfo.email}
                                onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                                className="bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none"
                            />
                            <input 
                                type="text" 
                                placeholder={t('CVBuilder.Phone')}
                                value={personalInfo.phone}
                                onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                                className="bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none"
                            />
                        </div>
                        <input 
                            type="text" 
                            placeholder={t('CVBuilder.Location')}
                            value={personalInfo.location}
                            onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                            className="bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none"
                        />
                        <input 
                            type="text" 
                            placeholder={t('CVBuilder.LinkedIn')}
                            value={personalInfo.linkedin}
                            onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
                            className="bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                     <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-purple"></span>
                        {t('CVBuilder.TargetRole')}
                    </h3>
                    <input 
                        type="text" 
                        placeholder={t('CVBuilder.TargetRolePlaceholder')}
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none"
                    />
                </div>

                <div className="space-y-4">
                     <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                        {t('CVBuilder.ProfessionalExperience')}
                    </h3>
                    <textarea 
                        placeholder={t('CVBuilder.ExperiencePlaceholder')}
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full h-40 bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none resize-none custom-scrollbar leading-relaxed"
                    />
                </div>

                 <div className="space-y-4">
                     <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-yellow"></span>
                        {t('CVBuilder.Education')}
                    </h3>
                    <textarea 
                        placeholder={t('CVBuilder.EducationPlaceholder')}
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full h-24 bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none resize-none custom-scrollbar"
                    />
                </div>

                <div className="space-y-4">
                     <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-red"></span>
                        {t('CVBuilder.Skills')}
                    </h3>
                    <textarea 
                        placeholder={t('CVBuilder.SkillsPlaceholder')}
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full h-24 bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-brand-purple outline-none resize-none custom-scrollbar"
                    />
                </div>

                <div className="space-y-4 border-t border-slate-200 dark:border-white/5 pt-4">
                    <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        {t('CVBuilder.AdditionalSections')}
                    </h3>
                    
                    {customSections.map((section) => (
                        <div key={section.id} className="bg-slate-200/30 dark:bg-black/20 rounded-lg p-3 border border-slate-200 dark:border-white/5 space-y-3 relative group">
                            <input 
                                type="text" 
                                value={section.title}
                                onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                                placeholder={t('CVBuilder.SectionTitlePlaceholder')}
                                className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 px-2 py-1 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:border-brand-purple outline-none"
                            />
                            <textarea 
                                value={section.content}
                                onChange={(e) => handleUpdateSection(section.id, 'content', e.target.value)}
                                placeholder={t('CVBuilder.SectionContentPlaceholder')}
                                className="w-full h-20 bg-transparent px-2 py-1 text-sm text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 outline-none resize-none"
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
                        className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-slate-600 dark:text-gray-400 text-sm hover:text-slate-900 dark:text-white hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        {t('CVBuilder.AddCustomSection')}
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-[500px] lg:min-h-0 bg-white dark:bg-[#1a1a1a] p-4 sm:p-8 lg:overflow-y-auto flex justify-center items-start custom-scrollbar relative">
                
                {generatedCV && (
                    <div className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-lg">
                        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-900 dark:text-white transition-colors" title="Zoom Out">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        </button>
                        <span className="text-xs font-mono text-gray-300 w-12 text-center select-none">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-900 dark:text-white transition-colors" title="Zoom In">
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
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-gray-500 opacity-60">
                        <div className="w-24 h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium">{t('CVBuilder.PreviewText')}</p>
                        <p className="text-sm">{t('CVBuilder.PreviewSubtext')}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CVBuilder;