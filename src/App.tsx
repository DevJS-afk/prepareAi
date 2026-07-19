
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { InterviewStatus, InterviewConfig, TranscriptionEntry, FeedbackEntry, SavedCV, SavedPortfolio, Role, SubscriptionTier, Session } from './types';
import { supabase } from './services/firebaseClient';
import { useTranslation } from 'react-i18next';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import Dashboard from './components/WelcomeScreen'; 

import InterviewSetup from './components/InterviewSetup';
import InterviewScreen from './components/InterviewScreen';
import EndScreen from './components/EndScreen';
import AuthScreen from './components/AuthScreen';
import ProfileScreen from './components/ProfileScreen';
import CVBuilder from './components/CVBuilder';
import MotivationLetter from './components/MotivationLetter';
import PortfolioBuilder from './components/PortfolioBuilder';
import JobBoard from './components/JobBoard';
import AdminDashboard from './components/AdminDashboard';
import InterviewerDashboard from './components/InterviewerDashboard';
import PricingScreen from './components/PricingScreen';
import CheckoutScreen from './components/CheckoutScreen';
import PaymentSuccessScreen from './components/PaymentSuccessScreen';
import LandingPage from './components/LandingPage';
import AboutUs from './components/AboutUs';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import CookieBanner from './components/CookieBanner';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useGlobalShortcuts({
    Escape: () => {
      if (session && location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
    }
  });

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // Authenticated App State
  const [_interviewStatus, setInterviewStatus] = useState<InterviewStatus>(InterviewStatus.NotStarted);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [finalTranscription, setFinalTranscription] = useState<TranscriptionEntry[]>([]);
  const [finalFeedback, setFinalFeedback] = useState<FeedbackEntry[]>([]);
  const [finalConfidenceTrend, setFinalConfidenceTrend] = useState<{ time: string; confidence: number }[]>([]);
  
  // Role & Limits
  const [userRole, setUserRole] = useState<Role>('user');
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [sessionCount, setSessionCount] = useState(0);
  const [tokens, setTokens] = useState<number>(0);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [pendingInviteConfig, setPendingInviteConfig] = useState<InterviewConfig | null>(null);
  const [lastUsedConfig, setLastUsedConfig] = useState<InterviewConfig | null>(() => {
    try {
      const saved = localStorage.getItem('lastUsedConfig');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  // User Display Info
  const [displayName, setDisplayName] = useState<string>('');

  // State for CV Editing
  const [editingCV, setEditingCV] = useState<SavedCV | null>(null);
  // State for Portfolio Editing
  const [editingPortfolio, setEditingPortfolio] = useState<SavedPortfolio | null>(null);

  // State for Checkout
  const [checkoutData, setCheckoutData] = useState<{ plan: SubscriptionTier; price: string; name: string } | null>(null);

  // Handle URL Invite Tokens
  useEffect(() => {
    const handleTokenParsing = () => {
        let token = null;
        
        // 1. Check Query Params (Standard)
        const searchParams = new URLSearchParams(window.location.search);
        token = searchParams.get('invite');

        // 2. Check Hash Params (Fallback for strict servers that 404 on query params)
        if (!token && window.location.hash) {
            // Remove leading #
            const hashString = window.location.hash.substring(1); 
            const hashParams = new URLSearchParams(hashString);
            token = hashParams.get('invite');
        }

        if (token) {
            setInviteToken(token);
            navigate('/auth'); // Jump straight to auth if invited
        }
    };

    handleTokenParsing();
    window.addEventListener('hashchange', handleTokenParsing);
    return () => window.removeEventListener('hashchange', handleTokenParsing);
  }, [navigate]);

  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase client not initialized.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    const fetchUserData = async (uid: string, email?: string, userMetadata?: any) => {
        try {
            // Get Profile
            const { data: profile } = await supabase!.from('profiles').select('role, is_admin, subscription_tier, email, full_name, avatar_url, tokens').eq('id', uid).maybeSingle();
            
            // Extract Metadata from Google Login
            const metaName = userMetadata?.full_name || userMetadata?.name;
            const metaAvatar = userMetadata?.avatar_url || userMetadata?.picture;

            // Determine Display Name ({t('nav.profile')} > Metadata > Email)
            const resolvedName = profile?.full_name || metaName || email || '';
            setDisplayName(resolvedName);

            let currentRole: Role = 'user';
            const isAdminEmail = email?.toLowerCase() === 'shopinstatechno@gmail.com';
            
            if (profile) {
                 // SYNC LOGIC: Check if profile is missing info that we have in metadata
                 const updates: any = {};
                 let needsUpdate = false;

                 if (isAdminEmail && (profile.role !== 'admin' || !profile.is_admin)) {
                     updates.role = 'admin';
                     updates.is_admin = true;
                     needsUpdate = true;
                 }

                 if (email && profile.email !== email) {
                     updates.email = email;
                     needsUpdate = true;
                 }
                 if (metaName && !profile.full_name) {
                     updates.full_name = metaName;
                     needsUpdate = true;
                 }
                 if (metaAvatar && !profile.avatar_url) {
                     updates.avatar_url = metaAvatar;
                     needsUpdate = true;
                 }

                 if (needsUpdate) {
                     const { error: updateError } = await supabase!.from('profiles').update(updates).eq('id', uid);
                     if (updateError && updateError.code !== '42703') { 
                         console.error("Failed to sync user profile data:", updateError);
                     }
                 }

                 // Set Role & Tier
                 if (profile.is_admin || profile.role === 'admin' || isAdminEmail) {
                     currentRole = 'admin';
                 } else if (profile.role) {
                     currentRole = profile.role as Role;
                 }
                 
                 if (profile.subscription_tier) {
                     setSubscriptionTier(profile.subscription_tier as SubscriptionTier);
                 }
            } else {
                // Create basic profile if missing
                try {
                    await supabase!.from('profiles').insert({ 
                        id: uid, 
                        email: email || '', 
                        role: isAdminEmail ? 'admin' : 'user',
                        is_admin: isAdminEmail ? true : false,
                        full_name: metaName || '',
                        avatar_url: metaAvatar || ''
                    });
                } catch (insertErr: any) {
                    if (insertErr.code === '42703') {
                         await supabase!.from('profiles').insert({ 
                             id: uid, 
                             role: isAdminEmail ? 'admin' : 'user', 
                             email: email || '' 
                         });
                    }
                }
                if (isAdminEmail) {
                    currentRole = 'admin';
                }
            }
            setUserRole(currentRole);

            // If Candidate, fetch their assigned interview config
            if (currentRole === 'candidate' && email) {
                const { data: invite } = await supabase!.from('invites').select('config').eq('email', email).limit(1).maybeSingle();
                if (invite && invite.config) {
                    setPendingInviteConfig(invite.config);
                }
            }

            // Get Session Count (for normal users)
            const { count } = await supabase!.from('interviews').select('*', { count: 'exact', head: true }).eq('user_id', uid);
            setSessionCount(count || 0);
            setTokens(profile?.tokens ?? 0);

        } catch (e) {
            console.error("Error fetching user data", e);
        }
    };

    supabase!.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
          const initialName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email || '';
          setDisplayName(initialName);
          fetchUserData(session.user.id, session.user.email || undefined, session.user.user_metadata);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Error getting session:", err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
          const initialName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email || '';
          setDisplayName(initialName);
          fetchUserData(session.user.id, session.user.email || undefined, session.user.user_metadata);
      } else {
          setUserRole('user');
          setPendingInviteConfig(null);
          setSubscriptionTier('free');
          setDisplayName('');
      }
      
      if (_event === 'SIGNED_OUT') {
        setInterviewStatus(InterviewStatus.NotStarted);
        setInterviewConfig(null);
        setFinalTranscription([]);
        setFinalFeedback([]);
        setFinalConfidenceTrend([]);
        setEditingCV(null);
        setEditingPortfolio(null);
        setUserRole('user');
        setSubscriptionTier('free');
        navigate('/'); // Go back to landing page
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);


  const handleStartInterview = useCallback((selectedConfig: InterviewConfig, practiceMode: boolean) => {
    if (userRole !== 'admin' && userRole !== 'candidate' && subscriptionTier === 'free' && !practiceMode) {
        if (tokens <= 0) {
            alert("Token Limit Reached: You have used all your tokens. Please upgrade to Pro for unlimited sessions or use 'Practice Mode'.");
            navigate('/pricing');
            return;
        }
    }

    localStorage.setItem('lastUsedConfig', JSON.stringify(selectedConfig));
    setLastUsedConfig(selectedConfig);
    setInterviewConfig(selectedConfig);
    setIsPracticeMode(practiceMode);
    setInterviewStatus(InterviewStatus.InProgress);
    navigate('/interview/session');
  }, [userRole, subscriptionTier, sessionCount, tokens, navigate]);

  const handleEndInterview = useCallback((transcription: TranscriptionEntry[], feedback: FeedbackEntry[], confidenceTrend?: { time: string; confidence: number }[]) => {
    if (isPracticeMode) {
      setInterviewStatus(InterviewStatus.NotStarted);
      setInterviewConfig(null);
      navigate('/dashboard');
    } else {
      setFinalTranscription(transcription);
      setFinalFeedback(feedback);
      setFinalConfidenceTrend(confidenceTrend || []);
      setInterviewStatus(InterviewStatus.Finished);
      navigate('/results');
      setSessionCount(prev => prev + 1); 
      if (subscriptionTier === 'free' && tokens > 0 && !isPracticeMode) {
          const newTokens = tokens - 1;
          setTokens(newTokens);
          supabase!.from('profiles').update({ tokens: newTokens }).eq('id', session?.user?.id).then();
      }
    }
  }, [isPracticeMode, navigate, tokens, session, subscriptionTier]);

  const handleRestart = useCallback(() => {
    setInterviewStatus(InterviewStatus.NotStarted);
    setInterviewConfig(null);
    setFinalTranscription([]);
    setFinalFeedback([]);
    setFinalConfidenceTrend([]);
    setIsPracticeMode(false);
    navigate('/dashboard');
  }, [navigate]);
  
  const handleEditCV = useCallback((cv: SavedCV) => {
      setEditingCV(cv);
      navigate('/cv-builder');
  }, [navigate]);

  const handleEditPortfolio = useCallback((portfolio: SavedPortfolio) => {
      setEditingPortfolio(portfolio);
      navigate('/portfolio-builder');
  }, [navigate]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const handlePlanSelection = (tier: SubscriptionTier, price: string, name: string) => {
      if (tier === 'free') {
          setCheckoutData({ plan: tier, price: 'Free', name: name });
          navigate('/checkout');
      } else {
          setCheckoutData({ plan: tier, price, name });
          navigate('/checkout');
      }
  };

  // Desktop blocker removed to allow phone and tablet access

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex flex-col items-center justify-center text-center transition-colors duration-300">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-white transition-colors duration-300">
       {/* Global Background Elements */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-blue/30 rounded-full mix-blend-screen filter blur-[100px] opacity-15 dark:opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-20 w-80 h-80 bg-brand-purple/30 rounded-full mix-blend-screen filter blur-[100px] opacity-15 dark:opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-brand-green/20 rounded-full mix-blend-screen filter blur-[100px] opacity-10 dark:opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 dark:opacity-10"></div>
       </div>

       {/* Header - Only show if not on public pages (except auth maybe?) or if logged in */}
       {session && (
         <header className="w-full sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-dark-bg/60 border-b border-slate-200/80 dark:border-white/5 shadow-md">
           <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                  <div className="relative group w-10 h-10 flex items-center justify-center overflow-hidden shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-[0.8rem] opacity-80 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-700 blur-sm"></div>
                                <div className="relative w-full h-full bg-slate-900 dark:bg-[#030712] rounded-[0.8rem] border border-white/10 flex items-center justify-center backdrop-blur-sm z-10 overflow-hidden shadow-inner">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rotate-45"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <defs>
                                        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                          <stop offset="0%" stopColor="#818cf8" />
                                          <stop offset="100%" stopColor="#e879f9" />
                                        </linearGradient>
                                      </defs>
                                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                      <path d="M2 17l10 5 10-5" />
                                      <path d="M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                              <h1 className="text-[26px] font-display font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-pink-500 transition-all duration-300 leading-none" style={{ letterSpacing: '-0.06em' }}>
                                  prepare<span className="text-indigo-500">AI</span>
                              </h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400 font-semibold">
                        {userRole === 'admin' ? 'Admin Mode' : userRole === 'interviewer' ? 'Recruiter Mode' : userRole === 'candidate' ? 'Candidate Mode' : (subscriptionTier === 'pro' ? 'Pro Plan' : 'Free Tier')}
                    </p>
                  </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-slate-600 dark:text-gray-300 text-sm font-medium">{session.user.email}</p>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-gray-700 hidden sm:block"></div>
                <div className="flex items-center gap-4">
                    {userRole !== 'admin' && (
                        <button 
                             onClick={() => navigate('/pricing')}
                             className={`text-sm font-bold transition-all px-3 py-1.5 rounded-full border ${location.pathname === '/pricing' ? 'bg-brand-yellow text-black border-brand-yellow' : 'bg-transparent text-brand-yellow border-brand-yellow hover:bg-brand-yellow/10'}`}
                        >
                            {subscriptionTier === 'free' ? 'Upgrade' : 'Plans'}
                        </button>
                    )}

                    {userRole === 'admin' && (
                        <button 
                            onClick={() => navigate('/admin-dashboard')}
                            className={`text-sm font-bold transition-colors relative group ${location.pathname === '/admin-dashboard' ? 'text-brand-red' : 'text-slate-600 hover:text-brand-red dark:text-gray-300 dark:hover:text-brand-red'}`}
                        >{t('nav.admin')}<span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-red transition-all ${location.pathname === '/admin-dashboard' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </button>
                    )}
                    {(userRole === 'interviewer' || userRole === 'admin') && (
                        <button 
                            onClick={() => navigate('/interviewer-dashboard')}
                            className={`text-sm font-bold transition-colors relative group ${location.pathname === '/interviewer-dashboard' ? 'text-brand-purple' : 'text-slate-600 hover:text-brand-purple dark:text-gray-300 dark:hover:text-brand-purple'}`}
                        >{t('nav.candidates')}<span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-purple transition-all ${location.pathname === '/interviewer-dashboard' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </button>
                    )}

                    
                    <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1.5 mr-2">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Credits</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{tokens}</span>
                        {tokens <= 0 && <span className="text-[10px] font-bold bg-brand-red/10 text-brand-red px-1.5 rounded-sm">0</span>}
                    </div>
  <button 
                      onClick={() => navigate('/profile')} 
                      className={`text-sm font-medium transition-colors relative group ${location.pathname === '/profile' ? 'text-brand-blue' : 'text-slate-600 hover:text-brand-blue dark:text-gray-300 dark:hover:text-brand-blue'}`}
                    >{t('nav.profile')}<span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-blue transition-all ${location.pathname === '/profile' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </button>

                    <button 
                      onClick={toggleTheme} 
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 transition-colors duration-200 flex items-center justify-center"
                      aria-label="Toggle Theme"
                      id="theme-toggle"
                    >
                      {theme === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      )}
                    </button>
                    <select
                      className="bg-transparent border-none text-slate-600 dark:text-gray-300 text-sm font-medium focus:ring-0 cursor-pointer outline-none uppercase"
                      value={i18n.language.split('-')[0]}
                      onChange={(e) => i18n.changeLanguage(e.target.value)}
                    >
                      <option value="en" className="bg-white dark:bg-slate-800">EN</option>
                      <option value="fr" className="bg-white dark:bg-slate-800">FR</option>
                      <option value="es" className="bg-white dark:bg-slate-800">ES</option>
                    </select>

                    <button 
                      onClick={handleLogout} 
                      className="text-slate-600 hover:text-brand-red dark:text-gray-300 dark:hover:text-brand-red font-medium text-sm transition-colors relative group"
                    >
                      Log out
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-red transition-all group-hover:w-full"></span>
                    </button>
                </div>
              </div>
           </div>
         </header>
       )}
       
       <main className="w-full max-w-7xl mx-auto p-6 flex-grow flex items-center justify-center animate-fade-in">
         <Routes>
            {/* Public Routes */}
            <Route path="/" element={!session ? <LandingPage 
                onLogin={() => navigate('/auth')} 
                onSignup={() => navigate('/auth')} 
                onAbout={() => navigate('/about')} 
                onPrivacy={() => navigate('/privacy')}
                onTerms={() => navigate('/terms')}
                theme={theme}
                toggleTheme={toggleTheme}
              /> : <Navigate to="/dashboard" />} />
            <Route path="/auth" element={!session ? (
                <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-dark-bg w-full">
                    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                        <div className="absolute top-20 right-20 w-80 h-80 bg-brand-purple/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
                        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-brand-blue/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
                    </div>
                    <AuthScreen inviteToken={inviteToken} onBack={() => navigate('/')} />
                </div>
            ) : <Navigate to="/dashboard" />} />
            <Route path="/about" element={<AboutUs onBack={() => navigate('/')} />} />
            <Route path="/privacy" element={<PrivacyPolicy onBack={() => navigate('/')} />} />
            <Route path="/terms" element={<TermsOfService onBack={() => navigate('/')} />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={session ? <Dashboard onNavigate={(view) => {
                    if (view === 'dashboard') navigate('/dashboard');
                    else if (view === 'interview-setup') navigate('/interview/setup');
                    else navigate(`/${view}`);
                }} 
                userName={displayName} 
                isAdmin={userRole === 'admin'}
                pendingConfig={pendingInviteConfig}
                onStartAssigned={() => handleStartInterview(pendingInviteConfig!, false)}
                lastUsedConfig={lastUsedConfig}
                onStartLastUsed={() => lastUsedConfig && handleStartInterview(lastUsedConfig, false)}
            /> : <Navigate to="/auth" />} />
            
            <Route path="/interview/setup" element={session ? (
                pendingInviteConfig ? <Navigate to="/interview/session" replace /> : <InterviewSetup onStart={handleStartInterview} onBack={() => navigate('/dashboard')} />
            ) : <Navigate to="/auth" />} />
            
            <Route path="/interview/session" element={session ? (
                interviewConfig ? <InterviewScreen onEnd={handleEndInterview} config={interviewConfig} isPracticeMode={isPracticeMode} /> : <Navigate to="/dashboard" />
            ) : <Navigate to="/auth" />} />
            
            <Route path="/results" element={session ? (
                interviewConfig ? <EndScreen 
                   onRestart={handleRestart} 
                   transcription={finalTranscription} 
                   feedback={finalFeedback} 
                   config={interviewConfig} 
                   userEmail={session.user.email || ''} 
                   userId={session.user.id}
                   confidenceTrend={finalConfidenceTrend}
                 /> : <Navigate to="/dashboard" />
            ) : <Navigate to="/auth" />} />

            <Route path="/cv-builder" element={session ? <CVBuilder 
                onBack={() => { navigate('/dashboard'); setEditingCV(null); }} 
                initialData={editingCV?.data}
                cvId={editingCV?.id}
                subscriptionTier={subscriptionTier}
                isAdmin={userRole === 'admin'}
            /> : <Navigate to="/auth" />} />

            <Route path="/portfolio-builder" element={session ? <PortfolioBuilder
                onBack={() => { navigate('/dashboard'); setEditingPortfolio(null); }}
                initialData={editingPortfolio?.data}
                portfolioId={editingPortfolio?.id}
                subscriptionTier={subscriptionTier}
                isAdmin={userRole === 'admin'}
            /> : <Navigate to="/auth" />} />

            <Route path="/job-board" element={session ? <JobBoard onBack={() => navigate('/dashboard')} userRole={userRole} /> : <Navigate to="/auth" />} />

            <Route path="/motivation-letter" element={session ? <MotivationLetter onBack={() => navigate('/dashboard')} /> : <Navigate to="/auth" />} />
            
            <Route path="/profile" element={session ? <ProfileScreen 
                session={session} 
                onBack={() => navigate('/dashboard')} 
                onEditCV={handleEditCV}
                onEditPortfolio={handleEditPortfolio}
                onManagePlan={() => navigate('/pricing')}
            /> : <Navigate to="/auth" />} />

            <Route path="/pricing" element={session ? <PricingScreen 
                onBack={() => navigate('/dashboard')} 
                currentTier={subscriptionTier} 
                userId={session.user.id} 
                onUpgrade={handlePlanSelection} 
            /> : <Navigate to="/auth" />} />

            <Route path="/checkout" element={session ? (
                checkoutData ? <CheckoutScreen 
                    planId={checkoutData.plan}
                    planName={checkoutData.name}
                    price={checkoutData.price}
                    userId={session.user.id}
                    onBack={() => navigate('/pricing')}
                /> : <Navigate to="/pricing" />
            ) : <Navigate to="/auth" />} />

            <Route path="/payment-success" element={session ? <PaymentSuccessScreen 
                planName={checkoutData?.name || 'Pro Plan'} 
                onContinue={() => navigate('/dashboard')} 
            /> : <Navigate to="/auth" />} />

            <Route path="/admin-dashboard" element={session ? (
                userRole === 'admin' ? <AdminDashboard onBack={() => navigate('/dashboard')} /> : <Navigate to="/dashboard" />
            ) : <Navigate to="/auth" />} />

            <Route path="/interviewer-dashboard" element={session ? (
                userRole === 'interviewer' || userRole === 'admin' ? <InterviewerDashboard onBack={() => navigate('/dashboard')} userId={session.user.id} /> : <Navigate to="/dashboard" />
            ) : <Navigate to="/auth" />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
         </Routes>
       </main>
       
       <footer className="w-full py-6 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} prepareAI. All rights reserved.
       </footer>
       <CookieBanner />
    </div>
  );
};

export default App;
