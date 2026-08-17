const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace('<RouteMeta title="Interview Invitation" description="You have been invited to an AI interview." />', '');
fs.writeFileSync('src/App.tsx', appContent);

let onboardingContent = fs.readFileSync('src/components/InviteOnboarding.tsx', 'utf8');
onboardingContent = onboardingContent.replace('import { useParams, useNavigate, Navigate } from \'react-router-dom\';', 'import { useParams, useNavigate } from \'react-router-dom\';');
onboardingContent = onboardingContent.replace('const [loading, setLoading] = useState(true);', '');
onboardingContent = onboardingContent.replace(/setLoading\(false\);/g, '');
fs.writeFileSync('src/components/InviteOnboarding.tsx', onboardingContent);
console.log('Fixed TS warnings');
