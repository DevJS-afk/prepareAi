import React, { useState, useEffect } from 'react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Small delay for smooth entrance animation
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-0 w-full z-[60] px-4 md:px-6 pointer-events-none">
      <div className="max-w-5xl mx-auto bg-white/95 dark:bg-[#0f1115]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-lg dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pointer-events-auto animate-slide-up ring-1 ring-slate-100 dark:ring-white/5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
             <span className="text-xl">🍪</span>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">We use cookies</h3>
          </div>
          <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed max-w-2xl">
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies. 
            <a href="#" className="text-brand-blue hover:underline ml-1">Read our Cookie Policy</a>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button 
            onClick={handleDecline}
            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl transition-all"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-8 py-2.5 bg-brand-blue hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-blue/20"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
