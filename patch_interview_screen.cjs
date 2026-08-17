const fs = require('fs');

let content = fs.readFileSync('src/components/InterviewScreen.tsx', 'utf8');

const fetchLogic = `
  const [activeConfig, setActiveConfig] = useState<InterviewConfig | null>(config || null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(!config);
  
  useEffect(() => {
      const fetchInviteConfig = async () => {
          if (config) {
              setActiveConfig(config);
              setIsLoadingConfig(false);
              return;
          }
          
          const searchParams = new URLSearchParams(window.location.search);
          const inviteId = searchParams.get('inviteId');
          
          if (!inviteId) {
              setIsLoadingConfig(false);
              return;
          }
          
          // Import supabase locally if not available globally
          const { supabase } = await import('../services/supabaseClient');
          if (supabase) {
              const { data, error } = await supabase.from('invites').select('config').eq('id', inviteId).single();
              if (data && data.config) {
                  setActiveConfig(data.config);
              }
          }
          setIsLoadingConfig(false);
      };
      
      fetchInviteConfig();
  }, [config]);

  if (isLoadingConfig) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-6">
              <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 dark:text-gray-400 font-medium animate-pulse">Loading interview...</p>
          </div>
      );
  }

  if (!activeConfig) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-6 text-center">
              <div>
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Interview Not Found</h2>
                  <p className="text-slate-600 dark:text-gray-400 mb-6">We couldn't load the requested interview configuration.</p>
                  <button onClick={() => window.location.href = '/dashboard'} className="btn-primary">Return to Dashboard</button>
              </div>
          </div>
      );
  }
`;

// Inject into InterviewScreen
content = content.replace(
    'const InterviewScreen: React.FC<InterviewScreenProps> = ({ onEnd, config, isPracticeMode }) => {\n  const { t } = useTranslation();',
    'const InterviewScreen: React.FC<InterviewScreenProps> = ({ onEnd, config, isPracticeMode }) => {\n  const { t } = useTranslation();\n' + fetchLogic
);

// We must also replace all references to `config` with `activeConfig` inside InterviewScreen.
// Fortunately, the useInterview hook uses `config`.
content = content.replace(
    'const { startInterview, stopInterview, status: aiStatus, transcription, feedback, volume } = useInterview({\n    config,\n    isPracticeMode\n  });',
    'const { startInterview, stopInterview, status: aiStatus, transcription, feedback, volume } = useInterview({\n    config: activeConfig,\n    isPracticeMode\n  });'
);

content = content.replace('config.name', 'activeConfig.name');
content = content.replace('config.persona', 'activeConfig.persona');

fs.writeFileSync('src/components/InterviewScreen.tsx', content);
console.log('InterviewScreen patched');
