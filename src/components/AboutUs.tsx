import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

interface AboutUsProps {
  onBack: () => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden animate-fade-in bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
        
      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            {t('AboutUs.back_to_home')}
        </button>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 text-slate-900 dark:text-white relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">{t('AboutUs.our_mission')}</h1>
          
          <div className="space-y-8 text-lg text-slate-600 dark:text-gray-300 leading-relaxed">
              <p>
                  <Trans i18nKey="AboutUs.mission_intro">
                    At <strong className="text-brand-blue">prepareAI</strong>, we believe that everyone deserves the chance to land their dream job. 
                    The interview process is often stressful, opaque, and intimidating. We set out to change that by democratizing access to high-quality interview coaching.
                  </Trans>
              </p>
              
              <div className="glass-panel p-8 rounded-2xl border-l-4 border-brand-purple my-10">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('AboutUs.why_we_built_this')}</h3>
                  <p className="mb-4">
                      {t('AboutUs.why_description_1')}
                  </p>
                  <p>
                      <Trans i18nKey="AboutUs.why_description_2">
                        By leveraging the power of <strong className="text-slate-900 dark:text-white">Google's Gemini 2.0 API</strong>, we've created an intelligent, adaptive interviewer that is available 24/7. It doesn't just ask questions; it listens to your tone, evaluates your answers, and provides actionable feedback to help you grow.
                      </Trans>
                  </p>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white pt-8">{t('AboutUs.the_team')}</h2>
              <p>
                  <Trans i18nKey="AboutUs.team_description">
                    prepareAI is powered by <strong className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-red">DevJs</strong>, a team of passionate developers dedicated to building tools that empower individuals. We combine cutting-edge AI research with intuitive UX design to create software that feels like magic.
                  </Trans>
              </p>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white pt-8">{t('AboutUs.technology')}</h2>
              <p>
                  <Trans i18nKey="AboutUs.tech_description">
                    Our platform utilizes the latest advancements in multimodal AI. 
                    We use <span className="text-brand-green font-mono">Gemini 2.5 Flash</span> for reasoning and feedback generation, and the <span className="text-brand-blue font-mono">Live API</span> for low-latency, natural voice interaction.
                  </Trans>
              </p>
          </div>

          <div className="mt-16 text-center">
              <button onClick={onBack} className="px-8 py-3 bg-slate-900 text-white dark:bg-white dark:text-black font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors shadow-md">
                  {t('AboutUs.join_us')}
              </button>
          </div>
      </main>
    </div>
  );
};

export default AboutUs;