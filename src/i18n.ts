import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
const resources = {
  en: {
    translation: {
      nav: {
        admin: 'Admin',
        candidates: 'Candidates',
        profile: 'Profile',
        signOut: 'Sign Out',
        signIn: 'Sign In'
      },
      landing: {
        login: 'Log In',
        getStarted: 'Get Started',
        heroTitle1: 'Interview practice',
        heroTitle2: 'reimagined.',
        heroSubtitle: 'Master your next technical or behavioral interview with an AI that listens, reacts, and coaches you in real-time. No scripts, just conversation.',
        startFree: 'Start Practicing Free',
        howItWorks: 'How it Works'
      },
      welcome: {
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
      },

      InterviewScreen: {
        ready_to_begin: 'Ready to Begin',
        fullscreen_instruction: 'To ensure a distraction-free environment and realistic experience, the interview will take place in <1>Fullscreen Mode</1>.',
        enter_studio_start: 'Enter Studio & Start',
        live_session: 'Live Session',
        standby: 'Standby',
        paused_session: 'Session Paused',
        paused_instruction: 'Your interview is currently paused.',
        paused_keyboard_hint: 'Press Esc again to resume',
        resume_session: 'Resume Session',
        you_label: 'You',
        rec_indicator: 'REC',
        engagement_feedback_active: 'Engagement & Feedback Active',
        live_transcript: 'Live Transcript',
        conversation_placeholder: 'Conversation will appear here once the interview starts...',
        analysis_stream: 'Analysis Stream',
        feedback_placeholder: 'Real-time feedback and analysis will appear here during the interview...',
        feedback_label: 'Feedback',
        neural_link_loading: 'Neural link established. Awaiting input...',
        record_session: 'Record Session',
        stop_recording: 'Stop Recording',
        saving: 'Saving...',
        end_interview: 'End Interview',
        abort: 'Abort',
        retry: 'Retry',
        connection_interrupted: 'Connection Interrupted',
        analyzing_mind: 'Analyzing',
        awaiting_speech: 'Awaiting Speech',
        transmitting_voice: 'Transmitting',
        finalizing: 'Finalizing...',
        persona_sarah_name: 'Sarah',
        persona_sarah_title: 'Friendly Recruiter',
        persona_marcus_name: 'Marcus',
        persona_marcus_title: 'Technical Lead',
        persona_sophia_name: 'Sophia',
        persona_sophia_title: 'Hiring Manager'
      },
      EmotionTracker: {
        kinesics_analytics: 'Kinesics Analytics',
        status_active: 'Active',
        status_recording: 'Recording',
        confidence_score: 'Confidence Score',
        stable: 'Stable',
        engagement_level: 'Engagement Level',
        active: 'Active',
        postural_stance: 'Postural Stance',
        engagement_sparkline: 'Engagement Sparkline',
        motion_spark: 'Motion Spark',
        awaiting_signal: 'Awaiting signal...',
        state_focused_label: 'Focused',
        state_focused_desc: 'Eye contact maintained, stable posture.',
        state_calm_label: 'Calm',
        state_calm_desc: 'Relaxed stance, low erratic motion.',
        state_expressive_label: 'Expressive',
        state_expressive_desc: 'High hand movement, animated expressions.',
        state_reflective_label: 'Reflective',
        state_reflective_desc: 'Gaze diverted, thinking posture.',
        state_fidgety_label: 'Fidgety',
        state_fidgety_desc: 'High minor movements, postural shifts.'
      },

    }
  },
  fr: {
    translation: {
      nav: {
        admin: 'Administrateur',
        candidates: 'Candidats',
        profile: 'Profil',
        signOut: 'Se déconnecter',
        signIn: 'Se connecter'
      },
      landing: {
        login: 'Connexion',
        getStarted: 'Commencer',
        heroTitle1: 'Pratique des entretiens',
        heroTitle2: 'réinventée.',
        heroSubtitle: 'Maîtrisez votre prochain entretien avec une IA qui écoute, réagit et vous coache en temps réel.',
        startFree: 'Commencer Gratuitement',
        howItWorks: 'Comment ça marche'
      },
      welcome: {
        title: 'Bienvenue',
        candidateSubtitle: 'Vous avez été invité à passer une évaluation de compétences. Veuillez trouver votre entretien assigné ci-dessous.',
        userSubtitle: 'Votre boîte à outils d\'IA complète pour l\'accélération de carrière. Sélectionnez une application pour commencer.',
        startAssigned: 'Démarrer l\'entretien assigné',
        joinSession: 'Rejoindre la session',
        quickStart: 'Démarrage rapide',
        resumeLast: 'Reprendre le dernier entretien',
        apps: 'Applications',
        mockInterview: 'Entretien blanc',
        mockInterviewDesc: 'Entraînez-vous avec notre IA.',
        cvBuilder: 'Créateur de CV',
        cvBuilderDesc: 'Créez un CV professionnel.',
        portfolio: 'Portfolio',
        portfolioDesc: 'Présentez votre travail.',
        coverLetter: 'Lettre de motivation',
        coverLetterDesc: 'Générez des lettres sur mesure.',
        jobBoard: 'Offres d\'emploi',
        jobBoardDesc: 'Trouvez des opportunités avec l\'IA.'
      }
    }
  },
  es: {
    translation: {
      nav: {
        admin: 'Administrador',
        candidates: 'Candidatos',
        profile: 'Perfil',
        signOut: 'Cerrar sesión',
        signIn: 'Iniciar sesión'
      },
      landing: {
        login: 'Iniciar Sesión',
        getStarted: 'Empezar',
        heroTitle1: 'Práctica de entrevistas',
        heroTitle2: 'reinventada.',
        heroSubtitle: 'Domina tu próxima entrevista con una IA que escucha, reacciona y te entrena en tiempo real.',
        startFree: 'Empezar Gratis',
        howItWorks: 'Cómo funciona'
      },
      welcome: {
        title: 'Bienvenido',
        candidateSubtitle: 'Has sido invitado a completar una evaluación de habilidades. Encuentra tu entrevista asignada a continuación.',
        userSubtitle: 'Tu completo conjunto de herramientas de IA para la aceleración profesional. Selecciona una aplicación para comenzar.',
        startAssigned: 'Iniciar Entrevista Asignada',
        joinSession: 'Unirse a la Sesión',
        quickStart: 'Inicio Rápido',
        resumeLast: 'Reanudar última entrevista',
        apps: 'Aplicaciones',
        mockInterview: 'Simulacro de Entrevista',
        mockInterviewDesc: 'Practica con nuestra IA.',
        cvBuilder: 'Creador de CV',
        cvBuilderDesc: 'Crea un currículum profesional.',
        portfolio: 'Portafolio',
        portfolioDesc: 'Muestra tu trabajo.',
        coverLetter: 'Carta de Motivación',
        coverLetterDesc: 'Genera cartas a medida.',
        jobBoard: 'Bolsa de Trabajo',
        jobBoardDesc: 'Encuentra oportunidades con IA.'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    parseMissingKeyHandler: (key) => {
      const parts = key.split('.');
      const lastPart = parts[parts.length - 1];
      const spaced = lastPart.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2').replace(/_/g, ' ').trim();
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    },
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
