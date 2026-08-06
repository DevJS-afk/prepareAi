
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../services/firebaseClient';
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

  // Drag and Drop Visual Layout Editor states
  const [sections, setSections] = useState([
    { id: 'hero', name: 'Hero / About Banner', icon: '👤', description: 'Introduce yourself with name, title, bio, and hero image', visible: true },
    { id: 'skills', name: 'Skills Showcase', icon: '⚡', description: 'Display your tech stack and technical skills', visible: true },
    { id: 'projects', name: 'Projects Showcase', icon: '🚀', description: 'Grid display of your highlighted projects', visible: true },
    { id: 'contact', name: 'Contact Form & Socials', icon: '📬', description: 'Let visitors reach you via email and social networks', visible: true },
  ]);
  const [selectedTheme, setSelectedTheme] = useState<string>('cosmic-slate');
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [draggedProjectIndex, setDraggedProjectIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'phone'>('desktop');

  useEffect(() => {
    if (initialData) {
        setProfile(initialData.profile || { name: '', title: '', bio: '', email: '', github: '', linkedin: '', heroImage: '' });
        setProjects(initialData.projects || []);
        setSkills(initialData.skills || '');
        
        // Safely extract loaded database properties if we are in view/edit mode
        const loadedData = initialData.data || initialData;
        if (loadedData.sections && Array.isArray(loadedData.sections)) {
            setSections(loadedData.sections);
        }
        if (loadedData.selectedTheme) {
            setSelectedTheme(loadedData.selectedTheme);
        }
    }
  }, [initialData]);

  const handleSectionDragStart = (index: number) => {
    setDraggedSectionIndex(index);
  };

  const handleSectionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === index) return;
    
    const newSections = [...sections];
    const draggedItem = newSections[draggedSectionIndex];
    newSections.splice(draggedSectionIndex, 1);
    newSections.splice(index, 0, draggedItem);
    
    setDraggedSectionIndex(index);
    setSections(newSections);
  };

  const handleSectionDragEnd = () => {
    setDraggedSectionIndex(null);
  };

  const toggleSectionVisibility = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const handleProjectDragStart = (index: number) => {
    setDraggedProjectIndex(index);
  };

  const handleProjectDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedProjectIndex === null || draggedProjectIndex === index) return;
    
    const newProjects = [...projects];
    const draggedItem = newProjects[draggedProjectIndex];
    newProjects.splice(draggedProjectIndex, 1);
    newProjects.splice(index, 0, draggedItem);
    
    setDraggedProjectIndex(index);
    setProjects(newProjects);
  };

  const handleProjectDragEnd = () => {
    setDraggedProjectIndex(null);
  };

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
              model: 'gemini-3.1-pro-preview',
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
          const errStrConsole = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
          if (!(errStrConsole.includes("429") || errStrConsole.toLowerCase().includes("quota"))) {
            console.error("Import failed", error);
          }
          const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
          if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
              alert("We have temporarily exceeded our AI service quota. Please try again later.");
          } else {
              alert("Failed to analyze resume data.");
          }
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
        
        const projectItems = projects.map((p, idx) => `
            - Project #${idx + 1}: ${p.title}
              Description: ${p.description}
              Link: ${p.link}
              Image URL: ${p.imageUrl}
        `).join('\n');

        const visibleSections = sections.filter(s => s.visible);
        const sectionsOrderDesc = visibleSections.map((s, index) => `${index + 1}. Section ID: "${s.id}" - ${s.name}`).join('\n');

        const themePromptDetails = {
            'cosmic-slate': 'Theme: Cosmic Slate. Deep high-tech dark mode. Dark background (#0A0E1A), glassmorphism cards (bg-slate-50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10), glowing purple and electric indigo accents, clean typography with high contrast white headings, smooth hover states with subtle scale/shadows.',
            'cyberpunk-neon': 'Theme: Cyberpunk Neon. High-octane sci-fi dark style. Pitch black background (#030303), blazing neon-pink and electric-cyan accents, glowing neon card borders (border border-pink-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]), monospace headers, ultra-sleek high-contrast buttons.',
            'minimalist-light': 'Theme: Minimalist Light. High-end, pristine and elegant. Clean warm white background (#F9FAFB), crisp dark charcoal headings (#111827) with light grey secondary text, thin elegant divider lines, expansive white space, minimal card borders, extremely professional editorial aesthetic.',
            'forest-mint': 'Theme: Forest Mint. Natural, calming and sophisticated organic look. Luxurious dark forest green background (#06140E), warm light-cream text (#F4EFEB), rich emerald green and minty fresh accents (#10B981), extra smooth rounded cards (#0B2319), giving an organic premium bio vibe.'
        }[selectedTheme] || 'Theme style: Cosmic Slate.';

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

          PROJECTS (Render in this exact ordered sequence):
          ${projectItems}

          CUSTOM LAYOUT AND STRUCTURAL INSTRUCTIONS:
          1. Render ONLY these visible sections in this EXACT specified order. Do not skip, rearrange, or add other main sections:
          ${sectionsOrderDesc}

          THEME AND DESIGN SYSTEM DIRECTIONS (STRICTLY ADHERE TO THIS):
          ${themePromptDetails}

          GENERAL CODE GUIDELINES:
          1. Return ONLY the raw HTML code. Do not include markdown code blocks.
          2. Include the Tailwind CSS script tag: <script src="https://cdn.tailwindcss.com"></script>
          3. Ensure the "Contact" section uses mailto: for email.
          4. Use font 'Inter' via Google Fonts.
          5. Make it fully responsive.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: prompt,
        });
        
        let cleanHtml = response.text || '';
        cleanHtml = cleanHtml.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
        setGeneratedCode(cleanHtml);

    } catch (error) {
        const errStrConsole2 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
        if (!(errStrConsole2.includes("429") || errStrConsole2.toLowerCase().includes("quota"))) {
            console.error(error);
        }
        const errStr = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
        if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
            alert("We have temporarily exceeded our AI service quota. Please try again later.");
        } else {
            alert("Failed to generate portfolio. Please try again.");
        }
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
              data: { profile, projects, skills, sections, selectedTheme }
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
                <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl flex flex-col max-h-[80vh]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Load Data from Resume</h3>
                         <button onClick={() => setIsImporting(false)} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div className="space-y-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 dark:text-gray-400 mb-2">Select Saved Resume</label>
                            <select 
                                value={selectedCvId}
                                onChange={(e) => { setSelectedCvId(e.target.value); setCustomImportText(''); setImportFileBase64(null); }}
                                className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-brand-yellow outline-none cursor-pointer"
                            >
                                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">-- Choose a Saved CV --</option>
                                {savedCVs.map(cv => (
                                    <option key={cv.id} value={cv.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{cv.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-gray-500 text-sm">
                            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>
                            <span>OR</span>
                            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>
                        </div>
                         <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-600 dark:text-gray-400">Upload / Paste Resume</label>
                                <label className="text-xs text-brand-yellow hover:text-yellow-400 cursor-pointer flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    Upload PDF/TXT
                                    <input type="file" accept=".pdf,.txt,.md,.json" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>
                            
                            {importFileBase64 ? (
                                <div className="w-full h-32 bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-4 flex flex-col items-center justify-center">
                                    <div className="text-brand-yellow mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <p className="text-sm text-slate-900 dark:text-white">PDF Loaded Ready for Analysis</p>
                                    <button onClick={() => setImportFileBase64(null)} className="text-xs text-slate-600 dark:text-gray-400 underline mt-2">Clear file</button>
                                </div>
                            ) : (
                                <textarea 
                                    className="w-full h-32 bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-gray-300 focus:border-brand-yellow outline-none resize-none custom-scrollbar"
                                    placeholder="Paste text here if you haven't saved a resume..."
                                    value={customImportText}
                                    onChange={(e) => { setCustomImportText(e.target.value); setSelectedCvId(''); }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsImporting(false)} className="px-4 py-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white">Cancel</button>
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
        <div className="h-16 border-b border-slate-200 dark:border-white/10 bg-slate-200/30 dark:bg-black/20 flex items-center justify-between px-6 shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">AI Portfolio Builder</h2>
            </div>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setIsImporting(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium transition-colors text-gray-300"
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
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-slate-900 dark:text-white"
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
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-200/70 dark:bg-black/40">
            {/* Left Panel: Inputs */}
            <div className="lg:w-[400px] xl:w-[450px] flex flex-col border-r border-slate-200 dark:border-white/5 bg-slate-200/30 dark:bg-black/20 overflow-y-auto custom-scrollbar p-6 space-y-8">
                
                {/* Theme & Layout Editor Section */}
                <div className="space-y-4 border-b border-slate-200 dark:border-white/5 pb-6">
                    <h3 className="text-sm font-bold text-brand-yellow uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow animate-pulse"></span>
                        Layout & Theme Builder
                    </h3>
                    
                    {/* Theme selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-gray-400">Portfolio Style Theme</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'cosmic-slate', name: 'Cosmic Slate', colors: 'bg-[#0B0F19] border-indigo-500/50', desc: 'Tech dark, purple glow' },
                                { id: 'cyberpunk-neon', name: 'Cyberpunk Neon', colors: 'bg-black border-pink-500/50', desc: 'Neon pink & cyan' },
                                { id: 'minimalist-light', name: 'Minimalist Light', colors: 'bg-gray-100 border-gray-400', desc: 'Clean elegant white' },
                                { id: 'forest-mint', name: 'Forest Mint', colors: 'bg-[#06140E] border-emerald-500/50', desc: 'Organic rich green' },
                            ].map(theme => (
                                <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => setSelectedTheme(theme.id)}
                                    className={`flex flex-col text-left p-2 border text-xs transition-all duration-200 rounded-xl ${
                                        selectedTheme === theme.id 
                                            ? 'bg-white/10 border-brand-yellow text-slate-900 dark:text-white shadow-lg shadow-brand-yellow/5' 
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

                    {/* Drag and Drop Sections list */}
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-slate-600 dark:text-gray-400">Order Sections (Drag to Reorder)</label>
                            <span className="text-[9px] text-brand-yellow bg-brand-yellow/10 px-1.5 py-0.5 rounded uppercase font-mono">DND Builder</span>
                        </div>
                        <div className="space-y-1.5">
                            {sections.map((section, idx) => (
                                <div
                                    key={section.id}
                                    draggable
                                    onDragStart={() => handleSectionDragStart(idx)}
                                    onDragOver={(e) => handleSectionDragOver(e, idx)}
                                    onDragEnd={handleSectionDragEnd}
                                    className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-150 select-none cursor-grab active:cursor-grabbing ${
                                        draggedSectionIndex === idx 
                                            ? 'bg-brand-yellow/25 border-brand-yellow opacity-50 scale-95' 
                                            : 'bg-slate-200/50 dark:bg-black/30 hover:bg-slate-200/80 dark:bg-black/50 border-slate-200 dark:border-white/5'
                                    } ${section.visible ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-500 opacity-40'}`}
                                >
                                    <div className="flex items-center gap-2.5 flex-grow">
                                        {/* Grip icon */}
                                        <div className="text-slate-500 dark:text-gray-500 group-hover:text-slate-900 dark:text-white transition-colors cursor-grab">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs shrink-0">{section.icon}</span>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold leading-none">{section.name}</span>
                                            <span className="text-[9px] text-slate-500 dark:text-gray-500 mt-0.5 leading-none">{section.description}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Visibility toggle */}
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id); }}
                                        className={`p-1 rounded-lg transition-colors shrink-0 cursor-pointer ${section.visible ? 'text-slate-600 dark:text-gray-400 hover:text-brand-yellow hover:bg-slate-100 dark:hover:bg-white/5' : 'text-gray-600 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                        title={section.visible ? 'Hide section' : 'Show section'}
                                    >
                                        {section.visible ? (
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 012.42-3.832m5.011-2.93a9.985 9.985 0 015.586 1.748L18.81 3.81m-5.414 5.414L10 12m-2-2l-1.586 1.586A2 2 0 1010 10z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-yellow"></span>
                        About You
                    </h3>
                    <input type="text" placeholder="Full Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-brand-yellow" />
                    <input type="text" placeholder="Job Title (e.g. UX Designer)" value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-brand-yellow" />
                    <textarea placeholder="Short Bio" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-brand-yellow h-24 resize-none" />
                    
                    {/* Hero Image Input */}
                    <div className="flex gap-2 items-center">
                        <input type="text" placeholder="Hero Image URL (Optional)" value={profile.heroImage} onChange={e => setProfile({...profile, heroImage: e.target.value})} className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-brand-yellow" />
                        <label className="cursor-pointer p-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg transition-colors text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white flex items-center justify-center h-[42px] w-[42px]" title="Upload Hero Image">
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
                    <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                        Contact & Skills
                    </h3>
                    <input type="text" placeholder="Email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-brand-yellow" />
                    <input type="text" placeholder="GitHub URL" value={profile.github} onChange={e => setProfile({...profile, github: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-brand-yellow" />
                    <input type="text" placeholder="LinkedIn URL" value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-brand-yellow" />
                    <textarea placeholder="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-brand-yellow h-20 resize-none" />
                </div>

                <div className="space-y-4 border-t border-slate-200 dark:border-white/5 pt-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                            Projects Showcase
                        </h3>
                        <span className="text-[9px] text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded uppercase font-mono">Drag to Order</span>
                    </div>
                    {projects.map((p, idx) => (
                        <div 
                            key={p.id}
                            draggable
                            onDragStart={() => handleProjectDragStart(idx)}
                            onDragOver={(e) => handleProjectDragOver(e, idx)}
                            onDragEnd={handleProjectDragEnd}
                            className={`bg-slate-200/30 dark:bg-black/20 rounded-lg p-3 border border-slate-200 dark:border-white/5 space-y-3 relative group transition-all duration-150 cursor-grab active:cursor-grabbing ${
                                draggedProjectIndex === idx 
                                    ? 'bg-brand-yellow/10 border-brand-yellow opacity-50 scale-95' 
                                    : 'hover:border-white/15'
                            }`}
                        >
                             <div className="flex items-center gap-2">
                                  <div className="text-slate-500 dark:text-gray-500 cursor-grab hover:text-slate-900 dark:text-white transition-colors">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                                      </svg>
                                  </div>
                                  <input type="text" placeholder="Project Title" value={p.title} onChange={e => handleUpdateProject(p.id, 'title', e.target.value)} className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 px-2 py-1 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-brand-yellow" />
                             </div>
                             <textarea placeholder="Description" value={p.description} onChange={e => handleUpdateProject(p.id, 'description', e.target.value)} className="w-full bg-transparent px-2 py-1 text-sm text-gray-300 outline-none resize-none h-16" />
                             <input type="text" placeholder="Project Link" value={p.link} onChange={e => handleUpdateProject(p.id, 'link', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs text-slate-900 dark:text-white outline-none" />
                             
                             {/* Project Image Upload */}
                             <div className="flex gap-2 items-center">
                                 <input 
                                    type="text" 
                                    placeholder="Image URL" 
                                    value={p.imageUrl} 
                                    onChange={e => handleUpdateProject(p.id, 'imageUrl', e.target.value)} 
                                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs text-slate-900 dark:text-white outline-none" 
                                 />
                                 <label className="cursor-pointer p-1.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded transition-colors text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white flex items-center justify-center" title="Upload Project Image">
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
                    <button onClick={handleAddProject} className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-slate-600 dark:text-gray-400 text-sm hover:text-slate-900 dark:text-white hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
                         + Add Project
                    </button>
                </div>

            </div>

            {/* Right Panel: Preview */}
            <div className="flex-1 bg-white dark:bg-[#1a1a1a] p-0 overflow-hidden relative flex flex-col">
                {generatedCode && (
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 border-b border-slate-200 dark:border-white/5 flex items-center justify-between z-10 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                            <span className="text-xs font-mono text-slate-600 dark:text-gray-400">Live Responsive Simulator</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-black/40 p-1 rounded-lg border border-slate-200 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setPreviewMode('desktop')}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${previewMode === 'desktop' ? 'bg-brand-yellow text-black shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                            >
                                🖥️ Desktop
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewMode('tablet')}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${previewMode === 'tablet' ? 'bg-brand-yellow text-black shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                            >
                                📟 Tablet
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewMode('phone')}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${previewMode === 'phone' ? 'bg-brand-yellow text-black shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                            >
                                📱 Phone
                            </button>
                        </div>
                        <div className="w-20 hidden md:block"></div> {/* Spacer for balancing */}
                    </div>
                )}
                
                {generatedCode ? (
                    <div className="flex-1 overflow-auto p-4 md:p-6 flex justify-center items-center custom-scrollbar bg-[#111111]">
                        <div className={`transition-all duration-300 ease-in-out border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden bg-white ${
                            previewMode === 'phone' 
                                ? 'w-[375px] h-[780px] max-w-full max-h-[90%] rounded-3xl border-[12px] border-neutral-800' 
                                : previewMode === 'tablet' 
                                    ? 'w-[768px] h-[950px] max-w-full max-h-[95%] rounded-2xl border-[10px] border-neutral-800' 
                                    : 'w-full h-full'
                        }`}>
                            <iframe 
                                title="Preview"
                                srcDoc={generatedCode}
                                className="w-full h-full border-none bg-white"
                                sandbox="allow-scripts"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-gray-500 opacity-60">
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
