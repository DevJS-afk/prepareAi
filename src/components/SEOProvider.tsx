import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeMetaMap: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Home',
    description: 'prepareAI is an advanced, AI-powered interview practice platform that provides realistic mock interviews, real-time feedback, and career document generation to help you land your dream job.',
  },
  '/auth': {
    title: 'Sign In',
    description: 'Join prepareAI to practice interviews with AI and build your career portfolio.',
  },
  '/about': {
    title: 'About Us',
    description: 'Learn about the prepareAI mission to democratize interview coaching using advanced AI.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'Read our privacy policy to understand how we protect your data.',
  },
  '/terms': {
    title: 'Terms of Service',
    description: 'Read our terms of service and acceptable use policy.',
  },
  '/dashboard': {
    title: 'Dashboard',
    description: 'Access your interview history, documents, and upcoming sessions.',
  },
  '/interview/setup': {
    title: 'Setup Interview',
    description: 'Configure your next AI interview session.',
  },
  '/interview/session': {
    title: 'Live Interview',
    description: 'Your live AI interview session.',
  },
  '/results': {
    title: 'Interview Results',
    description: 'Review your performance, transcription, and feedback.',
  },
  '/cv-builder': {
    title: 'Resume Builder',
    description: 'Create ATS-friendly resumes tailored to your dream job.',
  },
  '/portfolio-builder': {
    title: 'Portfolio Builder',
    description: 'Build a stunning career portfolio to showcase your work.',
  },
  '/job-board': {
    title: 'Job Board',
    description: 'Discover tailored job opportunities and track your applications.',
  },
  '/motivation-letter': {
    title: 'Cover Letter Builder',
    description: 'Generate dynamic, tailored cover letters.',
  },
  '/profile': {
    title: 'Your Profile',
    description: 'Manage your account, preferences, and career documents.',
  },
  '/pricing': {
    title: 'Pricing',
    description: 'Explore our plans for individuals and enterprise teams.',
  },
  '/checkout': {
    title: 'Checkout',
    description: 'Complete your prepareAI subscription.',
  },
  '/payment-success': {
    title: 'Payment Successful',
    description: 'Your payment was successful.',
  },
  '/admin-dashboard': {
    title: 'Admin Dashboard',
    description: 'Manage users and system configurations.',
  },
  '/interviewer-dashboard': {
    title: 'Interviewer Dashboard',
    description: 'Manage candidate interviews and reviews.',
  },
};

const SEOProvider: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const meta = routeMetaMap[location.pathname] || {
      title: 'prepareAI',
      description: 'Your Intelligent Interview Coaching Platform',
    };

    document.title = meta.title === 'prepareAI' ? meta.title : `${meta.title} | prepareAI`;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', meta.description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', meta.description);
      document.head.appendChild(metaDescription);
    }

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', meta.description);
    }
    
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', document.title);
    }
  }, [location.pathname]);

  return null;
};

export default SEOProvider;
