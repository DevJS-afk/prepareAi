import React, { useState, useEffect } from 'react';
import { JobOffer } from '../types';
import { supabase } from '../services/supabaseClient';
import ReactMarkdown from 'react-markdown';
import { fetchJobsFrontEnd } from '../services/jobService';

interface JobBoardProps {
  onBack: () => void;
  userRole?: string;
}

const JobBoard: React.FC<JobBoardProps> = ({ onBack }) => {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("software engineer");
  const [locationQuery, setLocationQuery] = useState("Remote");
  const [companyQuery, setCompanyQuery] = useState("");
  const [levelQuery, setLevelQuery] = useState("");
  const [typeQuery, setTypeQuery] = useState("");

  // Modal Detail State
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  const fetchJobs = async (q: string, l: string, c: string, level: string, type: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch scraped jobs from frontend logic
      let scrapedJobs: any[] = [];
      try {
        const jobsResult = await fetchJobsFrontEnd(q, l, c, level, type);
        scrapedJobs = (jobsResult || []).map((j: any) => ({
          title: j.title,
          company: j.company,
          url: j.link || j.url,
          location: j.location,
          platform: j.platform || "Web"
        }));
      } catch (err) {
        console.warn("Frontend jobs scraper failed or returned error, using fallback empty array", err);
      }

      // 2. Fetch custom recruiter jobs from Firestore
      let firestoreJobs: JobOffer[] = [];
      try {
        if (supabase) {
          const { data: dbJobs, error: dbError } = await supabase
            .from('job_offers')
            .select('*');
          
          if (!dbError && dbJobs) {
            firestoreJobs = dbJobs.map((j: any) => ({
              id: j.id,
              recruiter_id: j.recruiter_id,
              title: j.title,
              company: j.company,
              url: j.url || "#",
              location: j.location,
              description: j.description,
              salary: j.salary,
              experienceLevel: j.experienceLevel,
              jobType: j.jobType,
              created_at: j.created_at,
              isRecruiterPosted: true,
              platform: "PrepareAI"
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch job offers from Firestore:", err);
      }

      // 3. Filter custom recruiter-posted jobs according to filters
      const filteredFirestoreJobs = firestoreJobs.filter(job => {
        const matchesQ = !q || 
          job.title.toLowerCase().includes(q.toLowerCase()) || 
          (job.description && job.description.toLowerCase().includes(q.toLowerCase())) ||
          job.company.toLowerCase().includes(q.toLowerCase());
        const matchesL = !l || (job.location && job.location.toLowerCase().includes(l.toLowerCase()));
        const matchesC = !c || job.company.toLowerCase().includes(c.toLowerCase());
        const matchesLevel = !level || (job.experienceLevel && job.experienceLevel.toLowerCase() === level.toLowerCase());
        const matchesType = !type || (job.jobType && job.jobType.toLowerCase() === type.toLowerCase());
        return matchesQ && matchesL && matchesC && matchesLevel && matchesType;
      });

      // Show recruiter posted jobs at the very beginning to prioritize direct positions!
      setJobs([...filteredFirestoreJobs, ...scrapedJobs]);
    } catch (err: any) {
      console.error(err);
      setError("Could not load jobs at this time. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(searchQuery, locationQuery, companyQuery, levelQuery, typeQuery);
  }, []); // Initial load

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(searchQuery, locationQuery, companyQuery, levelQuery, typeQuery);
  };

  const openJobDetails = (job: JobOffer) => {
    setSelectedJob(job);
    setHasApplied(false);
  };

  const handleApplyDirectly = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setHasApplied(true);
    }, 1200);
  };

  return (
    <div className="w-full animate-slide-up pt-4">
       <button onClick={onBack} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white mb-6 flex items-center transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
      </button>

      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
           Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">Openings</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
          Discover remote and onsite opportunities tailored to your target roles with advanced filtering.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl mb-8 border border-slate-200 dark:border-white/5 bg-slate-200/70 dark:bg-black/40">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow">
                      <label className="block text-sm font-semibold text-slate-600 dark:text-gray-400 mb-2">Job Title or Keyword</label>
                      <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-200/80 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                          placeholder="e.g. Frontend Developer"
                      />
                  </div>
                  <div className="flex-grow md:max-w-xs">
                      <label className="block text-sm font-semibold text-slate-600 dark:text-gray-400 mb-2">Location</label>
                      <input 
                          type="text" 
                          value={locationQuery}
                          onChange={(e) => setLocationQuery(e.target.value)}
                          className="w-full bg-slate-200/80 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                          placeholder="e.g. Remote, New York"
                      />
                  </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow">
                      <label className="block text-sm font-semibold text-slate-600 dark:text-gray-400 mb-2">Company Name (Optional)</label>
                      <input 
                          type="text" 
                          value={companyQuery}
                          onChange={(e) => setCompanyQuery(e.target.value)}
                          className="w-full bg-slate-200/80 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                          placeholder="e.g. Google, Stripe"
                      />
                  </div>
                  <div className="flex-grow md:max-w-[200px]">
                      <label className="block text-sm font-semibold text-slate-600 dark:text-gray-400 mb-2">Experience Level</label>
                      <div className="relative">
                          <select 
                              value={levelQuery}
                              onChange={(e) => setLevelQuery(e.target.value)}
                              className="w-full bg-slate-200/80 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-10 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand-blue transition-colors appearance-none cursor-pointer"
                          >
                              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Any Level</option>
                              <option value="Internship" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Internship</option>
                              <option value="Entry level" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Entry level</option>
                              <option value="Associate" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Associate</option>
                              <option value="Mid-Senior level" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mid-Senior level</option>
                              <option value="Director" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Director</option>
                              <option value="Executive" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Executive</option>
                          </select>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                          </div>
                      </div>
                  </div>
                  <div className="flex-grow md:max-w-[200px]">
                      <label className="block text-sm font-semibold text-slate-600 dark:text-gray-400 mb-2">Job Type</label>
                      <div className="relative">
                          <select 
                              value={typeQuery}
                              onChange={(e) => setTypeQuery(e.target.value)}
                              className="w-full bg-slate-200/80 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-10 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand-blue transition-colors appearance-none cursor-pointer"
                          >
                              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Any Type</option>
                              <option value="Full-time" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Full-time</option>
                              <option value="Part-time" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Part-time</option>
                              <option value="Contract" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Contract</option>
                              <option value="Temporary" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Temporary</option>
                              <option value="Internship" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Internship</option>
                          </select>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                          </div>
                      </div>
                  </div>
                  <div className="flex items-end">
                      <button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full bg-brand-blue text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                          {isLoading ? 'Searching...' : 'Search Jobs'}
                      </button>
                  </div>
              </div>
          </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      ) : error ? (
         <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-2xl text-center">
            <p>{error}</p>
         </div>
      ) : jobs.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center">
              <p className="text-slate-600 dark:text-gray-400">No jobs found matching your criteria. Try adjusting your search.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, idx) => (
                  <div key={idx} className="glass-panel group p-6 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-brand-blue/30 transition-all duration-300 relative flex flex-col h-full bg-gradient-to-b from-white/5 to-transparent">
                      {job.isRecruiterPosted && (
                        <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-brand-purple/20 border border-brand-purple/50 rounded-full text-brand-purple text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-brand-purple/5">
                          <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-ping"></span>
                          Direct Apply
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                      <div className="relative z-10 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-4 pr-24">
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{job.title}</h3>
                          </div>
                          
                          <p className="text-brand-blue font-semibold mb-2">{job.company}</p>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400 text-sm mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {job.location || 'Remote'}
                          </div>

                          {job.isRecruiterPosted && (
                            <div className="space-y-1 mb-6 text-xs text-slate-600 dark:text-gray-400 bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-white/5">
                              {job.salary && <div className="flex justify-between"><span className="text-slate-500 dark:text-gray-500">Salary:</span> <span className="font-semibold text-slate-900 dark:text-white">{job.salary}</span></div>}
                              {job.experienceLevel && <div className="flex justify-between"><span className="text-slate-500 dark:text-gray-500">Exp Level:</span> <span className="font-semibold text-slate-900 dark:text-white">{job.experienceLevel}</span></div>}
                              {job.jobType && <div className="flex justify-between"><span className="text-slate-500 dark:text-gray-500">Type:</span> <span className="font-semibold text-slate-900 dark:text-white">{job.jobType}</span></div>}
                            </div>
                          )}
                          
                          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-gray-300 group-hover:bg-brand-blue/20 group-hover:text-brand-blue transition-colors">
                                  {job.isRecruiterPosted ? "PrepareAI Direct" : ((job as any).platform || "Web")}
                              </span>
                              {job.isRecruiterPosted ? (
                                <button 
                                    onClick={() => openJobDetails(job)}
                                    className="text-sm font-bold text-slate-900 dark:text-white bg-gradient-to-r from-brand-purple to-purple-600 hover:from-purple-500 hover:to-purple-700 px-4 py-2 rounded-lg transition-all border border-transparent shadow-md hover:shadow-brand-purple/20"
                                >
                                    View Details
                                </button>
                              ) : (
                                <a 
                                    href={job.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-sm font-bold text-white bg-slate-200/80 dark:bg-black/50 hover:bg-brand-blue px-4 py-2 rounded-lg transition-colors border border-slate-200 dark:border-white/10 hover:border-transparent"
                                >
                                    Apply Now
                                </a>
                              )}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Recruiter Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-start justify-between bg-slate-200/50 dark:bg-black/30">
              <div>
                <span className="px-3 py-1 bg-brand-purple/20 border border-brand-purple/30 rounded-full text-brand-purple text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                  PrepareAI Verified Position
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1">{selectedJob.title}</h2>
                <p className="text-lg text-brand-blue font-semibold">{selectedJob.company}</p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-grow space-y-6 custom-scrollbar text-gray-300">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/5 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-gray-500 block text-xs uppercase tracking-wider">Location</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedJob.location || 'Remote'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-gray-500 block text-xs uppercase tracking-wider">Job Type</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedJob.jobType || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-gray-500 block text-xs uppercase tracking-wider">Experience</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedJob.experienceLevel || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-gray-500 block text-xs uppercase tracking-wider">Salary</span>
                  <span className="font-semibold text-brand-green">{selectedJob.salary || 'N/A'}</span>
                </div>
              </div>

              {/* Rich Markdown Description */}
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-slate-900 dark:text-white prose-headings:font-bold prose-ul:list-disc prose-ul:pl-5 space-y-4 text-sm md:text-base">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2">Position Description</h3>
                <div className="markdown-body">
                  <ReactMarkdown>{selectedJob.description || "No description provided."}</ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-200/50 dark:bg-black/30 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-gray-500">
                Posted {selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleDateString() : 'recently'}
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white font-semibold px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors text-sm"
                >
                  Close
                </button>
                {hasApplied ? (
                  <div className="bg-brand-green/20 text-brand-green border border-brand-green/30 font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Application Sent!
                  </div>
                ) : (
                  <button 
                    onClick={handleApplyDirectly}
                    disabled={applying}
                    className="bg-gradient-to-r from-brand-purple to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-brand-purple/20 text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {applying ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Applying...
                      </>
                    ) : (
                      "Apply Directly"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoard;
