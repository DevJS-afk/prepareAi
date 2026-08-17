import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w20/gb.png' },
  { code: 'fr', label: 'Français', flag: 'https://flagcdn.com/w20/fr.png' },
  { code: 'es', label: 'Español', flag: 'https://flagcdn.com/w20/es.png' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const currentLangCode = i18n.language.split('-')[0];
  const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors duration-200"
        title={currentLang.label}
      >
        <img src={currentLang.flag} alt={currentLang.label} className="w-5 h-auto rounded-[2px] shadow-sm" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden border border-slate-100 dark:border-white/5 animate-fade-in origin-top-right transform transition-all">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${currentLangCode === lang.code ? 'bg-slate-50 dark:bg-slate-700/50 text-brand-blue font-semibold' : 'text-slate-700 dark:text-gray-300 font-medium'}`}
              >
                <img src={lang.flag} alt={lang.label} className="w-5 h-auto rounded-[2px] shadow-sm" />
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
