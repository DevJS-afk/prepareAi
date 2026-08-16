const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<Route path="\/interview\/session".*?interviewConfig \? <InterviewScreen.*?<\/Route>/s;
const newRoute = `<Route path="/interview/session" element={<><RouteMeta title="Live Interview" description="Your live AI interview session." />{session ? (
                (interviewConfig || new URLSearchParams(window.location.search).get('inviteId')) ? <InterviewScreen onEnd={handleEndInterview} config={interviewConfig!} isPracticeMode={isPracticeMode} /> : <Navigate to="/dashboard" />
            ) : <Navigate to="/auth" />}</>} />`;

content = content.replace(regex, newRoute);
fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx session route regex patched');
