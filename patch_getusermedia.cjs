const fs = require('fs');
let code = fs.readFileSync('src/hooks/useInterview.ts', 'utf8');

code = code.replace(
  /const stream = await navigator\.mediaDevices\.getUserMedia\(\{ audio: true \}\);/,
  `const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });`
);

fs.writeFileSync('src/hooks/useInterview.ts', code);
