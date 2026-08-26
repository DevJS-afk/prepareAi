import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-white/5 py-8 mt-auto text-slate-500 dark:text-gray-400 text-sm relative z-10 bg-slate-50 dark:bg-black/20 backdrop-blur-md">
        <div className="mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <img src="/logo.png" alt="prepareAI logo" className="h-6 w-auto opacity-80" />
                <span className="font-display font-bold text-slate-900 dark:text-white opacity-90">prepareAI</span>
                <span className="ml-2 text-xs">&copy; {new Date().getFullYear()}. Built by DevJs.</span>
            </div>
            <div className="flex gap-6">
                <button onClick={() => navigate('/about')} className="hover:text-slate-900 dark:hover:text-white transition-colors">About</button>
                <button onClick={() => navigate('/privacy')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</button>
                <button onClick={() => navigate('/terms')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</button>
                <button onClick={() => navigate('/changelog')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Changelog</button>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
