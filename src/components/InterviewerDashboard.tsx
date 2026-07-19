import React, { useEffect, useState } from 'react';
import { supabase } from '../services/firebaseClient';
import type { Invite, LevelKey, PersonaKey, InterviewReport, SuggestedResource, TranscriptionEntry, FeedbackEntry, InterviewConfig } from '../types';
import { personas } from '../types';
import EndScreen from './EndScreen';
import ReactMarkdown from 'react-markdown';

interface InterviewerDashboardProps {
  onBack: () => void;
  userId: string;
}

// Extends Invite to include candidate progress
interface ExtendedInvite extends Invite {
    interviewData?: {
        id: string;
        created_at: string;
        report: InterviewReport;
        resources: SuggestedResource[];
        transcription: TranscriptionEntry[];
        feedback: FeedbackEntry[];
        config: InterviewConfig;
        confidence_trend?: { time: string; confidence: number }[];
    } | null;
}

const InterviewerDashboard: React.FC<InterviewerDashboardProps> = ({ onBack, userId }) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'jobs'>('candidates');

  // Candidate/Invite States
  const [invites, setInvites] = useState<ExtendedInvite[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedReportInvite, setSelectedReportInvite] = useState<ExtendedInvite | null>(null);

  // Candidate Interview Configuration State
  const [customRole, setCustomRole] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>('junior');
  const [selectedPersona, setSelectedPersona] = useState<PersonaKey>('friendly');
  const [customTechStack, setCustomTechStack] = useState<string>('');
  const [jobDescriptionForInvite, setJobDescriptionForInvite] = useState<string>('');

  // --- JOB BOARD MANAGEMENT STATES ---
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Form Fields State
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobLocation, setJobLocation] = useState('Remote');
  const [jobSalary, setJobSalary] = useState('');
  const [jobExperienceLevel, setJobExperienceLevel] = useState('Mid-Senior level');
  const [jobType, setJobType] = useState('Full-time');
  const [jobUrl, setJobUrl] = useState('');
  const [jobKeyRequirements, setJobKeyRequirements] = useState('');
  const [jobTone, setJobTone] = useState('Startup/Friendly');
  const [jobPersonalization, setJobPersonalization] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  const fetchInvites = async () => {
      if (!supabase) return;
      setLoading(true);
      
      // 1. Fetch Invites
      const { data: invitesData, error } = await supabase
        .from('invites')
        .select('*')
        .eq('interviewer_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
          console.error("Error fetching invites", error);
          setLoading(false);
          return;
      }

      // 2. Fetch Interview Data for accepted invites
      const acceptedCandidateIds = invitesData
        .filter((inv: any) => inv.status === 'accepted' && inv.candidate_id)
        .map((inv: any) => inv.candidate_id);

      let interviewsMap: Record<string, any> = {};

      if (acceptedCandidateIds.length > 0) {
          const { data: interviewData } = await supabase
            .from('interviews')
            .select('*')
            .in('user_id', acceptedCandidateIds)
            .order('created_at', { ascending: false }); // Get latest first
          
          if (interviewData) {
              // Map latest interview to candidate_id
              interviewData.forEach((intrv: any) => {
                  if (!interviewsMap[intrv.user_id]) {
                      interviewsMap[intrv.user_id] = intrv;
                  }
              });
          }
      }

      // 3. Merge Data
      const mergedInvites = invitesData.map((inv: any) => ({
          ...inv,
          interviewData: inv.candidate_id ? interviewsMap[inv.candidate_id] : null
      }));

      setInvites(mergedInvites);
      setLoading(false);
  };

  const fetchJobOffers = async () => {
    if (!supabase) return;
    setLoadingJobs(true);
    try {
      const { data, error } = await supabase
        .from('job_offers')
        .select('*')
        .eq('recruiter_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setJobOffers(data);
      }
    } catch (err) {
      console.error("Error fetching job offers:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobOffers();
    }
  }, [activeTab]);

  const handleCreateInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newEmail || !supabase) return;
      
      if (invites.length >= 25) {
          alert("Invitation Limit Reached: You are limited to 25 invitation links. Please remove existing candidates or unused links to create new ones.");
          return;
      }

      setCreating(true);

      // Build Config dynamically
      const levelNames = {
         'junior': 'Junior',
         'mid-level': 'Mid-Level',
         'senior': 'Senior'
      };
      
      let systemInstruction = `You are an expert AI recruiter conducting an interview. The candidate is interviewing for a ${levelNames[selectedLevel]} level position.`;
      
      if (customRole.trim()) {
         systemInstruction += `\nThe primary roles/domains for this position are: ${customRole.trim()}. Focus the interview heavily on assessing these areas.`;
      }

      if (customTechStack.trim()) {
         systemInstruction += `\nThe required technical stack includes: ${customTechStack.trim()}. Please test their knowledge on these specific technologies.`;
      }

      if (jobDescriptionForInvite) {
         systemInstruction += `\n\nHere is the job description for the role:\n"${jobDescriptionForInvite}"\nUse this description to tailor your questions specifically to the responsibilities and requirements mentioned.`;
      }

      const personaModifier = personas[selectedPersona].modifier;
      systemInstruction = `${systemInstruction} In terms of your personality as an interviewer, please adhere to the following: ${personaModifier}`;
      
      systemInstruction += `\n\n[CRITICAL INSTRUCTIONS]: Keep all questions and responses extremely concise to optimize token usage. Do NOT give long preambles. Additionally, to ensure diversity across interviews, do NOT use standard, textbook questions. Start with a uniquely generated, non-obvious question based on the candidate's skills or a hypothetical scenario. (Random Seed for variation: ${Math.random()}).`;

      let interviewTitle = `${customRole.trim() ? customRole.trim() + ' ' : 'General '}Interview`;
      let desc = '';
      if (jobDescriptionForInvite) desc = 'Custom Job Description Interview';
      else if (customRole.trim()) desc = `Assessment for ${customRole.trim()}` + (customTechStack.trim() ? ` covering ${customTechStack.trim()}` : '');
      else desc = 'General Assessment';

      const finalConfig = {
          name: `${interviewTitle} (${personas[selectedPersona].name})`,
          description: desc,
          systemInstruction,
          persona: selectedPersona
      };
      
      const inviteToken = crypto.randomUUID();

      const { data, error } = await supabase.from('invites').insert({
          interviewer_id: userId,
          email: newEmail,
          token: inviteToken,
          config: finalConfig,
      }).select();

      if (error) {
          alert("Failed to invite: " + error.message);
      } else if (data && data[0]) {
          setNewEmail('');
          setCustomRole('');
          setCustomTechStack('');
          setJobDescriptionForInvite('');
          fetchInvites();
      }
      setCreating(false);
  };

  const handleDeleteInvite = async (inviteId: string, status: string) => {
      if (!supabase) return;
      
      const confirmMessage = status === 'pending' 
        ? "Revoke Invitation: This link will become invalid immediately. Are you sure?" 
        : "Remove Candidate: This will permanently remove the candidate and their interview report. Are you sure?";

      if (!window.confirm(confirmMessage)) return;

      setDeletingId(inviteId);
      const { error } = await supabase.from('invites').delete().eq('id', inviteId);
      
      if (error) {
          console.error("Error deleting invite:", error);
          alert("Failed to remove: " + error.message);
      } else {
          setInvites(prev => prev.filter(i => i.id !== inviteId));
      }
      setDeletingId(null);
  };

  const getInviteLink = (token: string) => {
      const baseUrl = window.location.origin + window.location.pathname;
      const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      return `${cleanBase}/#invite=${token}`;
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Invite link copied!");
  };

  // --- JOB OFFERS ACTIONS ---
  const handleGenerateDescription = async () => {
    if (!jobTitle || !jobCompany) {
      alert("Please provide at least a Job Title and Company Name to generate a description.");
      return;
    }
    setGeneratingDescription(true);
    try {
      const res = await fetch('/api/recruiter/generate-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobTitle,
          company: jobCompany,
          location: jobLocation,
          experienceLevel: jobExperienceLevel,
          jobType: jobType,
          salary: jobSalary,
          keyRequirements: jobKeyRequirements,
          tone: jobTone,
          personalization: jobPersonalization
        })
      });
      if (!res.ok) throw new Error("Failed to generate description");
      const data = await res.json();
      if (data.description) {
        setJobDescription(data.description);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error generating job description: " + err.message);
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleSaveJobOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobCompany || !jobLocation || !jobDescription) {
      alert("Please fill in Job Title, Company, Location, and Description.");
      return;
    }
    setSavingJob(true);
    try {
      const jobData = {
        recruiter_id: userId,
        title: jobTitle,
        company: jobCompany,
        location: jobLocation,
        description: jobDescription,
        salary: jobSalary || '',
        experienceLevel: jobExperienceLevel,
        jobType: jobType,
        url: jobUrl || '',
      };

      if (editingJobId) {
        // Update existing job offer
        const { error } = await supabase
          .from('job_offers')
          .update(jobData)
          .eq('id', editingJobId);

        if (error) throw error;
        alert("Job offer updated successfully!");
      } else {
        // Create new job offer
        const { error } = await supabase
          .from('job_offers')
          .insert(jobData);

        if (error) throw error;
        alert("Job offer posted successfully!");
      }

      // Reset form states
      resetJobForm();
      fetchJobOffers();
    } catch (err: any) {
      console.error(err);
      alert("Failed to save job offer: " + err.message);
    } finally {
      setSavingJob(false);
    }
  };

  const resetJobForm = () => {
    setEditingJobId(null);
    setJobTitle('');
    setJobCompany('');
    setJobLocation('Remote');
    setJobSalary('');
    setJobExperienceLevel('Mid-Senior level');
    setJobType('Full-time');
    setJobUrl('');
    setJobKeyRequirements('');
    setJobTone('Startup/Friendly');
    setJobPersonalization('');
    setJobDescription('');
    setShowJobForm(false);
  };

  const handleEditJobOffer = (offer: any) => {
    setEditingJobId(offer.id);
    setJobTitle(offer.title);
    setJobCompany(offer.company);
    setJobLocation(offer.location || 'Remote');
    setJobSalary(offer.salary || '');
    setJobExperienceLevel(offer.experienceLevel || 'Mid-Senior level');
    setJobType(offer.jobType || 'Full-time');
    setJobUrl(offer.url || '');
    setJobDescription(offer.description || '');
    setJobKeyRequirements('');
    setJobTone('Startup/Friendly');
    setJobPersonalization('');
    setShowJobForm(true);
  };

  const handleDeleteJobOffer = async (offerId: string) => {
    if (!window.confirm("Are you sure you want to delete this job offer? It will be removed from the public board immediately.")) return;
    try {
      const { error } = await supabase
        .from('job_offers')
        .delete()
        .eq('id', offerId);

      if (error) throw error;
      fetchJobOffers();
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete job offer: " + err.message);
    }
  };

  // If viewing a report, render EndScreen
  if (selectedReportInvite && selectedReportInvite.interviewData) {
      return (
          <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
              <button onClick={() => setSelectedReportInvite(null)} className="flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white transition-colors font-medium mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                Back to Candidate List
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-brand-purple flex items-center justify-center text-xl font-bold text-white">
                      {selectedReportInvite.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedReportInvite.email}</h2>
                      <p className="text-slate-600 dark:text-gray-400">Interview Role: <span className="text-brand-purple">{selectedReportInvite.interviewData.config.name}</span></p>
                  </div>
              </div>

              <EndScreen
                onRestart={() => setSelectedReportInvite(null)} // Acts as close
                transcription={selectedReportInvite.interviewData.transcription}
                feedback={selectedReportInvite.interviewData.feedback}
                config={selectedReportInvite.interviewData.config}
                userEmail={selectedReportInvite.email}
                userId={selectedReportInvite.candidate_id || ''}
                existingReport={selectedReportInvite.interviewData.report}
                existingResources={selectedReportInvite.interviewData.resources}
                isHistoryView={true}
                confidenceTrend={selectedReportInvite.interviewData.confidence_trend}
              />
          </div>
      );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Interviewer Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
              <div className="text-right">
                  <span className="text-xs text-slate-600 dark:text-gray-400 uppercase tracking-wider block">Plan Level</span>
                  <span className="text-sm font-bold text-brand-purple">
                      Recruiter Account
                  </span>
              </div>
              <div className="px-3 py-1 bg-brand-purple/20 border border-brand-purple/50 rounded-full text-brand-purple text-xs font-bold uppercase tracking-wider">
                  Active
              </div>
          </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-white/10 gap-6">
        <button 
          onClick={() => { setActiveTab('candidates'); resetJobForm(); }}
          className={`pb-4 text-base font-bold transition-all relative ${activeTab === 'candidates' ? 'text-brand-purple' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white'}`}
        >
          Manage Candidates
          {activeTab === 'candidates' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-purple rounded-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`pb-4 text-base font-bold transition-all relative ${activeTab === 'jobs' ? 'text-brand-purple' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white'}`}
        >
          My Job Offers (AI Personalized)
          {activeTab === 'jobs' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-purple rounded-full"></span>}
        </button>
      </div>

      {activeTab === 'candidates' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Invite Form */}
            <div className="glass-panel p-6 rounded-xl h-fit">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
                    Assign Interview
                </h3>
                <form onSubmit={handleCreateInvite} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1">Candidate Email</label>
                        <input 
                          type="email" 
                          required 
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          disabled={invites.length >= 25}
                          className="w-full bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-purple outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="candidate@example.com"
                        />
                    </div>

                    {/* Config Selectors */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Job Description (Optional)</label>
                            <textarea 
                              value={jobDescriptionForInvite}
                              onChange={(e) => setJobDescriptionForInvite(e.target.value)}
                              rows={3}
                              className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:border-brand-purple outline-none resize-none placeholder-slate-400 dark:placeholder-gray-600"
                              placeholder="Paste a job description here to tailor the interview questions..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Role / Domain (Custom)</label>
                            <input 
                              type="text"
                              value={customRole}
                              onChange={(e) => setCustomRole(e.target.value)}
                              className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:border-brand-purple outline-none placeholder-slate-400 dark:placeholder-gray-600"
                              placeholder="e.g. Frontend Engineer, Product Manager, Data Scientist..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Tech Stack / Key Skills (Custom)</label>
                            <input 
                              type="text"
                              value={customTechStack}
                              onChange={(e) => setCustomTechStack(e.target.value)}
                              className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:border-brand-purple outline-none placeholder-slate-400 dark:placeholder-gray-600"
                              placeholder="e.g. React, Python, Figma, SQL..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Difficulty Level</label>
                                <select 
                                  value={selectedLevel} 
                                  onChange={(e) => setSelectedLevel(e.target.value as LevelKey)}
                                  className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:border-brand-purple outline-none cursor-pointer"
                                >
                                    <option value="junior" className="bg-slate-100 dark:bg-slate-900">Junior</option>
                                    <option value="mid-level" className="bg-slate-100 dark:bg-slate-900">Mid-Level</option>
                                    <option value="senior" className="bg-slate-100 dark:bg-slate-900">Senior</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">AI Persona</label>
                                <select 
                                  value={selectedPersona} 
                                  onChange={(e) => setSelectedPersona(e.target.value as PersonaKey)}
                                  className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:border-brand-purple outline-none cursor-pointer"
                                >
                                    {Object.keys(personas).map(key => (
                                        <option key={key} value={key} className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">{personas[key as PersonaKey].name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={creating || invites.length >= 25}
                      className={`w-full font-bold py-3 rounded-lg transition-all shadow-lg mt-4 
                          ${invites.length >= 25 
                              ? 'bg-gray-700 text-slate-600 dark:text-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-brand-purple to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white hover:shadow-brand-purple/20'}`}
                    >
                        {creating ? 'Creating...' : (invites.length >= 25 ? 'Limit Reached (25/25)' : 'Generate Invite Link')}
                    </button>
                </form>
            </div>

            {/* Invites List */}
            <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-200/30 dark:bg-black/20 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Manage Candidates</h3>
                    <span className="text-xs bg-brand-purple/20 border border-brand-purple/30 text-brand-purple px-2.5 py-1 rounded-full font-bold">
                      {invites.length} / 25 Candidates
                    </span>
                </div>
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                     <table className="w-full text-sm text-left text-slate-600 dark:text-gray-400">
                        <thead className="text-xs text-slate-500 dark:text-gray-500 uppercase bg-slate-200/70 dark:bg-black/40 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Candidate</th>
                                <th className="px-6 py-3">Assigned Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invites.map((invite) => {
                                const link = getInviteLink(invite.token);
                                const isDeleting = deletingId === invite.id;
                                return (
                                  <tr key={invite.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-white/5 transition-colors">
                                      <td className="px-6 py-4">
                                          <div className="font-medium text-slate-900 dark:text-white">{invite.email}</div>
                                          <div className="text-xs text-slate-500 dark:text-gray-500">{new Date(invite.created_at).toLocaleDateString()}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">
                                              {invite.config ? invite.config.name : 'Not Configured'}
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${invite.status === 'accepted' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                              {invite.status}
                                          </span>
                                          {invite.interviewData && (
                                              <span className="ml-2 px-2 py-0.5 rounded text-xs uppercase font-bold bg-blue-500/10 text-blue-500">
                                                  Completed
                                              </span>
                                          )}
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                              {invite.interviewData ? (
                                                  <button
                                                      onClick={() => setSelectedReportInvite(invite)}
                                                      className="bg-brand-green/20 hover:bg-brand-green/30 border border-brand-green/30 text-brand-green px-3 py-1.5 rounded text-xs font-bold transition-colors"
                                                  >
                                                      View Report
                                                  </button>
                                              ) : (
                                                  <button 
                                                      onClick={() => copyToClipboard(link)}
                                                      className="bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/30 text-brand-purple px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-colors"
                                                  >
                                                      Copy Link
                                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                  </button>
                                              )}
                                              
                                              <button 
                                                  onClick={() => handleDeleteInvite(invite.id, invite.status)}
                                                  disabled={isDeleting}
                                                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
                                                      invite.status === 'pending' 
                                                      ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20' 
                                                      : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:text-white hover:bg-white/10'
                                                  } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                  title={invite.status === 'pending' ? "Revoke Link" : "Remove Candidate"}
                                              >
                                                  {isDeleting ? (
                                                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                                  ) : (
                                                      invite.status === 'pending' ? (
                                                          <>
                                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                              Revoke
                                                          </>
                                                      ) : (
                                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                          </svg>
                                                      )
                                                  )}
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                                );
                            })}
                            {invites.length === 0 && !loading && (
                                <tr><td colSpan={4} className="px-6 py-12 text-center italic text-slate-500 dark:text-gray-500">No candidates invited yet.</td></tr>
                            )}
                        </tbody>
                     </table>
                </div>
            </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Job Postings Tab Content */}
          {showJobForm ? (
            /* AI PERSONALIZED JOB CREATION FORM */
            <div className="glass-panel p-8 rounded-2xl border border-slate-200 dark:border-white/10 space-y-6 animate-scale-in">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="p-2 bg-brand-purple/20 rounded-xl text-brand-purple">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  {editingJobId ? "Edit Job Offer" : "Post Personalized Job Offer"}
                </h3>
                <button 
                  onClick={resetJobForm}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-white/10 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveJobOffer} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Job Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">Job Title *</label>
                    <input 
                      type="text"
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">Company Name *</label>
                    <input 
                      type="text"
                      required
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                      placeholder="e.g. Acme Tech Corp"
                      className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">Location *</label>
                    <input 
                      type="text"
                      required
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="e.g. Remote / New York, NY"
                      className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>

                  {/* Salary range */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">Salary details (Optional)</label>
                    <input 
                      type="text"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      placeholder="e.g. $130,000 - $160,000"
                      className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">Experience Level</label>
                    <select 
                      value={jobExperienceLevel}
                      onChange={(e) => setJobExperienceLevel(e.target.value)}
                      className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-purple cursor-pointer"
                    >
                      <option value="Internship" className="bg-slate-100 dark:bg-slate-900">Internship</option>
                      <option value="Entry level" className="bg-slate-100 dark:bg-slate-900">Entry level</option>
                      <option value="Associate" className="bg-slate-100 dark:bg-slate-900">Associate</option>
                      <option value="Mid-Senior level" className="bg-slate-100 dark:bg-slate-900">Mid-Senior level</option>
                      <option value="Director" className="bg-slate-100 dark:bg-slate-900">Director</option>
                      <option value="Executive" className="bg-slate-100 dark:bg-slate-900">Executive</option>
                    </select>
                  </div>

                  {/* Job Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">Job Type</label>
                    <select 
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-purple cursor-pointer"
                    >
                      <option value="Full-time" className="bg-slate-100 dark:bg-slate-900">Full-time</option>
                      <option value="Part-time" className="bg-slate-100 dark:bg-slate-900">Part-time</option>
                      <option value="Contract" className="bg-slate-100 dark:bg-slate-900">Contract</option>
                      <option value="Temporary" className="bg-slate-100 dark:bg-slate-900">Temporary</option>
                      <option value="Internship" className="bg-slate-100 dark:bg-slate-900">Internship</option>
                    </select>
                  </div>

                  {/* Application URL */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">Application Link / External URL (Optional)</label>
                    <input 
                      type="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="https://careers.company.com/jobs/apply"
                      className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
                </div>

                {/* AI Assistant Section */}
                <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-2xl p-6 space-y-4">
                  <h4 className="text-brand-purple font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    AI Personalized Description Generator
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400">
                    Provide your requirements, culture highlights, and tone of voice. PrepareAI's custom copywriter will generate a perfect, high-conversion job description.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Key Requirements / Tech Stack</label>
                      <textarea 
                        rows={2}
                        value={jobKeyRequirements}
                        onChange={(e) => setJobKeyRequirements(e.target.value)}
                        placeholder="e.g. React, TypeScript, Tailwind, REST APIs, 3+ years experience"
                        className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-purple"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Custom Personalization & Culture Highlights</label>
                      <textarea 
                        rows={2}
                        value={jobPersonalization}
                        onChange={(e) => setJobPersonalization(e.target.value)}
                        placeholder="e.g. Friendly startup culture, unlimited PTO, weekly board game nights, flexible hybrid setup"
                        className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-purple"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Target Tone of Voice</label>
                      <select
                        value={jobTone}
                        onChange={(e) => setJobTone(e.target.value)}
                        className="w-full bg-slate-200/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-purple cursor-pointer"
                      >
                        <option value="Startup/Friendly" className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">Startup / Friendly & Energetic</option>
                        <option value="Professional/Formal" className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">Professional / Structured & Formal</option>
                        <option value="Warm/Collaborative" className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">Warm / People-First & Collaborative</option>
                        <option value="Technical/Geeky" className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">Technical / Hardcore Engineering-Focused</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={generatingDescription}
                    onClick={handleGenerateDescription}
                    className="mt-4 px-5 py-2.5 bg-brand-purple text-white font-bold rounded-xl hover:bg-purple-600 transition-colors text-sm flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {generatingDescription ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        AI Copywriter is writing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Personalize & Generate Description with AI
                      </>
                    )}
                  </button>
                </div>

                {/* Main Job Description Editor & Live Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Markdown Editor */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">Job Description (Markdown Format) *</label>
                    <textarea 
                      required
                      rows={14}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Write your job description here. Or click 'Personalize & Generate' to have AI craft a structured draft for you!"
                      className="w-full bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-purple font-mono"
                    />
                  </div>

                  {/* Live Rich Render Preview */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">Live Description Preview (ATS-Optimized View)</label>
                    <div className="flex-grow bg-slate-200/30 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-6 overflow-y-auto max-h-[310px] md:max-h-[318px] lg:max-h-none text-sm text-gray-300 custom-scrollbar prose prose-invert">
                      {jobDescription ? (
                        <div className="markdown-body">
                          <ReactMarkdown>{jobDescription}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-slate-500 dark:text-gray-500 italic text-center pt-24">No description compiled yet. Type in Markdown above or generate with AI assistant.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={resetJobForm}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={savingJob}
                    className="px-8 py-3 bg-gradient-to-r from-brand-purple to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-purple/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingJob ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Publishing...
                      </>
                    ) : (
                      editingJobId ? "Save Changes" : "Publish Job Offer"
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* MY PUBLISHED JOBS LIST */
            <div className="glass-panel rounded-xl overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-200/30 dark:bg-black/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Positions</h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400">Manage your active listings visible to PrepareAI candidates</p>
                </div>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-purple to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-purple/20 flex items-center justify-center gap-2 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Post New Job
                </button>
              </div>

              <div className="flex-1 overflow-x-auto custom-scrollbar">
                {loadingJobs ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-purple"></div>
                  </div>
                ) : jobOffers.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 dark:text-gray-500 italic space-y-4">
                    <p className="text-lg font-light">You haven't posted any jobs yet.</p>
                    <p className="text-xs max-w-md mx-auto">Click "Post New Job" to generate and launch a high-impact description matching your candidate profile expectations.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left text-slate-600 dark:text-gray-400">
                    <thead className="text-xs text-slate-500 dark:text-gray-500 uppercase bg-slate-200/70 dark:bg-black/40 sticky top-0">
                      <tr>
                        <th className="px-6 py-3">Position</th>
                        <th className="px-6 py-3">Location</th>
                        <th className="px-6 py-3">Salary & Type</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobOffers.map((offer) => (
                        <tr key={offer.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white text-base">{offer.title}</div>
                            <div className="text-xs text-brand-purple font-medium">{offer.company}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-900 dark:text-white">{offer.location || 'Remote'}</div>
                            <div className="text-xs text-slate-500 dark:text-gray-500">{offer.experienceLevel || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-brand-green font-medium">{offer.salary || 'N/A'}</div>
                            <div className="text-xs text-slate-500 dark:text-gray-500">{offer.jobType || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => {
                                   setActiveTab('candidates');
                                   setJobDescriptionForInvite(`Title: ${offer.title}\nCompany: ${offer.company}\n\nRequirements:\n${offer.keyRequirements}\n\nDescription:\n${offer.description}`);
                                }}
                                className="bg-brand-purple/20 hover:bg-brand-purple/30 text-brand-purple border border-brand-purple/30 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                              >
                                Create Interview
                              </button>
                              <button
                                onClick={() => handleEditJobOffer(offer)}
                                className="bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteJobOffer(offer.id)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewerDashboard;
