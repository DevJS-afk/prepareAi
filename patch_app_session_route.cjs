const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldRoute = `                        <Route path="/interview/session" element={<><RouteMeta title="Live Interview" description="Your live AI interview session." />{session ? (
                interviewConfig ? <InterviewScreen onEnd={handleEndInterview} config={interviewConfig} isPracticeMode={isPracticeMode} /> : <Navigate to="/dashboard" />
            ) : <Navigate to="/auth" />}</>} />`;

const newRoute = `                        <Route path="/interview/session" element={<><RouteMeta title="Live Interview" description="Your live AI interview session." />{session ? (
                (interviewConfig || new URLSearchParams(window.location.search).get('inviteId')) ? <InterviewScreen onEnd={handleEndInterview} config={interviewConfig!} isPracticeMode={isPracticeMode} /> : <Navigate to="/dashboard" />
            ) : <Navigate to="/auth" />}</>} />`;

if (content.includes(oldRoute)) {
    content = content.replace(oldRoute, newRoute);
    fs.writeFileSync('src/App.tsx', content);
    console.log('App.tsx session route patched');
} else {
    console.log('oldRoute not found in App.tsx');
}
