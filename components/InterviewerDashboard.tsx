
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Invite, DomainKey, LevelKey, PersonaKey, InterviewReport, SuggestedResource, TranscriptionEntry, FeedbackEntry, InterviewConfig } from '../types';
import { domains, personas } from '../types';
import EndScreen from './EndScreen';

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
    } | null;
}

const InterviewerDashboard: React.FC<InterviewerDashboardProps> = ({ onBack, userId }) => {
  const [invites, setInvites] = useState<ExtendedInvite[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Report Viewing State
  const [selectedReportInvite, setSelectedReportInvite] = useState<ExtendedInvite | null>(null);

  // Configuration State
  const [selectedDomain, setSelectedDomain] = useState<DomainKey>('software-engineering');
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>('junior');
  const [selectedPersona, setSelectedPersona] = useState<PersonaKey>('friendly');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('');

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
        .filter(inv => inv.status === 'accepted' && inv.candidate_id)
        .map(inv => inv.candidate_id);

      let interviewsMap: Record<string, any> = {};

      if (acceptedCandidateIds.length > 0) {
          const { data: interviewData } = await supabase
            .from('interviews')
            .select('*')
            .in('user_id', acceptedCandidateIds)
            .order('created_at', { ascending: false }); // Get latest first
          
          if (interviewData) {
              // Map latest interview to candidate_id
              interviewData.forEach(intrv => {
                  if (!interviewsMap[intrv.user_id]) {
                      interviewsMap[intrv.user_id] = intrv;
                  }
              });
          }
      }

      // 3. Merge Data
      const mergedInvites = invitesData.map(inv => ({
          ...inv,
          interviewData: inv.candidate_id ? interviewsMap[inv.candidate_id] : null
      }));

      setInvites(mergedInvites);
      setLoading(false);
  };

  useEffect(() => {
    fetchInvites();
  }, [userId]);

  const handleCreateInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newEmail || !supabase) return;
      
      const isSoftwareEngineering = selectedDomain === 'software-engineering';
      if (isSoftwareEngineering && !selectedTechnology) {
          alert("Please select a technology stack for Software Engineering.");
          return;
      }

      // LIMIT CHECK: Max 25 invites
      if (invites.length >= 25) {
          alert("Invitation Limit Reached: You are limited to 25 invitation links. Please remove existing candidates or unused links to create new ones.");
          return;
      }

      setCreating(true);

      // Build Config
      const baseConfig = domains[selectedDomain].levels[selectedLevel];
      let systemInstruction = baseConfig.systemInstruction;
      
      if (isSoftwareEngineering && domains['software-engineering'].technologies) {
          const techName = domains['software-engineering'].technologies[selectedTechnology];
          systemInstruction = systemInstruction.replace(/{technology}/g, techName);
      }
      
      const personaModifier = personas[selectedPersona].modifier;
      systemInstruction = `${systemInstruction} In terms of your personality as an interviewer, please adhere to the following: ${personaModifier}`;

      const finalConfig = {
          ...baseConfig,
          systemInstruction,
          name: `${baseConfig.name} (${personas[selectedPersona].name})`
      };
      
      // Generate invite link (token created by DB default)
      const { data, error } = await supabase.from('invites').insert({
          interviewer_id: userId,
          email: newEmail,
          config: finalConfig,
      }).select();

      if (error) {
          alert("Failed to invite: " + error.message);
      } else if (data && data[0]) {
          setNewEmail('');
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

  // If viewing a report, render EndScreen
  if (selectedReportInvite && selectedReportInvite.interviewData) {
      return (
          <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
              <button onClick={() => setSelectedReportInvite(null)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                Back to Candidate List
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-brand-purple flex items-center justify-center text-xl font-bold text-white">
                      {selectedReportInvite.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-white">{selectedReportInvite.email}</h2>
                      <p className="text-gray-400">Interview Role: <span className="text-brand-purple">{selectedReportInvite.interviewData.config.name}</span></p>
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
              />
          </div>
      );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-3xl font-bold text-white">Interviewer Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
              <div className="text-right">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">Usage</span>
                  <span className={`text-sm font-bold ${invites.length >= 25 ? 'text-brand-red' : 'text-brand-purple'}`}>
                      {invites.length} / 25 Slots
                  </span>
              </div>
              <div className="px-3 py-1 bg-brand-purple/20 border border-brand-purple/50 rounded-full text-brand-purple text-xs font-bold uppercase tracking-wider">
                  Recruiter Access
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invite Form */}
          <div className="glass-panel p-6 rounded-xl h-fit">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
                  Assign Interview
              </h3>
              <form onSubmit={handleCreateInvite} className="space-y-4">
                  <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Candidate Email</label>
                      <input 
                        type="email" 
                        required 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={invites.length >= 25}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-brand-purple outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="candidate@example.com"
                      />
                  </div>

                  {/* Config Selectors */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                      <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1">Role / Domain</label>
                          <select 
                            value={selectedDomain} 
                            onChange={(e) => { setSelectedDomain(e.target.value as DomainKey); setSelectedTechnology(''); }}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-brand-purple outline-none"
                          >
                              {Object.keys(domains).map(key => (
                                  <option key={key} value={key}>{domains[key as DomainKey].name}</option>
                              ))}
                          </select>
                      </div>

                      {selectedDomain === 'software-engineering' && (
                          <div>
                              <label className="block text-xs font-semibold text-gray-400 mb-1">Tech Stack</label>
                              <select 
                                value={selectedTechnology} 
                                onChange={(e) => setSelectedTechnology(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-brand-purple outline-none"
                              >
                                  <option value="">-- Select Technology --</option>
                                  {Object.entries(domains['software-engineering'].technologies || {}).map(([key, name]) => (
                                      <option key={key} value={key}>{name}</option>
                                  ))}
                              </select>
                          </div>
                      )}

                      <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1">Difficulty Level</label>
                          <select 
                            value={selectedLevel} 
                            onChange={(e) => setSelectedLevel(e.target.value as LevelKey)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-brand-purple outline-none"
                          >
                              <option value="junior">Junior</option>
                              <option value="mid-level">Mid-Level</option>
                              <option value="senior">Senior</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1">Interviewer Persona</label>
                          <select 
                            value={selectedPersona} 
                            onChange={(e) => setSelectedPersona(e.target.value as PersonaKey)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-brand-purple outline-none"
                          >
                              {Object.keys(personas).map(key => (
                                  <option key={key} value={key}>{personas[key as PersonaKey].name}</option>
                              ))}
                          </select>
                      </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={creating || invites.length >= 25}
                    className={`w-full font-bold py-3 rounded-lg transition-all shadow-lg mt-4 
                        ${invites.length >= 25 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-brand-purple to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white hover:shadow-brand-purple/20'}`}
                  >
                      {creating ? 'Creating...' : (invites.length >= 25 ? 'Limit Reached (25/25)' : 'Generate Invite Link')}
                  </button>
              </form>
          </div>

          {/* Invites List */}
          <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-6 border-b border-white/5 bg-black/20">
                  <h3 className="text-xl font-bold text-white">Manage Candidates</h3>
              </div>
              <div className="overflow-x-auto flex-1 custom-scrollbar">
                   <table className="w-full text-sm text-left text-gray-400">
                      <thead className="text-xs text-gray-500 uppercase bg-black/40 sticky top-0">
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
                                <tr key={invite.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{invite.email}</div>
                                        <div className="text-xs text-gray-500">{new Date(invite.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium truncate max-w-[200px]">
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
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={() => handleDeleteInvite(invite.id, invite.status)}
                                                disabled={isDeleting}
                                                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
                                                    invite.status === 'pending' 
                                                    ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20' 
                                                    : 'text-gray-500 hover:text-white hover:bg-white/10'
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
                              <tr><td colSpan={4} className="px-6 py-12 text-center italic text-gray-500">No candidates invited yet.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
};

export default InterviewerDashboard;
