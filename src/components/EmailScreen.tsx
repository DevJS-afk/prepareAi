import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

interface EmailScreenProps {
  onContinue: (email: string) => void;
}

const EmailScreen: React.FC<EmailScreenProps> = ({ onContinue }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!email) {
      setError(t('EmailScreen.errorRequired'));
      return;
    }
    // Simple regex for email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('EmailScreen.errorInvalid'));
      return;
    }
    setError('');
    onContinue(email);
  };

  return (
    <div className="w-full max-w-md bg-light-bg rounded-lg shadow-xl p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-center">{t('EmailScreen.welcome')}</h2>
      <p className="text-gray-300 mb-6 text-center">
        {t('EmailScreen.description')}
      </p>
      <div className="w-full">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('EmailScreen.emailPlaceholder')}
          className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          aria-label={t('EmailScreen.emailLabel')}
        />
        {error && <p className="text-brand-red mt-2 text-sm">{error}</p>}
      </div>
      <button
        onClick={handleContinue}
        className="mt-6 w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
      >
        {t('EmailScreen.continue')}
      </button>
    </div>
  );
};

export default EmailScreen;