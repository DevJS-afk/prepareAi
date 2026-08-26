import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginScreen from './LoginScreen';
import RegistrationScreen from './RegistrationScreen';

interface AuthScreenProps {
    inviteToken?: string | null;
    onBack: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ inviteToken, onBack }) => {
  const { t } = useTranslation();
  // If invite token exists, default to Registration screen
  const [showLogin, setShowLogin] = useState(!inviteToken);

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <button 
        onClick={onBack}
        className="self-start flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors px-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
        {t('AuthScreen.backToHome')}
      </button>

      <div className="flex flex-col items-center justify-center mb-2">
          <img src="/logo.png" alt="prepareAI logo" className="h-16 w-auto mb-2 drop-shadow-md" />
          <span className="font-display font-bold text-2xl text-slate-900 dark:text-white">prepareAI</span>
      </div>
      
      {showLogin ? (
        <LoginScreen onSwitchToRegister={() => setShowLogin(false)} />
      ) : (
        <RegistrationScreen 
            onSwitchToLogin={() => setShowLogin(true)} 
            inviteToken={inviteToken} 
        />
      )}
    </div>
  );
};

export default AuthScreen;