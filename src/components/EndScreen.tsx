
import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../services/firebaseClient';
import type { TranscriptionEntry, FeedbackEntry, InterviewConfig, SuggestedResource, InterviewReport, JobOffer } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface EndScreenProps {
  onRestart: () => void;
  transcription: TranscriptionEntry[];
  feedback: FeedbackEntry[];
  config: InterviewConfig;
  userEmail: string;
  userId: string;
  existingReport?: InterviewReport;
  existingResources?: SuggestedResource[];
  isHistoryView?: boolean;
  confidenceTrend?: { time: string; confidence: number }[];
}

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese (Simplified)", 
  "Japanese", "Korean", "Hindi", "Portuguese", "Russian", "Arabic", "Italian", "Dutch", "Turkish", "Polish"
];

interface UiLabels {
  performanceDashboard: string;
  overallSummary: string;
  keyStrengths: string;
  areasForImprovement: string;
  actionableAdvice: string;
  learningResources: string;
  jobOpportunities: string;
  tryAnotherInterview: string;
  reportReady: string;
  reportReadySubtext: string;
  generatedFor: string;
  clarityAndPacing: string;
  detectedKeywords: string;
}

const DEFAULT_LABELS: UiLabels = {
  performanceDashboard: "Performance Dashboard",
  overallSummary: "Executive Summary",
  keyStrengths: "Key Strengths",
  areasForImprovement: "Growth Areas",
  actionableAdvice: "Action Plan",
  learningResources: "Curated Resources",
  jobOpportunities: "Job Opportunities",
  tryAnotherInterview: "Start New Session",
  reportReady: "Analysis Complete",
  reportReadySubtext: "Your personalized performance report is ready.",
  generatedFor: "Assessment for",
  clarityAndPacing: "Communication Analytics",
  detectedKeywords: "Detected Keywords",
};

const SkillMeter: React.FC<{ skill: string; rating: number; justification: string }> = ({ skill, rating, justification }) => {
  const percentage = Math.max(rating * 10, 5); 
  let color = 'from-red-500 to-red-600';
  let textCol = 'text-red-400';
  if (rating > 4) { color = 'from-yellow-400 to-yellow-600'; textCol = 'text-brand-yellow'; }
  if (rating > 7) { color = 'from-green-400 to-green-600'; textCol = 'text-brand-green'; }

  return (
    <div className="group bg-black/20 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-gray-200 text-sm tracking-wide">{skill}</p>
        <span className={`font-bold text-lg ${textCol}`}>{rating}<span className="text-gray-600 text-sm">/10</span></span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 mb-3 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{justification}</p>
    </div>
  );
};

const MetricCircle: React.FC<{ value: number; label: string; color: 'blue' | 'purple' }> = ({ value, label, color }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;
    const colorClass = color === 'blue' ? 'text-brand-blue' : 'text-brand-purple';

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-xl border border-white/5">
            <div className="relative w-20 h-20 mb-3">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-800" />
                    <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" 
                        className={colorClass}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${colorClass}`}>{value}</span>
                </div>
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
    );
};

const FeedbackCard: React.FC<{ title: string; items: string[]; icon: React.ReactNode; color: 'green' | 'yellow' | 'blue'}> = ({title, items, icon, color}) => {
  const styles = {
    green: 'bg-green-500/10 border-green-500/20 text-green-100',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-100',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-100',
  };
  const titleColors = {
      green: 'text-brand-green',
      yellow: 'text-brand-yellow',
      blue: 'text-brand-blue'
  };

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-sm h-full ${styles[color]}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-black/20 ${titleColors[color]}`}>{icon}</div>
        <h4 className={`text-lg font-bold ${titleColors[color]}`}>{title}</h4>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed opacity-90">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${titleColors[color].replace('text-', 'bg-')}`}></span>
                {item}
            </li>
        ))}
      </ul>
    </div>
  );
};

const EndScreen: React.FC<EndScreenProps> = ({ 
  onRestart, 
  transcription, 
  feedback, 
  config, 
  userEmail, 
  userId, 
  existingReport, 
  existingResources,
  isHistoryView = false,
  confidenceTrend
}) => {
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [resources, setResources] = useState<SuggestedResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [translations, setTranslations] = useState<Record<string, { report: InterviewReport; labels: UiLabels }>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (existingReport) {
        setReport(existingReport);
        setResources(existingResources || []);
        setIsLoading(false);
        return;
    }

    const generateAndSaveReport = async () => {
      try {
        if (!userId) throw new Error("User ID is not available.");

        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcription, feedback, config }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to generate report from server");
        }

        const data = await response.json();
        const receivedReport: InterviewReport = data.report;
        const receivedResources: SuggestedResource[] = data.resources;

        // Fetch Job Offers
        let receivedJobOffers: JobOffer[] = [];
        try {
            const jobRes = await fetch(`/api/jobs?q=${encodeURIComponent(config.name)}&l=Remote`);
            if (jobRes.ok) {
                const jobData = await jobRes.json();
                receivedJobOffers = (jobData.jobs || []).slice(0, 3).map((j: any) => ({
                    title: j.title || "Job Listing",
                    company: j.company || "Unknown Company",
                    url: j.link || j.url || "#",
                    location: j.location || "Remote"
                }));
            } else {
                console.error("Job API returned an error:", jobRes.status);
            }
        } catch (jobErr) {
            console.error("Error fetching job offers from API:", jobErr);
            // Fallback: empty list
        }

        receivedReport.jobOffers = receivedJobOffers;

        setReport(receivedReport);
        setResources(receivedResources);

        if (supabase && !isHistoryView) {
            await supabase.from('interviews').insert([
                { 
                  user_id: userId, 
                  config: config, 
                  transcription: transcription, 
                  feedback: feedback, 
                  report: receivedReport, 
                  resources: receivedResources,
                  confidence_trend: confidenceTrend,
                  status: 'Finished'
                }
            ]);
        }

      } catch (err: any) {
        console.error("Error generating report:", err);
        setError(err.message || "Could not generate report. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (transcription.length > 0) {
        generateAndSaveReport();
    } else {
        if(!existingReport) {
            setError("No interview data recorded.");
            setIsLoading(false);
        }
    }
  }, [transcription, feedback, config, userEmail, userId, existingReport, existingResources, isHistoryView]);

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetLang = e.target.value;
    if (targetLang === currentLanguage) return;
    setCurrentLanguage(targetLang);

    if (targetLang === "English" || translations[targetLang]) return;
    if (!report) return;

    setIsTranslating(true);
    try {
        const response = await fetch("/api/translate-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ report, targetLang, uiLabels: DEFAULT_LABELS }),
        });

        if (!response.ok) {
          throw new Error("Failed to translate report from server");
        }

        const translatedData = await response.json();
        setTranslations(prev => ({ ...prev, [targetLang]: translatedData }));
    } catch (err) {
        console.error("Translation failed:", err);
        setCurrentLanguage("English");
    } finally {
        setIsTranslating(false);
    }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadReport = async () => {
    if (!activeReport) return;
    setIsGeneratingPdf(true);
    try {
      const reportContainer = document.getElementById('report-container');
      if (!reportContainer) return;
      
      const canvas = await html2canvas(reportContainer, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#0f172a'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Interview_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const activeReport = currentLanguage === "English" ? report : (translations[currentLanguage]?.report || report);
  const activeLabels = currentLanguage === "English" ? DEFAULT_LABELS : (translations[currentLanguage]?.labels || DEFAULT_LABELS);

  const displayTrend = (activeReport?.confidenceTrend && activeReport.confidenceTrend.length > 0)
    ? activeReport.confidenceTrend
    : (confidenceTrend && confidenceTrend.length > 0)
      ? confidenceTrend
      : [
          { time: "00:05", confidence: 80 },
          { time: "00:15", confidence: 83 },
          { time: "00:30", confidence: 78 },
          { time: "00:45", confidence: 85 },
          { time: "01:00", confidence: 82 },
          { time: "01:15", confidence: 88 },
          { time: "01:30", confidence: 91 },
          { time: "01:45", confidence: 89 },
          { time: "02:00", confidence: 94 }
        ];
  const isSampleTrend = !activeReport?.confidenceTrend?.length && (!confidenceTrend || confidenceTrend.length === 0);

  const competenciesToDisplay = activeReport ? (activeReport.coreCompetencies || [
    ...(activeReport.keyStrengths || []).slice(0, 2).map((strength, idx) => ({
      name: idx === 0 ? "Problem Solving" : "Technical Delivery",
      status: "strength" as const,
      description: strength
    })),
    ...(activeReport.areasForImprovement || []).slice(0, 2).map((weakness, idx) => ({
      name: idx === 0 ? "Communication Flow" : "Technical Depth",
      status: "weakness" as const,
      description: weakness
    }))
  ]) : [];

  return (
    <div id="report-container" className="w-full max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
         <div className="flex items-center gap-6">
             <div>
                 <h2 className="text-2xl font-bold text-white">{activeLabels.reportReady}</h2>
                 <p className="text-gray-400 text-sm">{activeLabels.reportReadySubtext}</p>
             </div>
             {activeReport && activeReport.overallScore !== undefined && (
                 <div className="hidden md:flex items-center gap-4 pl-6 border-l border-white/10">
                     <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-700" />
                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" 
                                className={activeReport.overallScore >= 70 ? 'text-brand-green' : activeReport.overallScore >= 40 ? 'text-brand-yellow' : 'text-brand-red'}
                                strokeDasharray={2 * Math.PI * 24}
                                strokeDashoffset={2 * Math.PI * 24 * (1 - activeReport.overallScore / 100)}
                            />
                        </svg>
                        <span className="absolute text-lg font-bold text-white">{activeReport.overallScore}</span>
                     </div>
                     <div>
                         <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Score</div>
                         <div className={`text-sm font-bold ${activeReport.overallScore >= 70 ? 'text-brand-green' : activeReport.overallScore >= 40 ? 'text-brand-yellow' : 'text-brand-red'}`}>
                             {activeReport.overallScore >= 70 ? 'Excellent' : activeReport.overallScore >= 40 ? 'Average' : 'Needs Work'}
                         </div>
                     </div>
                 </div>
             )}
         </div>
         {report && (
            <div className="flex items-center gap-3 bg-black/30 p-2 rounded-lg border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.89 18.89 0 01-.253 5.954l-.184 1.054A3.003 3.003 0 0112 17a3.001 3.001 0 01-5.748-1.077l.794-4.526a1.272 1.272 0 01.328-.686c.162-.187.35-.357.562-.511A18.88 18.88 0 017 6V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
                <select
                    value={currentLanguage}
                    onChange={handleLanguageChange}
                    disabled={isTranslating}
                    className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                >
                    {LANGUAGES.map(lang => <option key={lang} value={lang} className="bg-slate-900 text-white">{lang}</option>)}
                </select>
                {isTranslating && <div className="animate-spin h-4 w-4 border-2 border-brand-blue rounded-full border-t-transparent"></div>}
            </div>
         )}
      </div>

      {isLoading && (
        <div className="glass-panel p-20 rounded-2xl flex flex-col items-center justify-center text-center animate-pulse">
          <div className="w-20 h-20 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-xl text-gray-300">Generating comprehensive analysis...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2 text-brand-red">Report Generation Failed</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      )}

      {!isLoading && !error && activeReport && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up">
            {/* Left Column: Summary & Skills */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Executive Summary */}
                <div className="glass-panel p-8 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-3">
                         <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
                         {activeLabels.overallSummary}
                    </h3>
                    {isTranslating ? <p className="animate-pulse text-gray-500">Updating...</p> : <p className="text-gray-300 leading-relaxed text-lg">{activeReport.overallSummary}</p>}
                </div>

                {/* Confidence Trend Timeline */}
                <div className="glass-panel p-8 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                             <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
                             Confidence Trend Timeline
                        </h3>
                        <div>
                            <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${
                                isSampleTrend 
                                ? "bg-white/5 border-white/10 text-gray-400" 
                                : "bg-brand-purple/15 border-brand-purple/30 text-brand-purple"
                            }`}>
                                {isSampleTrend ? "Sample Log" : "Live Session Telemetry"}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                        This timeline tracks the candidate's confidence level throughout the session, calculated via real-time analysis of posture steadying, presentation gestures, and interactive conversational composure.
                    </p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={displayTrend} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="#9ca3af" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    domain={[50, 100]} 
                                    stroke="#9ca3af" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#ffffff15', borderRadius: '0.75rem', color: '#fff' }}
                                    labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="confidence" 
                                    stroke="#a855f7" 
                                    strokeWidth={3} 
                                    dot={{ fill: '#a855f7', r: 3, strokeWidth: 0 }}
                                    activeDot={{ r: 5, fill: '#fff', stroke: '#a855f7', strokeWidth: 2 }}
                                    name="Confidence Level"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Communication Metrics & Skills */}
                <div className="glass-panel p-8 rounded-2xl">
                    <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                         <span className="w-1.5 h-6 bg-brand-blue rounded-full"></span>
                         {activeLabels.performanceDashboard}
                    </h3>
                    
                    {/* New Clarity/Pacing/Keywords Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        {activeReport.clarityRating !== undefined && (
                            <div className="flex gap-4 items-center">
                                <MetricCircle value={activeReport.clarityRating} label="Clarity" color="blue" />
                                <MetricCircle value={activeReport.pacingRating || 0} label="Pacing" color="purple" />
                            </div>
                        )}
                        {activeReport.detectedKeywords && activeReport.detectedKeywords.length > 0 && (
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{activeLabels.detectedKeywords}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {activeReport.detectedKeywords.map((kw, i) => (
                                        <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-brand-blue font-mono">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {isTranslating 
                            ? <div className="col-span-2 h-40 animate-pulse bg-white/5 rounded-xl"></div>
                            : activeReport.skillRatings.map((skill) => <SkillMeter key={skill.skillName} skill={skill.skillName} rating={skill.rating} justification={skill.justification} />)
                         }
                    </div>
                </div>

                {/* Strengths vs. Weaknesses Competency Card */}
                <div className="glass-panel p-8 rounded-2xl space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-brand-yellow rounded-full animate-pulse"></span>
                            Strengths vs. Weaknesses: Core Competency Analysis
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            Categorized breakdown of your core competencies mapped directly from semantic patterns in your responses.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths Column */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-brand-green uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                                <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Key Core Strengths
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                {competenciesToDisplay.filter(c => c.status === 'strength').map((c, i) => (
                                    <div key={i} className="p-5 rounded-xl bg-green-500/[0.03] border border-green-500/15 hover:border-green-500/30 transition-all duration-300">
                                        <h5 className="font-semibold text-green-400 text-sm mb-1.5 flex items-center gap-2">
                                            <span className="w-1 h-3 bg-brand-green rounded-full"></span>
                                            {c.name}
                                        </h5>
                                        <p className="text-xs text-gray-400 leading-relaxed">{c.description}</p>
                                    </div>
                                ))}
                                {competenciesToDisplay.filter(c => c.status === 'strength').length === 0 && (
                                    <p className="text-xs text-gray-500 italic">No key strengths extracted.</p>
                                )}
                            </div>
                        </div>

                        {/* Weaknesses Column */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-brand-yellow uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                                <svg className="w-5 h-5 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Growth Areas & Weaknesses
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                {competenciesToDisplay.filter(c => c.status === 'weakness').map((c, i) => (
                                    <div key={i} className="p-5 rounded-xl bg-yellow-500/[0.03] border border-yellow-500/15 hover:border-yellow-500/30 transition-all duration-300">
                                        <h5 className="font-semibold text-yellow-400 text-sm mb-1.5 flex items-center gap-2">
                                            <span className="w-1 h-3 bg-brand-yellow rounded-full"></span>
                                            {c.name}
                                        </h5>
                                        <p className="text-xs text-gray-400 leading-relaxed">{c.description}</p>
                                    </div>
                                ))}
                                {competenciesToDisplay.filter(c => c.status === 'weakness').length === 0 && (
                                    <p className="text-xs text-gray-500 italic">No key areas for improvement extracted.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FeedbackCard 
                        title={activeLabels.keyStrengths} 
                        items={isTranslating ? ["..."] : activeReport.keyStrengths} 
                        color="green" 
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
                     />
                     <FeedbackCard 
                        title={activeLabels.areasForImprovement} 
                        items={isTranslating ? ["..."] : activeReport.areasForImprovement} 
                        color="yellow" 
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} 
                     />
                </div>
                 <div className="glass-panel p-6 rounded-2xl border-l-4 border-brand-blue">
                     <h3 className="text-lg font-bold text-white mb-4">{activeLabels.actionableAdvice}</h3>
                     <ul className="space-y-3">
                        {activeReport.actionableAdvice.map((item, i) => (
                             <li key={i} className="flex gap-3 text-gray-300">
                                 <span className="text-brand-blue font-bold">→</span>
                                 {item}
                             </li>
                        ))}
                     </ul>
                 </div>
            </div>

            {/* Right Column: Resources & Actions */}
            <div className="lg:col-span-4 space-y-6">
                <div className="glass-panel p-6 rounded-2xl sticky top-24">
                    <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-3">
                         <span className="w-1.5 h-6 bg-brand-green rounded-full"></span>
                         {activeLabels.learningResources}
                    </h3>
                    <div className="space-y-4">
                        {resources.length > 0 ? resources.map((res, index) => (
                             <a key={index} href={res.uri} target="_blank" rel="noopener noreferrer" className="block group p-4 rounded-xl bg-black/20 hover:bg-brand-green/10 border border-white/5 hover:border-brand-green/30 transition-all">
                                 <h5 className="font-semibold text-white group-hover:text-brand-green transition-colors mb-1 text-sm">{res.title}</h5>
                                 <p className="text-xs text-gray-500 truncate">{new URL(res.uri).hostname}</p>
                             </a>
                        )) : <p className="text-gray-500 italic text-sm">No specific resources found.</p>}
                    </div>

                    {/* Job Opportunities Section */}
                    {activeReport.jobOffers && activeReport.jobOffers.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-brand-yellow rounded-full"></span>
                                {activeLabels.jobOpportunities}
                            </h3>
                            <div className="space-y-4">
                                {activeReport.jobOffers.map((job, index) => (
                                    <a key={index} href={job.url} target="_blank" rel="noopener noreferrer" className="block group p-4 rounded-xl bg-black/20 hover:bg-brand-yellow/10 border border-white/5 hover:border-brand-yellow/30 transition-all">
                                        <h5 className="font-semibold text-white group-hover:text-brand-yellow transition-colors mb-1 text-sm">{job.title}</h5>
                                        <p className="text-xs text-gray-400">{job.company}</p>
                                        {job.location && <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{job.location}</p>}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-10 pt-6 border-t border-white/10 space-y-4">
                        <button
                            onClick={handleDownloadReport}
                            disabled={isGeneratingPdf}
                            className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2 border border-brand-purple/20"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {isGeneratingPdf ? "Generating PDF..." : "Download Report (PDF)"}
                        </button>

                        <button
                            onClick={onRestart}
                            className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-xl transition-all shadow-lg transform hover:-translate-y-1"
                        >
                            {isHistoryView ? "Back to History" : activeLabels.tryAnotherInterview}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default EndScreen;
