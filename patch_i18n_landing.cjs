const fs = require('fs');
let content = fs.readFileSync('src/i18n.ts', 'utf-8');

const resourcesStr = `const resources = {
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
      }
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
        userSubtitle: 'Votre boîte à outils d\\'IA complète pour l\\'accélération de carrière. Sélectionnez une application pour commencer.',
        startAssigned: 'Démarrer l\\'entretien assigné',
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
        jobBoard: 'Offres d\\'emploi',
        jobBoardDesc: 'Trouvez des opportunités avec l\\'IA.'
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
};`;

content = content.replace(/const resources = {[\s\S]*?};\n/, resourcesStr + '\n');
fs.writeFileSync('src/i18n.ts', content);
console.log('Patched i18n.ts');
