import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import type { Session } from '../types';

interface InviteOnboardingProps {
    session: Session | null;
}

const InviteOnboarding: React.FC<InviteOnboardingProps> = ({ session }) => {
    const { inviteToken } = useParams<{ inviteToken: string }>();
    const navigate = useNavigate();
    
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleInvite = async () => {
            if (!inviteToken) {
                setError('Invalid invitation link.');
                
                return;
            }

            // 1. If not logged in, redirect to auth with the token
            if (!session) {
                navigate(`/auth?invite=${inviteToken}`, { replace: true });
                return;
            }

            // 2. If logged in, verify the invite matches their email
            if (supabase && session.user.email) {
                const { data: invite, error: fetchError } = await supabase
                    .from('invites')
                    .select('*')
                    .eq('token', inviteToken)
                    .single();

                if (fetchError || !invite) {
                    setError('Invitation not found or has expired.');
                    
                    return;
                }

                if (invite.email !== session.user.email) {
                    setError('This invitation was sent to a different email address.');
                    
                    return;
                }

                if (invite.status !== 'pending') {
                    setError('This interview has already been completed.');
                    
                    return;
                }

                // 3. Mark the invite as accepted and link the candidate ID
                await supabase
                    .from('invites')
                    .update({ status: 'accepted', candidate_id: session.user.id })
                    .eq('id', invite.id);

                // 4. Automatically redirect to the specific interview session
                navigate(`/interview/session?inviteId=${invite.id}`, { replace: true });
            }
        };

        handleInvite();
    }, [inviteToken, session, navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-6">
                <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-slate-600 dark:text-gray-400 mb-6">{error}</p>
                    <button onClick={() => navigate('/')} className="btn-primary w-full">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-bg p-6">
            <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 dark:text-gray-400 font-medium animate-pulse">Preparing your interview...</p>
        </div>
    );
};

export default InviteOnboarding;
