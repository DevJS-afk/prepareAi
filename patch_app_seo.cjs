const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import RouteMeta")) {
    content = content.replace("import Dashboard from './components/WelcomeScreen';", "import RouteMeta from './components/RouteMeta';\nimport Dashboard from './components/WelcomeScreen';");
}

const routeReplacements = [
    {
        path: 'path="/"',
        meta: '<RouteMeta title="Home" description="prepareAI is an advanced, AI-powered interview practice platform that provides realistic mock interviews, real-time feedback, and career document generation to help you land your dream job." />'
    },
    {
        path: 'path="/auth"',
        meta: '<RouteMeta title="Sign In" description="Join prepareAI to practice interviews with AI and build your career portfolio." />'
    },
    {
        path: 'path="/about"',
        meta: '<RouteMeta title="About Us" description="Learn about the prepareAI mission to democratize interview coaching using advanced AI." />'
    },
    {
        path: 'path="/privacy"',
        meta: '<RouteMeta title="Privacy Policy" description="Read our privacy policy to understand how we protect your data." />'
    },
    {
        path: 'path="/terms"',
        meta: '<RouteMeta title="Terms of Service" description="Read our terms of service and acceptable use policy." />'
    },
    {
        path: 'path="/dashboard"',
        meta: '<RouteMeta title="Dashboard" description="Access your interview history, documents, and upcoming sessions." />'
    },
    {
        path: 'path="/interview/setup"',
        meta: '<RouteMeta title="Setup Interview" description="Configure your next AI interview session." />'
    },
    {
        path: 'path="/interview/session"',
        meta: '<RouteMeta title="Live Interview" description="Your live AI interview session." />'
    },
    {
        path: 'path="/results"',
        meta: '<RouteMeta title="Interview Results" description="Review your performance, transcription, and feedback." />'
    },
    {
        path: 'path="/cv-builder"',
        meta: '<RouteMeta title="Resume Builder" description="Create ATS-friendly resumes tailored to your dream job." />'
    },
    {
        path: 'path="/portfolio-builder"',
        meta: '<RouteMeta title="Portfolio Builder" description="Build a stunning career portfolio to showcase your work." />'
    },
    {
        path: 'path="/job-board"',
        meta: '<RouteMeta title="Job Board" description="Discover tailored job opportunities and track your applications." />'
    },
    {
        path: 'path="/motivation-letter"',
        meta: '<RouteMeta title="Cover Letter Builder" description="Generate dynamic, tailored cover letters." />'
    },
    {
        path: 'path="/profile"',
        meta: '<RouteMeta title="Your Profile" description="Manage your account, preferences, and career documents." />'
    },
    {
        path: 'path="/pricing"',
        meta: '<RouteMeta title="Pricing" description="Explore our plans for individuals and enterprise teams." />'
    },
    {
        path: 'path="/checkout"',
        meta: '<RouteMeta title="Checkout" description="Complete your prepareAI subscription." />'
    },
    {
        path: 'path="/payment-success"',
        meta: '<RouteMeta title="Payment Successful" description="Your payment was successful." />'
    },
    {
        path: 'path="/admin-dashboard"',
        meta: '<RouteMeta title="Admin Dashboard" description="Manage users and system configurations." />'
    },
    {
        path: 'path="/interviewer-dashboard"',
        meta: '<RouteMeta title="Interviewer Dashboard" description="Manage candidate interviews and reviews." />'
    }
];

// Instead of string replacement, we can wrap the element prop value with <>{meta}{elementValue}</>
// Regex to match: <Route path="..." element={ ... } />

const newRoutes = [];

const lines = content.split('\n');

let inRoutes = false;
let output = [];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.includes('<Routes>')) {
        inRoutes = true;
    }

    if (inRoutes && line.includes('<Route path="')) {
        // Find the matching meta
        let metaTags = '';
        for (const replacement of routeReplacements) {
            if (line.includes(replacement.path)) {
                metaTags = replacement.meta;
                break;
            }
        }
        
        if (metaTags) {
             // We need to wrap whatever is inside `element={` with `<>${metaTags}` and end the element with `</>`
             // For simplicity, because we have multi-line elements:
             // Find `element={` 
             const elementStartIdx = line.indexOf('element={');
             if (elementStartIdx !== -1) {
                 line = line.substring(0, elementStartIdx + 9) + '<>' + metaTags + ' ' + line.substring(elementStartIdx + 9);
                 
                 // if the line ends with `} />` we can close it immediately
                 if (line.endsWith('} />')) {
                     line = line.substring(0, line.length - 4) + '</>} />';
                 } else {
                     // Need to find the closing `} />` for this route, possibly multi-line
                     let j = i;
                     while (!lines[j].endsWith('} />')) {
                         j++;
                     }
                     lines[j] = lines[j].substring(0, lines[j].length - 4) + '</>} />';
                 }
             }
        }
    }

    if (line.includes('</Routes>')) {
        inRoutes = false;
    }

    output.push(line);
}

fs.writeFileSync('src/App.tsx', output.join('\n'));
console.log('App patched');
