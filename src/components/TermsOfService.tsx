
import React from 'react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden animate-fade-in text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <nav className="w-full mx-auto px-6 py-6 flex justify-between items-center z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Home
        </button>
      </nav>

      <main className="flex-grow mx-auto px-6 py-12 relative z-10">
          <h1 className="text-4xl font-extrabold mb-8 text-slate-900 dark:text-white font-display">Terms of Service</h1>
          <div className="glass-panel p-8 md:p-12 rounded-2xl space-y-8 text-sm leading-relaxed border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-black/20">
              <p className="text-slate-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">1. Agreement to Terms</h2>
                  <p>By accessing our website and using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.</p>
              </section>

              <section>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">2. Description of Service</h2>
                  <p>prepareAI provides an AI-powered interview practice platform. We offer simulation tools, feedback reports, and document builders. We reserve the right to modify, suspend, or discontinue the service at any time.</p>
              </section>

              <section>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">3. User Accounts</h2>
                  <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>
              </section>

              <section>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">4. Acceptable Use</h2>
                  <p>You agree not to misuse the Service. You must not interfere with our services or try to access them using a method other than the interface and the instructions that we provide.</p>
              </section>

              <section>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">5. Limitation of Liability</h2>
                  <p>To the maximum extent permitted by law, prepareAI shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues.</p>
              </section>
              
              <section>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">6. Changes to Terms</h2>
                  <p>We reserve the right to modify these terms at any time. We will always post the most current version on our website. By continuing to use the service after changes become effective, you agree to be bound by the revised terms.</p>
              </section>
          </div>
      </main>
    </div>
  );
};

export default TermsOfService;
