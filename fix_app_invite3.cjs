const fs = require('fs');
let content = fs.readFileSync('src/components/InterviewScreen.tsx', 'utf8');

content = content.replace(
    'const { transcription, aiStatus, isConnecting, error, endInterview, feedback, aiAudioStream, retry, suspendAudio, resumeAudio } = useInterview(config);',
    'const { transcription, aiStatus, isConnecting, error: interviewError, endInterview, feedback, aiAudioStream, retry, suspendAudio, resumeAudio } = useInterview(activeConfig!);'
);

content = content.replace(
    'const { t } = useTranslation();',
    'const { t } = useTranslation();\n'
);

// We need to handle the `config` props that might be used elsewhere, since I replaced `config.name` with `activeConfig.name` already.
// Let's check if there are any `config.xxx` left.
content = content.replace(/config\./g, 'activeConfig.');

fs.writeFileSync('src/components/InterviewScreen.tsx', content);
console.log('Fixed useInterview call');
