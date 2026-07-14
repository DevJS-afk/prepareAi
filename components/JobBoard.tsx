import React, { useState, useEffect } from 'react';
import { JobOffer } from '../types';

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

  const fetchJobs = async (q: string, l: string, c: string, level: string, type: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ q, l, c, level, type });
      const res = await fetch(`/api/jobs?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      const mappedJobs = (data.jobs || []).map((j: any) => ({
        title: j.title,
        company: j.company,
        url: j.link || j.url,
        location: j.location,
        platform: j.platform || "Web"
      }));
      setJobs(mappedJobs);
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

  return (
    <div className="w-full max-w-7xl animate-slide-up pt-4">
       <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
      </button>

      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
           Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">Openings</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
          Discover remote and onsite opportunities tailored to your target roles with advanced filtering.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl mb-8 border border-white/5 bg-black/40">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow">
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Job Title or Keyword</label>
                      <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue transition-colors"
                          placeholder="e.g. Frontend Developer"
                      />
                  </div>
                  <div className="flex-grow md:max-w-xs">
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Location</label>
                      <input 
                          type="text" 
                          value={locationQuery}
                          onChange={(e) => setLocationQuery(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue transition-colors"
                          placeholder="e.g. Remote, New York"
                      />
                  </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow">
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Company Name (Optional)</label>
                      <input 
                          type="text" 
                          value={companyQuery}
                          onChange={(e) => setCompanyQuery(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue transition-colors"
                          placeholder="e.g. Google, Stripe"
                      />
                  </div>
                  <div className="flex-grow md:max-w-[200px]">
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Experience Level</label>
                      <select 
                          value={levelQuery}
                          onChange={(e) => setLevelQuery(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue transition-colors appearance-none"
                      >
                          <option value="">Any Level</option>
                          <option value="Internship">Internship</option>
                          <option value="Entry level">Entry level</option>
                          <option value="Associate">Associate</option>
                          <option value="Mid-Senior level">Mid-Senior level</option>
                          <option value="Director">Director</option>
                          <option value="Executive">Executive</option>
                      </select>
                  </div>
                  <div className="flex-grow md:max-w-[200px]">
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Job Type</label>
                      <select 
                          value={typeQuery}
                          onChange={(e) => setTypeQuery(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue transition-colors appearance-none"
                      >
                          <option value="">Any Type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Temporary">Temporary</option>
                          <option value="Internship">Internship</option>
                      </select>
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
              <p className="text-gray-400">No jobs found matching your criteria. Try adjusting your search.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, idx) => (
                  <div key={idx} className="glass-panel group p-6 rounded-3xl border border-white/5 hover:border-brand-blue/30 transition-all duration-300 relative flex flex-col h-full bg-gradient-to-b from-white/5 to-transparent">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                      <div className="relative z-10 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-4">
                              <h3 className="text-xl font-bold text-white leading-tight">{job.title}</h3>
                          </div>
                          
                          <p className="text-brand-blue font-semibold mb-2">{job.company}</p>
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {job.location || 'Remote'}
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-gray-300 group-hover:bg-brand-blue/20 group-hover:text-brand-blue transition-colors">
                                  {(job as any).platform || "Web"}
                              </span>
                              <a 
                                  href={job.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-sm font-bold text-white bg-black/50 hover:bg-brand-blue px-4 py-2 rounded-lg transition-colors border border-white/10 hover:border-transparent"
                              >
                                  Apply Now
                              </a>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default JobBoard;
