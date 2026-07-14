
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../services/supabaseClient';
import type { SavedCV, SubscriptionTier } from '../types';

interface PortfolioBuilderProps {
  onBack: () => void;
  initialData?: any;
  portfolioId?: string;
  subscriptionTier?: SubscriptionTier;
  isAdmin?: boolean;
}

interface Project {
    id: string;
    title: string;
    description: string;
    link: string;
    imageUrl: string;
}

const PortfolioBuilder: React.FC<PortfolioBuilderProps> = ({ onBack, initialData, portfolioId, subscriptionTier = 'free', isAdmin = false }) => {
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    github: '',
    linkedin: '',
    heroImage: '',
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState('');
  
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | undefined>(portfolioId);
  
  // States for importing from CV
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [customImportText, setCustomImportText] = useState('');
  const [importFileBase64, setImportFileBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // States for Image Uploads
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    if (initialData) {
        setProfile(initialData.profile || { name: '', title: '', bio: '', email: '', github: '', linkedin: '', heroImage: '' });
        setProjects(initialData.projects || []);
        setSkills(initialData.skills || '');
    }
  }, [initialData]);

  useEffect(() => {
      const fetchCVs = async () => {
          if (!supabase) return;
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await supabase.from('cvs').select('id, title, data, content, created_at').eq('user_id', user.id).order('created_at', { ascending: false });
            if (error) {
                console.warn("Could not fetch CVs. Tables might be missing.", error);
                return;
            }
            if (data) setSavedCVs(data);
          } catch (e) {
              console.warn("Error fetching CVs", e);
          }
      };
      fetchCVs();
  }, []);

  const handleAddProject = () => {
      const newProject: Project = {
          id: Date.now().toString(),
          title: '',
          description: '',
          link: '',
          imageUrl: ''
      };
      setProjects([...projects, newProject]);
  };

  const handleUpdateProject = (id: string, field: keyof Project, value: string) => {
      setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRemoveProject = (id: string) => {
      setProjects(projects.filter(p => p.id !== id));
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
                setCustomImportText('');
                setSelectedCvId('');
            };
            reader.readAsDataURL(file);
        } else {
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setCustomImportText(text);
                setImportFileBase64(null);
                setSelectedCvId('');
            };
            reader.readAsText(file);
        }
  };

  const handleImageUpload = async (file: File, bucket: string = 'portfolio-images'): Promise<string | null> => {
      if (!supabase) return null;
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
              .from(bucket)
              .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
              .from(bucket)
              .getPublicUrl(fileName);
          
          return publicUrl;
      } catch (error: any) {
          if (error.message && (error.message.includes("Bucket not found") || error.statusCode === '404')) {
              alert("Configuration Error: The 'portfolio-images' storage bucket does not exist. Please run the Storage Setup SQL script in README.md.");
          } else {
              alert('Error uploading image: ' + error.message);
          }
          return null;
      }
  };

  const handleProjectImageUpload = async (projectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploadingProjectId(projectId);
      
      const url = await handleImageUpload(e.target.files[0]);
      if (url) {
          handleUpdateProject(projectId, 'imageUrl', url);
      }
      
      setUploadingProjectId(null);
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploadingHero(true);

      const url = await handleImageUpload(e.target.files[0]);
      if (url) {
          setProfile(prev => ({ ...prev, heroImage: url }));
      }

      setUploadingHero(false);
  };

  const handleImportFromCV = async () => {
      let textToAnalyze = customImportText;
      let fileData = importFileBase64;

      // If a Saved CV is selected, try to get raw data first, else use the raw HTML content (less ideal but works with AI)
      if (selectedCvId) {
          const cv = savedCVs.find(c => c.id === selectedCvId);
          if (cv) {
             // If we stored structured data, construct a text representation
             if (cv.data && cv.data.personalInfo) {
                 const d = cv.data;
                 textToAnalyze = `
                    Name: ${d.personalInfo.fullName}
                    Email: ${d.personalInfo.email}
                    Role: ${d.targetRole}
                    Experience: ${d.experience}
                    Skills: ${d.skills}
                    Custom: ${JSON.stringify(d.customSections)}
                 `;
             } else {
                 // Fallback to the HTML content string, AI can strip tags
                 textToAnalyze = cv.content; 
             }
             fileData = null; // Ensure we use the text from DB
          }
      }

      if (!textToAnalyze.trim() && !fileData) {
          alert("Please select a CV, paste text, or upload a PDF to import.");
          return;
      }
      
      if (!process.env.API_KEY) {
          alert("API Key missing");
          return;
      }

      setIsAnalyzing(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          let contentPart: any;
          if (fileData) {
              contentPart = { inlineData: { mimeType: 'application/pdf', data: fileData } };
          } else {
              contentPart = { text: textToAnalyze };
          }

          const prompt = `
            Act as a Portfolio Builder AI. 
            Analyze the resume content provided and extract data to populate a portfolio website.
            
            1. Extract Profile Info (Name, Job Title, Bio, Email, Social Links).
            2. Extract Skills (comma separated).
            3. Extract Projects: Look for specific project sections. If none exist, INFER 2-3 impressive projects based on the work experience described. Create a title and a professional description for each.
            4. Return JSON matching the structure below.

            REQUIRED JSON STRUCTURE:
            {
                "profile": {
                    "name": "string",
                    "title": "string",
                    "bio": "string (professional summary, max 300 chars)",
                    "email": "string",
                    "github": "string (or empty)",
                    "linkedin": "string (or empty)"
                },
                "skills": "string",
                "projects": [
                    { "title": "string", "description": "string", "link": "", "imageUrl": "" }
                ]
            }
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [contentPart, { text: prompt }],
              config: { responseMimeType: 'application/json' }
          });

          const data = JSON.parse(response.text || '{}');

          if (data.profile) {
              setProfile(prev => ({
                  ...prev,
                  name: data.profile.name || prev.name,
                  title: data.profile.title || prev.title,
                  bio: data.profile.bio || prev.bio,
                  email: data.profile.email || prev.email,
                  github: data.profile.github || prev.github,
                  linkedin: data.profile.linkedin || prev.linkedin
              }));
          }
          if (data.skills) setSkills(data.skills);
          if (data.projects && Array.isArray(data.projects)) {
              const mappedProjects = data.projects.map((p: any) => ({
                  id: Date.now().toString() + Math.random(),
                  title: p.title,
                  description: p.description,
                  link: p.link || '',
                  imageUrl: p.imageUrl || ''
              }));
              // Append or replace? Let's replace to be clean, or user can manually add more.
              setProjects(mappedProjects);
          }
          
          setIsImporting(false);
          setCustomImportText('');
          setImportFileBase64(null);
          setSelectedCvId('');

      } catch (error) {
          console.error("Import failed", error);
          alert("Failed to analyze resume data.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
        alert("API Key missing");
        return;
    }
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const projectItems = projects.map(p => `
            - Project: ${p.title}
              Description: ${p.description}
              Link: ${p.link}
              Image URL: ${p.imageUrl}
        `).join('\n');

        const prompt = `
          You are an expert Front-end Developer and UI/UX Designer. Create a modern, responsive, single-page portfolio website using HTML and Tailwind CSS (via CDN).

          USER PROFILE:
          Name: ${profile.name}
          Job Title: ${profile.title}
          Bio: ${profile.bio}
          Hero Image: ${profile.heroImage || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80'}
          Email: ${profile.email}
          GitHub: ${profile.github}
          LinkedIn: ${profile.linkedin}
          Skills: ${skills}

          PROJECTS:
          ${projectItems}

          INSTRUCTIONS:
          1. Return ONLY the raw HTML code. Do not include markdown code blocks.
          2. Use a dark, sleek, modern aesthetic (dark mode by default).
          3. Include the Tailwind CSS script tag: <script src="https://cdn.tailwindcss.com"></script>
          4. Sections: Hero (with name, title, bio), Skills, Projects (Grid layout), Contact.
          5. Ensure the "Contact" section uses mailto: for email.
          6. Use font 'Inter' via Google Fonts.
          7. Make it fully responsive.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        let cleanHtml = response.text || '';
        cleanHtml = cleanHtml.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
        setGeneratedCode(cleanHtml);

    } catch (error) {
        console.error(error);
        alert("Failed to generate portfolio. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSave = async () => {
      if (!generatedCode) return;
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

          // Check Limits for Free Tier (Only 1 Portfolio Allowed) - Admins bypass
          if (!currentPortfolioId && subscriptionTier === 'free' && !isAdmin) {
              const { count } = await supabase.from('portfolios').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
              if (count && count >= 1) {
                  alert("Free Plan Limit: You can only save 1 Portfolio. Please upgrade to Pro for unlimited saves.");
                  setIsSaving(false);
                  return;
              }
          }

          const payload = {
              title: `${profile.name} - Portfolio`,
              content: generatedCode,
              data: { profile, projects, skills }
          };

          if (currentPortfolioId) {
              const { error } = await supabase.from('portfolios').update(payload).eq('id', currentPortfolioId);
              if (error) throw error;
              alert("Portfolio updated successfully!");
          } else {
              const { data, error } = await supabase.from('portfolios').insert({ ...payload, user_id: user.id }).select();
              if (error) throw error;
              if (data && data[0]) {
                  setCurrentPortfolioId(data[0].id);
              }
              alert("Portfolio saved successfully to your profile!");
          }

      } catch (err: any) {
          console.error("Error saving Portfolio:", err);
          if (err.code === 'PGRST205' || err.message?.includes('does not exist') || err.code === '42P01') {
              alert("Configuration Error: The 'portfolios' table does not exist in your database.\n\nPlease go to the README.md file, copy the SQL script under 'Database Setup', and run it in your Supabase SQL Editor.");
          } else {
              alert("Failed to save portfolio: " + err.message);
          }
      } finally {
          setIsSaving(false);
      }
  };

  const handleDownload = () => {
      const element = document.createElement("a");
      const file = new Blob([generatedCode], {type: 'text/html'});
      element.href = URL.createObjectURL(file);
      element.download = `portfolio_${profile.name.replace(/\s+/g, '_')}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="w-[90vw] h-[90vh] flex flex-col glass-panel rounded-2xl overflow-hidden animate-fade-in shadow-2xl relative">
        
        {/* Import Modal */}
        {isImporting && (
             <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#1a1a1a] w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col max-h-[80vh]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Load Data from Resume</h3>
                         <button onClick={() => setIsImporting(false)} className="text-gray-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div className="space-y-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Select Saved Resume</label>
                            <select 
                                value={selectedCvId}
                                onChange={(e) => { setSelectedCvId(e.target.value); setCustomImportText(''); setImportFileBase64(null); }}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow outline-none"
                            >
                                <option value="">-- Choose a Saved CV --</option>
                                {savedCVs.map(cv => (
                                    <option key={cv.id} value={cv.id}>{cv.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <div className="h-px flex-1 bg-white/10"></div>
                            <span>OR</span>
                            <div className="h-px flex-1 bg-white/10"></div>
                        </div>
                         <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-400">Upload / Paste Resume</label>
                                <label className="text-xs text-brand-yellow hover:text-yellow-400 cursor-pointer flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    Upload PDF/TXT
                                    <input type="file" accept=".pdf,.txt,.md,.json" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>
                            
                            {importFileBase64 ? (
                                <div className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center">
                                    <div className="text-brand-yellow mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <p className="text-sm text-white">PDF Loaded Ready for Analysis</p>
                                    <button onClick={() => setImportFileBase64(null)} className="text-xs text-gray-400 underline mt-2">Clear file</button>
                                </div>
                            ) : (
                                <textarea 
                                    className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-3 text-gray-300 focus:border-brand-yellow outline-none resize-none custom-scrollbar"
                                    placeholder="Paste text here if you haven't saved a resume..."
                                    value={customImportText}
                                    onChange={(e) => { setCustomImportText(e.target.value); setSelectedCvId(''); }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsImporting(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button 
                            onClick={handleImportFromCV}
                            disabled={isAnalyzing || (!selectedCvId && !customImportText.trim() && !importFileBase64)}
                            className="px-6 py-2 bg-brand-yellow hover:bg-yellow-600 text-black rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {isAnalyzing ? 'Extracting...' : 'Autofill Portfolio'}
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
                <h2 className="text-xl font-bold text-white tracking-tight">AI Portfolio Builder</h2>
            </div>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setIsImporting(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors text-gray-300"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M9 7h12m-6 0v8" /></svg>
                    Load from Resume
                 </button>
                 {generatedCode && (
                    <>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-yellow/20 hover:bg-brand-yellow/30 border border-brand-yellow/50 rounded-lg text-sm font-medium transition-colors text-brand-yellow"
                        >
                            {isSaving ? 'Saving...' : (currentPortfolioId ? 'Update' : 'Save')}
                        </button>
                         <button 
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download HTML
                        </button>
                    </>
                 )}
                 <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !profile.name}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-brand-yellow to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 rounded-lg text-sm font-bold text-black shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isGenerating ? 'Generating...' : 'Generate Site'}
                 </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black/40">
            {/* Left Panel: Inputs */}
            <div className="lg:w-[400px] xl:w-[450px] flex flex-col border-r border-white/5 bg-black/20 overflow-y-auto custom-scrollbar p-6 space-y-8">
                
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-yellow"></span>
                        About You
                    </h3>
                    <input type="text" placeholder="Full Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-yellow" />
                    <input type="text" placeholder="Job Title (e.g. UX Designer)" value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-yellow" />
                    <textarea placeholder="Short Bio" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-yellow h-24 resize-none" />
                    
                    {/* Hero Image Input */}
                    <div className="flex gap-2 items-center">
                        <input type="text" placeholder="Hero Image URL (Optional)" value={profile.heroImage} onChange={e => setProfile({...profile, heroImage: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-yellow" />
                        <label className="cursor-pointer p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-gray-400 hover:text-white flex items-center justify-center h-[42px] w-[42px]" title="Upload Hero Image">
                            {uploadingHero ? (
                                <div className="w-4 h-4 border-2 border-brand-yellow/50 border-t-brand-yellow rounded-full animate-spin"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handleHeroImageUpload} disabled={uploadingHero} />
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                        Contact & Skills
                    </h3>
                    <input type="text" placeholder="Email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-yellow" />
                    <input type="text" placeholder="GitHub URL" value={profile.github} onChange={e => setProfile({...profile, github: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-yellow" />
                    <input type="text" placeholder="LinkedIn URL" value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-yellow" />
                    <textarea placeholder="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-yellow h-20 resize-none" />
                </div>

                <div className="space-y-4 border-t border-white/5 pt-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                        Projects
                    </h3>
                    {projects.map(p => (
                        <div key={p.id} className="bg-black/20 rounded-lg p-3 border border-white/5 space-y-3 relative group">
                             <input type="text" placeholder="Project Title" value={p.title} onChange={e => handleUpdateProject(p.id, 'title', e.target.value)} className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-sm font-bold text-white outline-none focus:border-brand-yellow" />
                             <textarea placeholder="Description" value={p.description} onChange={e => handleUpdateProject(p.id, 'description', e.target.value)} className="w-full bg-transparent px-2 py-1 text-sm text-gray-300 outline-none resize-none h-16" />
                             <input type="text" placeholder="Project Link" value={p.link} onChange={e => handleUpdateProject(p.id, 'link', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none" />
                             
                             {/* Project Image Upload */}
                             <div className="flex gap-2 items-center">
                                 <input 
                                    type="text" 
                                    placeholder="Image URL" 
                                    value={p.imageUrl} 
                                    onChange={e => handleUpdateProject(p.id, 'imageUrl', e.target.value)} 
                                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none" 
                                 />
                                 <label className="cursor-pointer p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors text-gray-400 hover:text-white flex items-center justify-center" title="Upload Project Image">
                                    {uploadingProjectId === p.id ? (
                                        <div className="w-3 h-3 border-2 border-brand-yellow/50 border-t-brand-yellow rounded-full animate-spin"></div>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => handleProjectImageUpload(p.id, e)} 
                                        disabled={uploadingProjectId === p.id}
                                    />
                                </label>
                             </div>

                             <button onClick={() => handleRemoveProject(p.id)} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                    <button onClick={handleAddProject} className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 text-sm hover:text-white hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
                         + Add Project
                    </button>
                </div>

            </div>

            {/* Right Panel: Preview */}
            <div className="flex-1 bg-[#1a1a1a] p-0 overflow-hidden relative">
                {generatedCode ? (
                    <iframe 
                        title="Preview"
                        srcDoc={generatedCode}
                        className="w-full h-full border-none bg-white"
                        sandbox="allow-scripts"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                        <div className="w-24 h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium">Portfolio Preview</p>
                        <p className="text-sm">Fill details and click Generate Site</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default PortfolioBuilder;
