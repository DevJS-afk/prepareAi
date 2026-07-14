
import React, { useState, useCallback, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { InterviewStatus, InterviewConfig, TranscriptionEntry, FeedbackEntry, SavedCV, SavedPortfolio, Role, SubscriptionTier } from './types';
import { supabase } from './services/supabaseClient';
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Authenticated App State
  const [_interviewStatus, setInterviewStatus] = useState<InterviewStatus>(InterviewStatus.NotStarted);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [finalTranscription, setFinalTranscription] = useState<TranscriptionEntry[]>([]);
  const [finalFeedback, setFinalFeedback] = useState<FeedbackEntry[]>([]);
  const [isDesktop, setIsDesktop] = useState(true);
  
  // Role & Limits
  const [userRole, setUserRole] = useState<Role>('user');
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [sessionCount, setSessionCount] = useState(0);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [pendingInviteConfig, setPendingInviteConfig] = useState<InterviewConfig | null>(null);
  
  // User Display Info
  const [displayName, setDisplayName] = useState<string>('');

  // State for CV Editing
  const [editingCV, setEditingCV] = useState<SavedCV | null>(null);
  // State for Portfolio Editing
  const [editingPortfolio, setEditingPortfolio] = useState<SavedPortfolio | null>(null);

  // State for Checkout
  const [checkoutData, setCheckoutData] = useState<{ plan: SubscriptionTier; price: string; name: string } | null>(null);

  // Check for desktop screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
            const { data: profile } = await supabase!.from('profiles').select('role, is_admin, subscription_tier, email, full_name, avatar_url').eq('id', uid).maybeSingle();
            
            // Extract Metadata from Google Login
            const metaName = userMetadata?.full_name || userMetadata?.name;
            const metaAvatar = userMetadata?.avatar_url || userMetadata?.picture;

            // Determine Display Name (Profile > Metadata > Email)
            const resolvedName = profile?.full_name || metaName || email || '';
            setDisplayName(resolvedName);

            let currentRole: Role = 'user';
            
            if (profile) {
                 // SYNC LOGIC: Check if profile is missing info that we have in metadata
                 const updates: any = {};
                 let needsUpdate = false;

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
                 if (profile.is_admin || profile.role === 'admin') {
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
                        role: 'user',
                        full_name: metaName || '',
                        avatar_url: metaAvatar || ''
                    });
                } catch (insertErr: any) {
                    if (insertErr.code === '42703') {
                         await supabase!.from('profiles').insert({ id: uid, role: 'user', email: email || '' });
                    }
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

        } catch (e) {
            console.error("Error fetching user data", e);
        }
    };

    supabase!.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
          const initialName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email || '';
          setDisplayName(initialName);
          fetchUserData(session.user.id, session.user.email, session.user.user_metadata);
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
          fetchUserData(session.user.id, session.user.email, session.user.user_metadata);
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
    if (userRole !== 'admin' && userRole !== 'candidate' && subscriptionTier === 'free' && !practiceMode && sessionCount >= 1) {
        alert("Free Plan Limit Reached: You have used your 1 free interview session. Please upgrade to Pro for unlimited sessions or use 'Practice Mode'.");
        navigate('/pricing');
        return;
    }

    setInterviewConfig(selectedConfig);
    setIsPracticeMode(practiceMode);
    setInterviewStatus(InterviewStatus.InProgress);
    navigate('/interview/session');
  }, [userRole, subscriptionTier, sessionCount, navigate]);

  const handleEndInterview = useCallback((transcription: TranscriptionEntry[], feedback: FeedbackEntry[]) => {
    if (isPracticeMode) {
      setInterviewStatus(InterviewStatus.NotStarted);
      setInterviewConfig(null);
      navigate('/dashboard');
    } else {
      setFinalTranscription(transcription);
      setFinalFeedback(feedback);
      setInterviewStatus(InterviewStatus.Finished);
      navigate('/results');
      setSessionCount(prev => prev + 1); 
    }
  }, [isPracticeMode, navigate]);

  const handleRestart = useCallback(() => {
    setInterviewStatus(InterviewStatus.NotStarted);
    setInterviewConfig(null);
    setFinalTranscription([]);
    setFinalFeedback([]);
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

  if (!isDesktop) {
    return (
        <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="glass-panel w-full max-w-md rounded-2xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
                <h1 className="text-2xl font-bold text-white mb-3">Desktop Experience</h1>
                <p className="text-gray-300">Please access <strong>prepareAI</strong> on a desktop computer for the full interview simulation.</p>
            </div>
        </div>
    );
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center bg-dark-bg">
       {/* Global Background Elements */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-blue/30 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-20 w-80 h-80 bg-brand-purple/30 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-brand-green/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
       </div>

       {/* Header - Only show if not on public pages (except auth maybe?) or if logged in */}
       {session && (
         <header className="w-full sticky top-0 z-50 backdrop-blur-xl bg-dark-bg/60 border-b border-white/5 shadow-lg">
           <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-blue blur-lg opacity-40 rounded-full"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="relative h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5 2.5L9 4 6.5 11.5 0 14l6.5 2.5L9 24l2.5-7.5L18 14l-6.5-2.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none">
                      prepare<span className="text-brand-blue">AI</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                        {userRole === 'admin' ? 'Admin Mode' : userRole === 'interviewer' ? 'Recruiter Mode' : userRole === 'candidate' ? 'Candidate Mode' : (subscriptionTier === 'pro' ? 'Pro Plan' : 'Free Tier')}
                    </p>
                  </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-gray-300 text-sm font-medium">{session.user.email}</p>
                </div>
                <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>
                <div className="flex gap-4">
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
                            className={`text-sm font-bold transition-colors relative group ${location.pathname === '/admin-dashboard' ? 'text-brand-red' : 'text-gray-300 hover:text-brand-red'}`}
                        >
                            Admin
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-red transition-all ${location.pathname === '/admin-dashboard' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </button>
                    )}
                    {(userRole === 'interviewer' || userRole === 'admin') && (
                        <button 
                            onClick={() => navigate('/interviewer-dashboard')}
                            className={`text-sm font-bold transition-colors relative group ${location.pathname === '/interviewer-dashboard' ? 'text-brand-purple' : 'text-gray-300 hover:text-brand-purple'}`}
                        >
                            Candidates
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-purple transition-all ${location.pathname === '/interviewer-dashboard' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </button>
                    )}

                    <button 
                      onClick={() => navigate('/profile')} 
                      className={`text-sm font-medium transition-colors relative group ${location.pathname === '/profile' ? 'text-brand-blue' : 'text-gray-300 hover:text-brand-blue'}`}
                    >
                        Profile
                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-blue transition-all ${location.pathname === '/profile' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className="text-gray-300 hover:text-brand-red font-medium text-sm transition-colors relative group"
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
              /> : <Navigate to="/dashboard" />} />
            <Route path="/auth" element={!session ? (
                <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-dark-bg w-full">
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
            <Route path="/dashboard" element={session ? <Dashboard 
                onNavigate={(view) => {
                    if (view === 'dashboard') navigate('/dashboard');
                    else if (view === 'interview-setup') navigate('/interview/setup');
                    else navigate(`/${view}`);
                }} 
                userName={displayName} 
                isAdmin={userRole === 'admin'}
                pendingConfig={pendingInviteConfig}
                onStartAssigned={() => handleStartInterview(pendingInviteConfig!, false)}
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
