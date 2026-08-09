
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/firebaseClient';
import { GoogleGenAI } from '@google/genai';
import type { InterviewConfig, TranscriptionEntry, FeedbackEntry, InterviewReport, SuggestedResource, SavedCV, SavedLetter, SavedPortfolio, SubscriptionTier, Session } from '../types';
import EndScreen from './EndScreen';

interface Profile {
  full_name: string;
  pronouns: string;
  avatar_url: string;
  is_admin?: boolean;
  subscription_tier?: SubscriptionTier;
  job_title?: string;
  bio?: string;
}

interface InterviewHistoryItem {
  id: string;
  created_at: string;
  config: InterviewConfig;
  transcription: TranscriptionEntry[];
  feedback: FeedbackEntry[];
  report: InterviewReport | null;
  resources: SuggestedResource[] | null;
}

interface ProfileScreenProps {
  session: Session;
  onBack: () => void;
  onEditCV: (cv: SavedCV) => void;
  onEditPortfolio: (p: SavedPortfolio) => void;
  onManagePlan: () => void;
}

type TabView = 'history' | 'cvs' | 'letters' | 'portfolios';

// Extended type to handle viewing/editing
interface DocViewerState {
  id: string;
  type: 'cv' | 'letter' | 'portfolio';
  content: string;
  title: string;
  originalData?: any; 
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ session, onBack, onEditCV, onEditPortfolio, onManagePlan }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({ full_name: '', pronouns: '', avatar_url: '', is_admin: false, subscription_tier: 'free', job_title: '', bio: '' });
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([]);
  const [savedPortfolios, setSavedPortfolios] = useState<SavedPortfolio[]>([]);
  
  const [selectedInterview, setSelectedInterview] = useState<InterviewHistoryItem | null>(null);
  
  // Document Viewing/Editing State
  const [viewingDoc, setViewingDoc] = useState<DocViewerState | null>(null);
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [activeTab, setActiveTab] = useState<TabView>('history');
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isImportingCV, setIsImportingCV] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!supabase || !session.user) {
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);

    try {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, pronouns, avatar_url, is_admin, subscription_tier, job_title, bio')
          .eq('id', session.user.id)
          .maybeSingle(); 
        
        if (error) {
            if (error.code === '42703') {
                console.warn("Database missing avatar_url or subscription_tier. Falling back to basic profile. Run the 'Fix Database' script in README.md.");
                const { data: basicData, error: basicError } = await supabase
                    .from('profiles')
                    .select('full_name, pronouns, job_title, bio')
                    .eq('id', session.user.id)
                    .maybeSingle();
                
                if (basicError) throw basicError;
                if (basicData) {
                    setProfile({ 
                        full_name: basicData.full_name || '', 
                        pronouns: basicData.pronouns || '',
                        job_title: basicData.job_title || '',
                        bio: basicData.bio || '',
                        avatar_url: '',
                        subscription_tier: 'free'
                    });
                }
            } else if (error.code === '42P17') {
                // Infinite recursion detected in DB policy
                console.error("Critical DB Error: Infinite recursion in 'profiles' policy. Run the fix SQL script.");
                setError("Database Config Error: Infinite recursion detected. Please run the FIX SQL script located in README.md");
                setLoading(false);
                return;
            } else {
                throw error;
            }
        } else if (data) {
             setProfile({ 
                full_name: data.full_name || '', 
                pronouns: data.pronouns || '',
                avatar_url: data.avatar_url || '',
                is_admin: data.is_admin || false,
                subscription_tier: data.subscription_tier as SubscriptionTier || 'free'
            });
        }
      } catch (profileErr) { 
          console.warn("Profile fetch warning:", profileErr); 
      }

      const { data: interviewData } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setInterviews(interviewData || []);

      const { data: cvData } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setSavedCVs(cvData || []);

      const { data: letterData } = await supabase
        .from('motivation_letters')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setSavedLetters(letterData || []);
      
      try {
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        if(!portfolioError) setSavedPortfolios(portfolioData || []);
      } catch (e) { console.warn("Portfolios table might not exist yet"); }

    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (!error) setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [session.user, error]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !session.user) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: profile.full_name,
        pronouns: profile.pronouns,
        job_title: profile.job_title,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setIsEditingProfile(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      if (err.code === '42703') {
          setError("Database Error: Missing 'avatar_url' column. Please run the migration script in README.md.");
      } else {
          setError(`Failed to update profile: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!supabase) return;
      setPasswordMessage(null);

      if (newPassword !== confirmPassword) {
          setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
          return;
      }
      if (newPassword.length < 6) {
          setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
          return;
      }

      try {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) throw error;
          setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => setIsChangingPassword(false), 2000);
      } catch (err: any) {
          setPasswordMessage({ type: 'error', text: err.message });
      }
  };

  
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!process.env.API_KEY) {
          alert("API Key missing");
          return;
      }
      setIsImportingCV(true);
      
      const reader = new FileReader();
      const processContent = async (contentPart: any) => {
          try {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const prompt = `
                Act as an expert Profile Extractor. 
                Extract the following details from this CV/Resume:
                - fullName
                - pronouns (if any, otherwise empty string)
                - job_title (current or most recent role)
                - bio (a short professional summary, 1-2 sentences)

                Return a JSON object:
                {
                  "fullName": "string",
                  "pronouns": "string",
                  "job_title": "string",
                  "bio": "string"
                }
              `;
              const response = await ai.models.generateContent({
                  model: 'gemini-3.1-pro-preview',
                  contents: [contentPart, { text: prompt }],
                  config: { responseMimeType: 'application/json' }
              });
              const data = JSON.parse(response.text || '{}');
              setProfile(prev => ({
                  ...prev,
                  full_name: data.fullName || prev.full_name,
                  pronouns: data.pronouns || prev.pronouns,
                  job_title: data.job_title || prev.job_title,
                  bio: data.bio || prev.bio
              }));
          } catch (error) {
              console.error("Failed to parse CV", error);
              alert("Failed to auto-fill from CV.");
          } finally {
              setIsImportingCV(false);
          }
      };

      if (file.type === "application/pdf") {
          reader.onload = (event) => {
              const base64String = event.target?.result;
              const rawBase64 = typeof base64String === 'string' ? base64String.split(',')[1] : '';
              processContent({ inlineData: { mimeType: 'application/pdf', data: rawBase64 } });
          };
          reader.readAsDataURL(file);
      } else {
          reader.onload = (event) => {
              const text = event.target?.result;
              processContent({ text: text });
          };
          reader.readAsText(file);
      }
  };


  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !supabase) return;
    setUploadingAvatar(true);
    try {
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
        
        const { error: updateError } = await supabase.from('profiles').upsert({
            id: session.user.id,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
        });

        if (updateError) throw updateError;

    } catch (error: any) {
        if (error.message && (error.message.includes("Bucket not found") || error.statusCode === '404')) {
            alert("Configuration Error: The 'avatars' storage bucket does not exist. Please run the STORAGE SETUP SQL script found in README.md.");
        } else if (error.code === '42703' || (error.message && error.message.includes('avatar_url'))) {
            alert("Database Error: The 'avatar_url' column is missing. Please run the 'Fix Database Schema' script in README.md.");
        } else {
            alert('Error uploading avatar: ' + error.message);
        }
    } finally {
        setUploadingAvatar(false);
    }
  };

  // --- Document Management Functions ---

  const handleOpenDoc = (doc: DocViewerState) => {
      setViewingDoc(doc);
      setEditTitle(doc.title);
      setEditContent(doc.content);
      setIsEditingDoc(false);
  };

  const handleCloseDoc = () => {
      setViewingDoc(null);
      setIsEditingDoc(false);
  };

  const handleDownloadDoc = () => {
      if (!viewingDoc) return;
      
      if (viewingDoc.type === 'cv' || viewingDoc.type === 'portfolio') {
          // Download HTML via Print Window or Blob
          if (viewingDoc.type === 'portfolio') {
             const element = document.createElement("a");
             const file = new Blob([viewingDoc.content], {type: 'text/html'});
             element.href = URL.createObjectURL(file);
             element.download = `${viewingDoc.title.replace(/\s+/g, '_')}.html`;
             document.body.appendChild(element);
             element.click();
             document.body.removeChild(element);
             return;
          }
          
          const printWindow = window.open('', '', 'width=800,height=900');
          if (printWindow) {
              printWindow.document.write(`
                <html>
                  <head>
                    <title>${viewingDoc.title}</title>
                    <style>
                      body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; font-family: sans-serif; }
                      @page { size: A4; margin: 0; }
                      @media print {
                        body { -webkit-print-color-adjust: exact; }
                      }
                    </style>
                  </head>
                  <body>
                    ${viewingDoc.content}
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.focus();
              printWindow.print();
          }
      } else {
          // Download Letter as .txt
          const element = document.createElement("a");
          const file = new Blob([viewingDoc.content], {type: 'text/plain'});
          element.href = URL.createObjectURL(file);
          element.download = `${viewingDoc.title.replace(/\s+/g, '_')}.txt`;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
      }
  };

  const handleDeleteDoc = async () => {
      if (!viewingDoc || !supabase) return;
      if (!window.confirm("Are you sure you want to delete this document? This cannot be undone.")) return;

      try {
          let table = '';
          if (viewingDoc.type === 'cv') table = 'cvs';
          else if (viewingDoc.type === 'letter') table = 'motivation_letters';
          else if (viewingDoc.type === 'portfolio') table = 'portfolios';

          const { error } = await supabase.from(table).delete().eq('id', viewingDoc.id);
          
          if (error) throw error;

          // Update local state
          if (viewingDoc.type === 'cv') setSavedCVs(prev => prev.filter(cv => cv.id !== viewingDoc.id));
          else if (viewingDoc.type === 'letter') setSavedLetters(prev => prev.filter(letter => letter.id !== viewingDoc.id));
          else if (viewingDoc.type === 'portfolio') setSavedPortfolios(prev => prev.filter(p => p.id !== viewingDoc.id));
          
          handleCloseDoc();
      } catch (err: any) {
          alert("Error deleting document: " + err.message);
      }
  };

  const handleEditClick = () => {
    if (viewingDoc?.type === 'cv') {
        const fullCV = savedCVs.find(c => c.id === viewingDoc.id);
        if (fullCV) {
            onEditCV(fullCV);
            return;
        }
    } else if (viewingDoc?.type === 'portfolio') {
        const fullPort = savedPortfolios.find(p => p.id === viewingDoc.id);
        if (fullPort) {
            onEditPortfolio(fullPort);
            return;
        }
    }
    // For letters, or fallback, toggle in-place editor
    setIsEditingDoc(true);
  };

  const handleSaveDocUpdates = async () => {
      if (!viewingDoc || !supabase) return;
      setIsSavingDoc(true);

      try {
          let table = '';
          if (viewingDoc.type === 'cv') table = 'cvs';
          else if (viewingDoc.type === 'letter') table = 'motivation_letters';
          else if (viewingDoc.type === 'portfolio') table = 'portfolios';
          
          const updates = {
              title: editTitle,
              content: editContent,
          };

          const { error } = await supabase.from(table).update(updates).eq('id', viewingDoc.id);
          if (error) throw error;

          // Update local state list
          if (viewingDoc.type === 'cv') setSavedCVs(prev => prev.map(cv => cv.id === viewingDoc.id ? { ...cv, ...updates } : cv));
          else if (viewingDoc.type === 'letter') setSavedLetters(prev => prev.map(l => l.id === viewingDoc.id ? { ...l, ...updates } : l));
          else if (viewingDoc.type === 'portfolio') setSavedPortfolios(prev => prev.map(p => p.id === viewingDoc.id ? { ...p, ...updates } : p));

          // Update viewing doc state
          setViewingDoc(prev => prev ? { ...prev, title: editTitle, content: editContent } : null);
          setIsEditingDoc(false);

      } catch (err: any) {
          alert("Failed to update: " + err.message);
      } finally {
          setIsSavingDoc(false);
      }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render Interview Report View
  if (selectedInterview) {
    return (
      <div className="w-full mx-auto space-y-6">
        <button onClick={() => setSelectedInterview(null)} className="flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Dashboard
        </button>
        <EndScreen
          onRestart={() => setSelectedInterview(null)}
          transcription={selectedInterview.transcription || []}
          feedback={selectedInterview.feedback || []}
          config={selectedInterview.config}
          userEmail={session.user.email || ''}
          userId={session.user.id}
          existingReport={selectedInterview.report || undefined}
          existingResources={selectedInterview.resources || undefined}
          isHistoryView={true}
        />
      </div>
    );
  }

  // Render Saved Document Modal
  if (viewingDoc) {
      const isHtmlPreview = !isEditingDoc && (viewingDoc.type === 'cv' || viewingDoc.type === 'portfolio');
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white text-black w-full h-[85vh] max-h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                
                {/* Modal Header */}
                <div className="p-4 bg-gray-100 border-b flex justify-between items-center shrink-0">
                    <div className="flex-1 mr-4">
                        {isEditingDoc ? (
                            <input 
                                type="text" 
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue outline-none font-bold text-lg"
                                placeholder="Document Title"
                            />
                        ) : (
                            <h3 className="font-bold text-lg truncate">{viewingDoc.title}</h3>
                        )}
                    </div>
                    <button onClick={handleCloseDoc} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className={`flex-1 p-0 bg-gray-50 relative ${isHtmlPreview ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
                    {isEditingDoc ? (
                         (viewingDoc.type === 'cv' || viewingDoc.type === 'portfolio') ? (
                            <div className="h-full flex flex-col gap-2 p-4">
                                <label className="text-sm font-semibold text-slate-500 dark:text-gray-500">HTML Source Code (Edit cautiously)</label>
                                <textarea 
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="flex-1 w-full p-4 font-mono text-sm border rounded-lg bg-white focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                                />
                            </div>
                         ) : (
                            <textarea 
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-full p-6 font-serif text-lg leading-relaxed border rounded-lg bg-white focus:ring-2 focus:ring-brand-green outline-none resize-none"
                            />
                         )
                    ) : (
                        (viewingDoc.type === 'cv' || viewingDoc.type === 'portfolio') ? (
                            <iframe 
                                title="Preview"
                                srcDoc={viewingDoc.content}
                                className="w-full h-full border-none"
                                sandbox="allow-scripts"
                            />
                        ) : (
                            <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed max-w-3xl mx-auto bg-white p-8 shadow-sm">{viewingDoc.content}</div>
                        )
                    )}
                </div>

                {/* Modal Footer (Actions) */}
                <div className="p-4 bg-white border-t flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                         {!isEditingDoc && (
                             <button onClick={handleDeleteDoc} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors border border-transparent hover:border-red-100">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                 Delete
                             </button>
                         )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                         {isEditingDoc ? (
                             <>
                                <button 
                                    onClick={() => { setIsEditingDoc(false); setEditTitle(viewingDoc.title); setEditContent(viewingDoc.content); }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveDocUpdates}
                                    disabled={isSavingDoc}
                                    className={`px-6 py-2 rounded-lg font-bold text-white shadow-md transition-all ${viewingDoc.type === 'letter' ? 'bg-brand-green hover:bg-green-600' : 'bg-brand-blue hover:bg-blue-600'}`}
                                >
                                    {isSavingDoc ? 'Saving...' : 'Save Changes'}
                                </button>
                             </>
                         ) : (
                             <>
                                <button 
                                    onClick={handleDownloadDoc}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download
                                </button>
                                <button 
                                    onClick={handleEditClick}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white shadow-md transition-all ${viewingDoc.type === 'letter' ? 'bg-brand-green hover:bg-green-600' : 'bg-brand-blue hover:bg-blue-600'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Edit
                                </button>
                             </>
                         )}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="w-full mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Profile</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Card */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center h-fit">
              <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-5xl font-bold text-white shadow-xl mb-6 ring-4 ring-white/10 overflow-hidden">
                      {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                          <span>{profile.full_name ? profile.full_name.charAt(0).toUpperCase() : session.user.email?.charAt(0).toUpperCase()}</span>
                      )}
                  </div>
                  <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-xs font-bold text-white">{uploadingAvatar ? '...' : 'Change'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                  </label>
              </div>
              
              
              {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="w-full space-y-4 mb-4">
                      <div className="flex justify-between items-center bg-brand-blue/10 rounded-lg p-3 border border-brand-blue/20">
                          <span className="text-sm text-brand-blue font-medium">Auto-fill from CV</span>
                          <label className="cursor-pointer bg-brand-blue text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-600 transition-colors">
                              {isImportingCV ? 'Processing...' : 'Upload CV'}
                              <input type="file" accept=".pdf,.txt,.md" className="hidden" onChange={handleCVUpload} disabled={isImportingCV} />
                          </label>
                      </div>
                      
                      <input
                          type="text"
                          value={profile.full_name}
                          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                          className="w-full bg-slate-200/30 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                          placeholder="Full Name"
                      />
                      <input
                          type="text"
                          value={profile.pronouns}
                          onChange={(e) => setProfile({ ...profile, pronouns: e.target.value })}
                          className="w-full bg-slate-200/30 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                          placeholder="Pronouns (e.g., they/them)"
                      />
                      <input
                          type="text"
                          value={profile.job_title || ''}
                          onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                          className="w-full bg-slate-200/30 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none"
                          placeholder="Job Title (e.g., Software Engineer)"
                      />
                      <textarea
                          value={profile.bio || ''}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          className="w-full bg-slate-200/30 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none resize-none h-24 text-sm"
                          placeholder="Short Bio / Summary"
                      />
                      <div className="flex gap-2 justify-center pt-2">
                          <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-brand-blue rounded-lg text-sm font-bold text-white shadow-lg">Save</button>
                      </div>
                  </form>
              ) : (
                  
                  <>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{profile.full_name || 'Anonymous User'}</h3>
                    {profile.job_title && <p className="text-brand-blue font-medium text-sm mb-1">{profile.job_title}</p>}
                    <p className="text-slate-600 dark:text-gray-400 text-sm mb-3">{session.user.email}</p>
                    {profile.bio && <p className="text-sm text-slate-700 dark:text-gray-300 text-center mb-4 leading-relaxed">{profile.bio}</p>}
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-4">

                        {profile.pronouns && <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-xs text-gray-300 border border-slate-200 dark:border-white/10">{profile.pronouns}</span>}
                        
                        {profile.is_admin ? (
                            <div className="px-3 py-1 bg-brand-red/20 text-brand-red text-xs font-bold rounded-full border border-brand-red/30">
                                Unlimited Access
                            </div>
                        ) : (
                            <div className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-2 ${profile.subscription_tier === 'pro' ? 'bg-brand-purple/20 text-brand-purple border-brand-purple/30' : profile.subscription_tier === 'recruiter' ? 'bg-brand-green/20 text-brand-green border-brand-green/30' : 'bg-gray-700/50 text-slate-600 dark:text-gray-400 border-gray-600'}`}>
                                {profile.subscription_tier === 'pro' ? 'Pro Plan' : profile.subscription_tier === 'recruiter' ? 'Recruiter' : 'Free Plan'}
                                <button onClick={onManagePlan} className="hover:text-slate-900 dark:text-white underline text-[10px] ml-1">{profile.subscription_tier === 'free' ? 'Upgrade' : 'Manage'}</button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 w-full px-4">
                        <button onClick={() => setIsEditingProfile(true)} className="text-brand-blue hover:text-blue-600 dark:hover:text-blue-300 text-sm font-semibold transition-colors py-2 bg-brand-blue/10 rounded-lg">Edit Profile</button>
                        <button onClick={() => setIsChangingPassword(!isChangingPassword)} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white text-sm font-semibold transition-colors py-2 bg-slate-100 dark:bg-white/5 rounded-lg">Change Password</button>
                    </div>
                  </>
              )}

              {/* Password Change Form */}
              {isChangingPassword && !isEditingProfile && (
                  <form onSubmit={handlePasswordChange} className="w-full space-y-3 mt-4 pt-4 border-t border-slate-200 dark:border-white/10 animate-fade-in">
                      <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-200/30 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-blue outline-none text-sm"
                          placeholder="New Password"
                      />
                      <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-200/30 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-blue outline-none text-sm"
                          placeholder="Confirm Password"
                      />
                      {passwordMessage && (
                          <p className={`text-xs ${passwordMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{passwordMessage.text}</p>
                      )}
                      <div className="flex gap-2 justify-center">
                          <button type="button" onClick={() => setIsChangingPassword(false)} className="px-3 py-1.5 text-xs text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white">Cancel</button>
                          <button type="submit" className="px-3 py-1.5 bg-brand-blue rounded-lg text-xs font-bold text-white shadow-lg">Update</button>
                      </div>
                  </form>
              )}
          </div>

          {/* Tabs & Content */}
          <div className="md:col-span-2 space-y-6">
              <div className="flex gap-4 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto">
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`pb-2 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'history' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white'}`}
                  >
                      Session History
                  </button>
                  <button 
                    onClick={() => setActiveTab('cvs')}
                    className={`pb-2 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'cvs' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white'}`}
                  >
                      Saved CVs
                  </button>
                  <button 
                    onClick={() => setActiveTab('letters')}
                    className={`pb-2 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'letters' ? 'text-brand-green border-b-2 border-brand-green' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white'}`}
                  >
                      Motivation Letters
                  </button>
                  <button 
                    onClick={() => setActiveTab('portfolios')}
                    className={`pb-2 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'portfolios' ? 'text-brand-yellow border-b-2 border-brand-yellow' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white'}`}
                  >
                      Portfolios
                  </button>
              </div>

              {error && <p className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>}
              
              <div className="space-y-4 min-h-[300px]">
                  {/* HISTORY TAB */}
                  {activeTab === 'history' && (
                      interviews.length > 0 ? interviews.map((interview) => (
                          <div 
                            key={interview.id} 
                            onClick={() => setSelectedInterview(interview)}
                            className="glass-panel p-6 rounded-xl hover:bg-slate-100 dark:bg-white/5 transition-all cursor-pointer group border border-slate-200 dark:border-white/5 hover:border-brand-blue/30 relative overflow-hidden"
                          >
                              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-blue to-brand-purple opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="flex justify-between items-center">
                                  <div>
                                      <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-blue transition-colors mb-1">{interview.config?.name || 'Session'}</h4>
                                      <p className="text-sm text-slate-500 dark:text-gray-500">{new Date(interview.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                  </div>
                                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-blue/20 transition-colors">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-gray-400 group-hover:text-brand-blue" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                  </div>
                              </div>
                          </div>
                      )) : (
                          <div className="glass-panel p-10 rounded-xl text-center">
                              <p className="text-slate-600 dark:text-gray-400 mb-4">No sessions recorded yet.</p>
                              <button onClick={onBack} className="bg-white text-black font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors">Start Practice</button>
                          </div>
                      )
                  )}

                  {/* CVs TAB */}
                  {activeTab === 'cvs' && (
                      savedCVs.length > 0 ? savedCVs.map((cv) => (
                          <div 
                            key={cv.id} 
                            onClick={() => handleOpenDoc({ id: cv.id, type: 'cv', content: cv.content, title: cv.title, originalData: cv.data })}
                            className="glass-panel p-6 rounded-xl hover:bg-slate-100 dark:bg-white/5 transition-all cursor-pointer group border border-slate-200 dark:border-white/5 hover:border-brand-purple/30 relative overflow-hidden"
                          >
                              <div className="absolute inset-y-0 left-0 w-1 bg-brand-purple opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="flex justify-between items-center">
                                  <div>
                                      <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-purple transition-colors mb-1">{cv.title}</h4>
                                      <p className="text-sm text-slate-500 dark:text-gray-500">{new Date(cv.created_at).toLocaleDateString()}</p>
                                  </div>
                                  <button className="text-xs bg-slate-200 dark:bg-white/10 hover:bg-brand-purple/20 dark:hover:bg-brand-purple/50 px-3 py-1 rounded text-slate-900 dark:text-white transition-colors">View / Edit</button>
                              </div>
                          </div>
                      )) : (
                          <div className="glass-panel p-10 rounded-xl text-center">
                              <p className="text-slate-600 dark:text-gray-400">No saved resumes found.</p>
                          </div>
                      )
                  )}

                  {/* LETTERS TAB */}
                  {activeTab === 'letters' && (
                      savedLetters.length > 0 ? savedLetters.map((letter) => (
                          <div 
                            key={letter.id} 
                            onClick={() => handleOpenDoc({ id: letter.id, type: 'letter', content: letter.content, title: letter.company })}
                            className="glass-panel p-6 rounded-xl hover:bg-slate-100 dark:bg-white/5 transition-all cursor-pointer group border border-slate-200 dark:border-white/5 hover:border-brand-green/30 relative overflow-hidden"
                          >
                              <div className="absolute inset-y-0 left-0 w-1 bg-brand-green opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="flex justify-between items-center">
                                  <div>
                                      <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-green transition-colors mb-1">{letter.company}</h4>
                                      <p className="text-sm text-gray-300">{letter.job_title}</p>
                                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{new Date(letter.created_at).toLocaleDateString()}</p>
                                  </div>
                                  <button className="text-xs bg-slate-200 dark:bg-white/10 hover:bg-brand-green/20 dark:hover:bg-brand-green/50 px-3 py-1 rounded text-slate-900 dark:text-white transition-colors">View / Edit</button>
                              </div>
                          </div>
                      )) : (
                          <div className="glass-panel p-10 rounded-xl text-center">
                              <p className="text-slate-600 dark:text-gray-400">No saved cover letters found.</p>
                          </div>
                      )
                  )}
                  
                  {/* PORTFOLIOS TAB */}
                  {activeTab === 'portfolios' && (
                      savedPortfolios.length > 0 ? savedPortfolios.map((p) => (
                          <div 
                            key={p.id} 
                            onClick={() => handleOpenDoc({ id: p.id, type: 'portfolio', content: p.content, title: p.title, originalData: p.data })}
                            className="glass-panel p-6 rounded-xl hover:bg-slate-100 dark:bg-white/5 transition-all cursor-pointer group border border-slate-200 dark:border-white/5 hover:border-brand-yellow/30 relative overflow-hidden"
                          >
                              <div className="absolute inset-y-0 left-0 w-1 bg-brand-yellow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="flex justify-between items-center">
                                  <div>
                                      <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-yellow transition-colors mb-1">{p.title}</h4>
                                      <p className="text-sm text-slate-500 dark:text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p>
                                  </div>
                                  <button className="text-xs bg-slate-200 dark:bg-white/10 hover:bg-brand-yellow/20 dark:hover:bg-brand-yellow/50 px-3 py-1 rounded text-slate-900 dark:text-white transition-colors">View / Edit</button>
                              </div>
                          </div>
                      )) : (
                          <div className="glass-panel p-10 rounded-xl text-center">
                              <p className="text-slate-600 dark:text-gray-400">No saved portfolios found.</p>
                          </div>
                      )
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
