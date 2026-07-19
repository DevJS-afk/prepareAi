const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function main() {
  const allEn = JSON.parse(fs.readFileSync('all_translations.json', 'utf-8'));
  const aboutUs = JSON.parse(fs.readFileSync('aboutus_i18n.json', 'utf-8'));
  
  Object.assign(allEn, aboutUs);
  
  // The original keys
  allEn.nav = {
    admin: 'Admin',
    candidates: 'Candidates',
    profile: 'Profile',
    signOut: 'Sign Out',
    signIn: 'Sign In'
  };
  allEn.landing = {
    login: 'Log In',
    getStarted: 'Get Started',
    heroTitle1: 'Interview practice',
    heroTitle2: 'reimagined.',
    heroSubtitle: 'Master your next technical or behavioral interview with an AI that listens, reacts, and coaches you in real-time. No scripts, just conversation.',
    startFree: 'Start Practicing Free',
    howItWorks: 'How it Works'
  };
  allEn.welcome = {
    title: 'Welcome',
    candidateSubtitle: 'You have been invited to complete a skill assessment. Please find your assigned interview below.',
    userSubtitle: 'Your comprehensive AI toolkit for career acceleration. Select an app to begin.',
    startAssigned: 'Start Assigned Interview',
    joinSession: 'Join Session',
    quickStart: 'Quick Start',
    resumeLast: 'Resume Last Interview',
    apps: 'Applications',
    mockInterview: 'Mock Interview',
    mockInterviewDesc: 'Practice with our AI interviewer.',
    cvBuilder: 'CV Builder',
    cvBuilderDesc: 'Create a professional resume.',
    portfolio: 'Portfolio',
    portfolioDesc: 'Showcase your work.',
    coverLetter: 'Cover Letter',
    coverLetterDesc: 'Generate tailored motivation letters.',
    jobBoard: 'Job Board',
    jobBoardDesc: 'Find AI-matched opportunities.'
  };

  // We need to translate this huge JSON to French and Spanish
  const promptFR = `
Translate the following JSON values to French. Keep the exact same structure and keys. Do not translate the keys.
If a value has HTML or <1> tags, keep the tags exactly the same.

${JSON.stringify(allEn, null, 2)}

Return ONLY the JSON. No markdown formatting or extra text.
`;

  const promptES = `
Translate the following JSON values to Spanish. Keep the exact same structure and keys. Do not translate the keys.
If a value has HTML or <1> tags, keep the tags exactly the same.

${JSON.stringify(allEn, null, 2)}

Return ONLY the JSON. No markdown formatting or extra text.
`;

  console.log('Translating to FR...');
  const resFR = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: promptFR,
    config: { responseMimeType: 'application/json' }
  });
  
  console.log('Translating to ES...');
  const resES = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: promptES,
    config: { responseMimeType: 'application/json' }
  });

  const allFr = JSON.parse(resFR.text);
  const allEs = JSON.parse(resES.text);
  
  fs.writeFileSync('fr_translations.json', JSON.stringify(allFr, null, 2));
  fs.writeFileSync('es_translations.json', JSON.stringify(allEs, null, 2));
  
  // Now we need to update i18n.ts
  
  const newI18nCode = `
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
const resources = {
  en: {
    translation: ${JSON.stringify(allEn, null, 6)}
  },
  fr: {
    translation: ${JSON.stringify(allFr, null, 6)}
  },
  es: {
    translation: ${JSON.stringify(allEs, null, 6)}
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
  `;
  
  fs.writeFileSync('src/i18n.ts', newI18nCode);
  console.log('Done merging translations!');
}

main().catch(console.error);
