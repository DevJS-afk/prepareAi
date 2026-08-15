import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col relative animate-fade-in text-slate-600 dark:text-gray-300">
      <nav className="w-full mx-auto pb-8 flex justify-between items-center z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors group font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Home
        </button>
      </nav>

      <main className="flex-grow w-full relative z-10">
        <h1 className="text-4xl font-extrabold mb-8 text-slate-900 dark:text-white font-display tracking-tight">Privacy Policy</h1>
        
        <div className="glass-panel p-8 md:p-12 rounded-2xl space-y-8 text-base leading-relaxed border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md shadow-xl">
          <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to prepareAI. We are committed to protecting your personal information and your right to privacy. 
              If you have any questions or concerns about our policy, or our practices with regards to your personal information, 
              please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">2. Information We Collect</h2>
            <p className="mb-4">We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, or otherwise when you contact us. This includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-800 dark:text-gray-200">Personal Info:</strong> Name, email address, passwords, and contact preferences.</li>
              <li><strong className="text-slate-800 dark:text-gray-200">Authentication Data:</strong> OAuth tokens if you sign in via Google.</li>
              <li><strong className="text-slate-800 dark:text-gray-200">Career Data:</strong> Resumes, cover letters, portfolios, job preferences, and audio/transcription data from interview sessions.</li>
              <li><strong className="text-slate-800 dark:text-gray-200">Usage Data:</strong> Information about how you navigate and use our application.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use personal information collected via our application for a variety of business purposes described below:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>To facilitate account creation and logon process.</strong></li>
              <li><strong>To provide and manage our AI services:</strong> Analyzing your resumes and generating interview questions via AI models.</li>
              <li><strong>To fulfill and manage your orders:</strong> Processing payments through Stripe for premium subscriptions.</li>
              <li><strong>To improve our services:</strong> Analyzing app usage to enhance user experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">4. Third-Party Services and AI</h2>
            <p className="mb-4">We share certain data with trusted third-party providers strictly to enable application features:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-800 dark:text-gray-200">Google Gemini / AI Models:</strong> Transcription and interview context may be sent to Google Gemini APIs to generate realistic interview responses. We do not use your personal data to train public AI models.</li>
              <li><strong className="text-slate-800 dark:text-gray-200">Supabase:</strong> Used for secure database storage, file storage (avatars, PDFs), and authentication.</li>
              <li><strong className="text-slate-800 dark:text-gray-200">Stripe:</strong> Used for secure payment processing. We do not store your full credit card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">5. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. 
              However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">6. Your Privacy Rights</h2>
            <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information, such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to request access and obtain a copy of your personal information.</li>
              <li>The right to request rectification or erasure of your data.</li>
              <li>The right to restrict the processing of your personal information.</li>
              <li>The right to data portability.</li>
            </ul>
            <p className="mt-4">To exercise any of these rights, please contact us or delete your account directly from your Profile settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">7. Updates to This Policy</h2>
            <p>
              We may update this privacy notice from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible. 
              We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">8. Contact Us</h2>
            <p>
              If you have questions or comments about this notice, you may email us at <a href="mailto:support@prepareai.com" className="text-brand-blue hover:underline">support@prepareai.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
