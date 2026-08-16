const fs = require('fs');

let content = fs.readFileSync('src/components/EndScreen.tsx', 'utf8');

// Update the fetch body to include confidenceTrend
content = content.replace(
    'body: JSON.stringify({ transcription, feedback, config }),',
    'body: JSON.stringify({ transcription, feedback, config, confidenceTrend }),'
);

fs.writeFileSync('src/components/EndScreen.tsx', content);
console.log('Fixed EndScreen request');
