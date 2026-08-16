const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import RouteMeta")) {
    content = content.replace("import Dashboard from './components/WelcomeScreen';", "import RouteMeta from './components/RouteMeta';\nimport Dashboard from './components/WelcomeScreen';");
}

const replacements = [
    {
        route: '<LandingPage',
        meta: '<RouteMeta title="Home" description="prepareAI is an advanced, AI-powered interview practice platform that provides realistic mock interviews, real-time feedback, and career document generation to help you land your dream job." />\n                <LandingPage'
    },
    {
        route: '<AuthScreen',
        meta: '<RouteMeta title="Sign In" description="Join prepareAI to practice interviews with AI and build your career portfolio." />\n                    <AuthScreen'
    },
    {
        route: '<AboutUs',
        meta: '<><RouteMeta title="About Us" description="Learn about the prepareAI mission to democratize interview coaching using advanced AI." /><AboutUs'
    },
    {
        route: '<PrivacyPolicy',
        meta: '<><RouteMeta title="Privacy Policy" description="Read our privacy policy to understand how we protect your data." /><PrivacyPolicy'
    },
    {
        route: '<TermsOfService',
        meta: '<><RouteMeta title="Terms of Service" description="Read our terms of service and acceptable use policy." /><TermsOfService'
    },
    {
        route: '<Dashboard',
        meta: '<><RouteMeta title="Dashboard" description="Access your interview history, documents, and upcoming sessions." /><Dashboard'
    },
    {
        route: '<InterviewSetup',
        meta: '<><RouteMeta title="Setup Interview" description="Configure your next AI interview session." /><InterviewSetup'
    },
    {
        route: '<InterviewScreen',
        meta: '<><RouteMeta title="Live Interview" description="Your live AI interview session." /><InterviewScreen'
    },
    {
        route: '<EndScreen',
        meta: '<><RouteMeta title="Interview Results" description="Review your performance, transcription, and feedback." /><EndScreen'
    },
    {
        route: '<CVBuilder',
        meta: '<><RouteMeta title="Resume Builder" description="Create ATS-friendly resumes tailored to your dream job." /><CVBuilder'
    },
    {
        route: '<PortfolioBuilder',
        meta: '<><RouteMeta title="Portfolio Builder" description="Build a stunning career portfolio to showcase your work." /><PortfolioBuilder'
    },
    {
        route: '<JobBoard',
        meta: '<><RouteMeta title="Job Board" description="Discover tailored job opportunities and track your applications." /><JobBoard'
    },
    {
        route: '<MotivationLetter',
        meta: '<><RouteMeta title="Cover Letter Builder" description="Generate dynamic, tailored cover letters." /><MotivationLetter'
    },
    {
        route: '<ProfileScreen',
        meta: '<><RouteMeta title="Your Profile" description="Manage your account, preferences, and career documents." /><ProfileScreen'
    },
    {
        route: '<PricingScreen',
        meta: '<><RouteMeta title="Pricing" description="Explore our plans for individuals and enterprise teams." /><PricingScreen'
    },
    {
        route: '<CheckoutScreen',
        meta: '<><RouteMeta title="Checkout" description="Complete your prepareAI subscription." /><CheckoutScreen'
    },
    {
        route: '<PaymentSuccessScreen',
        meta: '<><RouteMeta title="Payment Successful" description="Your payment was successful." /><PaymentSuccessScreen'
    },
    {
        route: '<AdminDashboard',
        meta: '<><RouteMeta title="Admin Dashboard" description="Manage users and system configurations." /><AdminDashboard'
    },
    {
        route: '<InterviewerDashboard',
        meta: '<><RouteMeta title="Interviewer Dashboard" description="Manage candidate interviews and reviews." /><InterviewerDashboard'
    }
];

// We need to close the fragments for inline single components: AboutUs, PrivacyPolicy, TermsOfService, JobBoard, MotivationLetter, AdminDashboard, InterviewerDashboard, PaymentSuccessScreen
const closures = [
    { target: "onBack={() => navigate('/')} />} />", replace: "onBack={() => navigate('/')} /></>} />" },
    { target: "onBack={() => navigate('/dashboard')} userRole={userRole} /> : <Navigate to=\"/auth\" />} />", replace: "onBack={() => navigate('/dashboard')} userRole={userRole} /></> : <Navigate to=\"/auth\" />} />" },
    { target: "onBack={() => navigate('/dashboard')} /> : <Navigate to=\"/auth\" />} />", replace: "onBack={() => navigate('/dashboard')} /></> : <Navigate to=\"/auth\" />} />" },
    { target: "planName={checkoutData?.name || 'Pro Plan'} \n                onContinue={() => navigate('/dashboard')} \n            /> : <Navigate to=\"/auth\" />} />", replace: "planName={checkoutData?.name || 'Pro Plan'} \n                onContinue={() => navigate('/dashboard')} \n            /></> : <Navigate to=\"/auth\" />} />" },
    { target: "userId={session.user.id} /> : <Navigate to=\"/dashboard\" />\n            ) : <Navigate to=\"/auth\" />} />", replace: "userId={session.user.id} /></> : <Navigate to=\"/dashboard\" />\n            ) : <Navigate to=\"/auth\" />} />" }
];

replacements.forEach(({ route, meta }) => {
    content = content.replace(new RegExp(route, 'g'), meta);
});

// Since some are complex, let's just do a string replacement for the ending tag for the ones wrapped in <>
const fixes = [
    { from: "/about\" element={<><RouteMeta title=\"About Us\" description=\"Learn about the prepareAI mission to democratize interview coaching using advanced AI.\" /><AboutUs onBack={() => navigate('/')} />} />", to: "/about\" element={<><RouteMeta title=\"About Us\" description=\"Learn about the prepareAI mission to democratize interview coaching using advanced AI.\" /><AboutUs onBack={() => navigate('/')} /></>} />" },
    { from: "/privacy\" element={<><RouteMeta title=\"Privacy Policy\" description=\"Read our privacy policy to understand how we protect your data.\" /><PrivacyPolicy onBack={() => navigate('/')} />} />", to: "/privacy\" element={<><RouteMeta title=\"Privacy Policy\" description=\"Read our privacy policy to understand how we protect your data.\" /><PrivacyPolicy onBack={() => navigate('/')} /></>} />" },
    { from: "/terms\" element={<><RouteMeta title=\"Terms of Service\" description=\"Read our terms of service and acceptable use policy.\" /><TermsOfService onBack={() => navigate('/')} />} />", to: "/terms\" element={<><RouteMeta title=\"Terms of Service\" description=\"Read our terms of service and acceptable use policy.\" /><TermsOfService onBack={() => navigate('/')} /></>} />" },
    { from: "userRole={userRole} /> : <Navigate to=\"/auth\" />} />", to: "userRole={userRole} /></> : <Navigate to=\"/auth\" />} />" },
    { from: "onBack={() => navigate('/dashboard')} /> : <Navigate to=\"/auth\" />} />", to: "onBack={() => navigate('/dashboard')} /></> : <Navigate to=\"/auth\" />} />" },
    { from: "onContinue={() => navigate('/dashboard')} \n            /> : <Navigate to=\"/auth\" />} />", to: "onContinue={() => navigate('/dashboard')} \n            /></> : <Navigate to=\"/auth\" />} />" },
    { from: "onBack={() => navigate('/dashboard')} userId={session.user.id} /> : <Navigate to=\"/dashboard\" />", to: "onBack={() => navigate('/dashboard')} userId={session.user.id} /></> : <Navigate to=\"/dashboard\" />" },
    { from: "userRole === 'admin' ? <><RouteMeta title=\"Admin Dashboard\" description=\"Manage users and system configurations.\" /><AdminDashboard onBack={() => navigate('/dashboard')} /></>", to: "userRole === 'admin' ? <><RouteMeta title=\"Admin Dashboard\" description=\"Manage users and system configurations.\" /><AdminDashboard onBack={() => navigate('/dashboard')} /></>" },
    { from: "onBack={() => navigate('/dashboard')} /> : <Navigate to=\"/dashboard\" />", to: "onBack={() => navigate('/dashboard')} /></> : <Navigate to=\"/dashboard\" />" }
];

fixes.forEach(({ from, to }) => {
    content = content.replace(from, to);
});

// Since doing <> ... </> with replace can be extremely brittle, we can do something better.
// We can wrap the whole `<Routes>` mapped blocks if we parse it carefully, or just create an SEO wrapper.
// Actually, let's write an SEO wrapper component instead, it's MUCH cleaner!

