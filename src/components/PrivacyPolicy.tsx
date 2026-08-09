
import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden animate-fade-in text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <nav className="w-full mx-auto px-6 py-6 flex justify-between items-center z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Home
        </button>
      </nav>

      <main className="flex-grow mx-auto px-6 py-12 relative z-10">
          <h1 className="text-4xl font-extrabold mb-8 text-slate-900 dark:text-white font-display">Privacy Policy</h1>
          <div className="glass-panel p-8 md:p-12 rounded-2xl space-y-8 text-sm leading-relaxed border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-black/20">
              <p className="text-slate-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">1. Introduction</h2>
                  <p>Welcome to prepareAI ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
              </section>

              <section>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">2. Data We Collect</h2>
                  <p className="mb-2">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-gray-400">
                      <li><strong className="text-slate-800 dark:text-gray-200">Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                      <li><strong className="text-slate-800 dark:text-gray-200">Contact Data:</strong> includes email address.</li>
                      <li><strong className="text-slate-800 dark:text-gray-200">Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                      <li><strong className="text-slate-800 dark:text-gray-200">Usage Data:</strong> includes information about how you use our website, products and services (e.g., interview transcripts, CV data).</li>
                  </ul>
              </section>

              <section>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">3. How We Use Your Data</h2>
                  <p className="mb-2">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-gray-400">
                      <li>To provide the AI interview simulation service.</li>
                      <li>To process your subscription and manage your account.</li>
                      <li>To improve our website, products/services, marketing, customer relationships and experiences.</li>
                  </ul>
              </section>

              <section>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">4. AI Processing</h2>
                  <p>Our service utilizes Google Gemini API for generating interview questions, analyzing audio/video input, and providing feedback. By using our service, you acknowledge that your inputs (text, audio) are processed by these third-party AI models to generate responses.</p>
              </section>

              <section>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">5. Data Security</h2>
                  <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
              </section>
          </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
