const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add Import
if (!content.includes('InviteOnboarding')) {
    content = content.replace("import Dashboard from './components/WelcomeScreen';", "import Dashboard from './components/WelcomeScreen';\nimport InviteOnboarding from './components/InviteOnboarding';");
}

// Add Route for /invite/:inviteToken
const inviteRoute = `            <Route path="/invite/:inviteToken" element={<><RouteMeta title="Interview Invitation" description="You have been invited to an AI interview." /><InviteOnboarding session={session} /></>} />`;

if (!content.includes('path="/invite/:inviteToken"')) {
    content = content.replace('{/* Public Routes */}', '{/* Public Routes */}\n' + inviteRoute);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched for invites');
