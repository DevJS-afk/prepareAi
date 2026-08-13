import React, { useState, useEffect } from 'react';
import { supabase } from '../services/firebaseClient';

interface RegistrationScreenProps {
  onSwitchToLogin: () => void;
  inviteToken?: string | null;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onSwitchToLogin, inviteToken }) => {
  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // If invite token is present, check validity and pre-fill email
  useEffect(() => {
      const checkInvite = async () => {
          if (!inviteToken || !supabase) return;
          const { data } = await supabase.from('invites').select('email').eq('token', inviteToken).eq('status', 'pending').maybeSingle();
          if (data) {
              setEmail(data.email);
          } else {
              setError("Invalid or expired invite link. You can still sign up as a normal user.");
          }
      };
      checkInvite();
  }, [inviteToken]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
              data: {
                  full_name: fullName,
                  birthday: birthday,
                  invite_token: inviteToken // Metadata to handle role assignment via Trigger (advanced) or manual update
              }
          }
      });
      if (error) throw error;

      if (data.user) {
         // Post-Registration Logic: Apply Role if Token Valid
         if (inviteToken) {
            const { data: inviteData } = await supabase.from('invites').select('*').eq('token', inviteToken).eq('status', 'pending').single();
            if (inviteData && inviteData.email === email) {
                // Update Profile Role
                await supabase.from('profiles').update({ role: 'candidate' }).eq('id', data.user.id);
                // Mark Invite Accepted AND Link Candidate ID
                await supabase.from('invites').update({ 
                    status: 'accepted',
                    candidate_id: data.user.id 
                }).eq('id', inviteData.id);
            }
         }

         if (data.user.identities && data.user.identities.length === 0) {
            setError('User already exists. Please try logging in.');
         } else {
            setMessage('Registration successful! Please check your email for a confirmation link.');
         }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!supabase) return;
    
    setError(null);
    setMessage(null);
    setLoading(true);

    const getRedirectUrl = () => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return window.location.origin;
        }
        return 'https://prepare-ai-six.vercel.app';
    };

    const redirectUrl = getRedirectUrl();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      const isPopupClosed = error?.message?.includes('popup-closed-by-user') || 
                           error?.message?.includes('cancelled-popup-request') || 
                           error?.code?.includes('popup-closed-by-user') || 
                           error?.code?.includes('cancelled-popup-request') ||
                           String(error).includes('popup-closed-by-user') ||
                           String(error).includes('cancelled-popup-request');
                           
      if (!isPopupClosed) {
         console.error("Google Signup Error:", error);
         setError(error?.message || String(error));
      }
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel w-full max-w-md rounded-2xl p-8 shadow-md dark:shadow-2xl animate-fade-in relative overflow-hidden border border-slate-200/80 dark:border-white/5">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-green to-brand-blue"></div>
      <h2 className="text-3xl font-bold mb-2 text-center text-slate-900 dark:text-white">
          {inviteToken ? 'Candidate Registration' : 'Create Account'}
      </h2>
      <p className="text-slate-500 dark:text-gray-400 mb-8 text-center text-sm">
        {inviteToken ? 'Accept your interview invitation.' : 'Start your journey to interview mastery.'}
      </p>
      <form onSubmit={handleRegister} className="w-full space-y-5">
        
        {/* Name Field */}
        <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 ml-1">Full Name</label>
            <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full bg-slate-100/80 dark:bg-black/20 text-slate-900 dark:text-white px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
            required
            />
        </div>

        {/* Birthday Field */}
        <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 ml-1">Date of Birth</label>
            <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full bg-slate-100/80 dark:bg-black/20 text-slate-900 dark:text-white px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
            required
            />
        </div>

        <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 ml-1">Email</label>
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full bg-slate-100/80 dark:bg-black/20 text-slate-900 dark:text-white px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
            required
            readOnly={!!inviteToken} // Lock email if invite token is present
            />
        </div>
        <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 ml-1">Password</label>
            <div className="relative">
                <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-100/80 dark:bg-black/20 text-slate-900 dark:text-white px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all pr-10"
                minLength={6}
                required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-white focus:outline-none"
                >
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
        
        {error && (
            <div className="w-full bg-brand-red/10 border border-brand-red/30 rounded-lg p-3 text-sm">
                <p className="text-brand-red font-semibold">Error</p>
                <p className="text-slate-700 dark:text-gray-300 text-xs mt-1">{error}</p>
                 {(error.includes('redirect') || error.toLowerCase().includes('google')) && (
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-2 p-2 bg-slate-200 dark:bg-black/20 rounded">
                        Ensure <code>https://prepare-ai-six.vercel.app</code> is in Supabase Redirect URLs.
                    </p>
                )}
            </div>
        )}
        {message && <p className="text-brand-green text-sm bg-brand-green/10 p-3 rounded border border-brand-green/20">{message}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-green hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-brand-green/25 focus:ring-4 focus:ring-brand-green/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : (inviteToken ? 'Accept & Join' : 'Sign Up')}
        </button>
      </form>

      {!inviteToken && (
          <>
            <div className="flex items-center w-full my-6">
                <div className="flex-grow h-px bg-slate-200 dark:bg-gray-700"></div>
                <span className="px-4 text-slate-400 dark:text-gray-500 text-xs font-medium uppercase">Or sign up with</span>
                <div className="flex-grow h-px bg-slate-200 dark:bg-gray-700"></div>
            </div>

            <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 font-bold py-3.5 px-4 rounded-xl border border-slate-200 dark:border-transparent transition-all focus:outline-none focus:ring-4 focus:ring-gray-500/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                />
                </svg>
                Google
            </button>
          </>
      )}

      <p className="text-slate-500 dark:text-gray-400 mt-8 text-sm text-center">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-brand-blue hover:text-blue-600 dark:hover:text-blue-300 font-semibold transition-colors">
          Log in
        </button>
      </p>
    </div>
  );
};

export default RegistrationScreen;
