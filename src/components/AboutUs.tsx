import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

interface AboutUsProps {
  onBack: () => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col relative animate-fade-in text-slate-600 dark:text-gray-300">
      
      <nav className="w-full mx-auto pb-8 flex justify-between items-center z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors group font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            {t('AboutUs.back_to_home')}
        </button>
      </nav>

      <main className="flex-grow w-full relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-slate-900 dark:text-white font-display tracking-tight">{t('AboutUs.our_mission')}</h1>
          
          <div className="space-y-8 text-base text-slate-600 dark:text-gray-300 leading-relaxed">
              <p className="text-lg">
                  <Trans i18nKey="AboutUs.mission_intro">
                    At <strong className="text-brand-blue">prepareAI</strong>, we believe that everyone deserves the chance to land their dream job, regardless of their background or resources. 
                    The traditional interview process is often stressful, opaque, and intimidating. We set out to fundamentally change that paradigm by democratizing access to high-quality, personalized interview coaching. Our vision is a world where every candidate walks into an interview room with absolute confidence.
                  </Trans>
              </p>
              
              <div className="glass-panel p-8 md:p-10 rounded-2xl border border-brand-purple/30 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md shadow-xl my-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-brand-purple"></div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('AboutUs.why_we_built_this')}</h3>
                  <p className="mb-4">
                      {t('AboutUs.why_description_1', "Finding the right talent is equally challenging for companies. We saw a massive disconnect between talented individuals who struggle to showcase their skills under pressure, and recruiters who spend countless hours on initial screening calls without capturing the true potential of the candidates.")}
                  </p>
                  <p>
                      <Trans i18nKey="AboutUs.why_description_2">
                        By leveraging the incredible power of <strong className="text-slate-900 dark:text-white">Google's Gemini API</strong>, we've created an intelligent, adaptive interviewer that is available 24/7. It doesn't just ask generic questions; it actively listens to your tone, context, and technical depth. It evaluates your answers dynamically, adjusting its persona to challenge you safely, and provides actionable, real-time feedback to help you grow.
                      </Trans>
                  </p>
              </div>

              <div className="glass-panel p-8 md:p-10 rounded-2xl border border-brand-green/30 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md shadow-xl my-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-brand-green"></div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('AboutUs.save_time', "Empowering Careers")}</h3>
                  <p>
                      <Trans i18nKey="AboutUs.save_time_desc">
                        Our platform is built as a complete ecosystem for career acceleration. Whether you need to generate a tailored CV, write a compelling motivation letter, or practice a rigorous technical system design interview, <strong className="text-slate-900 dark:text-white">prepareAI</strong> is your all-in-one copilot. We aim to save time for both job seekers and companies, ensuring candidates are fully prepared and companies connect with the right talent faster.
                      </Trans>
                  </p>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white pt-8">{t('AboutUs.the_team')}</h2>
              <p>
                  <Trans i18nKey="AboutUs.team_description">
                    prepareAI is powered by a dedicated collective of engineers, designers, and AI researchers who are deeply passionate about education and career growth. We combine cutting-edge multimodal AI research with elegant, intuitive UI/UX design to create software that feels entirely frictionless and genuinely helpful.
                  </Trans>
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white pt-8">{t('AboutUs.technology')}</h2>
              <p>
                  <Trans i18nKey="AboutUs.tech_description">
                    Our platform is proudly built on the bleeding edge of modern web and AI technologies. 
                    We utilize <span className="text-brand-green font-mono">Gemini 2.5 Flash</span> for deep contextual reasoning and comprehensive feedback generation, seamlessly paired with the <span className="text-brand-blue font-mono">Live API</span> for low-latency, natural voice interaction. The architecture relies on robust cloud infrastructure, ensuring your data is secure and your interview experiences are fluid and uninterrupted.
                  </Trans>
              </p>
          </div>

          <div className="mt-16 text-center">
              <button onClick={onBack} className="px-8 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  {t('AboutUs.join_us') || "Join Us Today"}
              </button>
          </div>
      </main>
    </div>
  );
};

export default AboutUs;
