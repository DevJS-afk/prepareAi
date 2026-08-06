const fs = require('fs');
let code = fs.readFileSync('src/hooks/useInterview.ts', 'utf8');

code = code.replace(
  /scriptProcessorRef\.current\.onaudioprocess = \(audioProcessingEvent\) => \{\n                const inputData = audioProcessingEvent\.inputBuffer\.getChannelData\(0\);\n                const pcmBlob: Blob = createBlob\(inputData\);\n                sessionPromise\.then\(\(session\) => \{\n                  session\.sendRealtimeInput\(\{ audio: pcmBlob \}\);\n                \}\);\n              \};/,
  `scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                if (isAiSpeakingRef.current) return;
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob: Blob = createBlob(inputData);
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ audio: pcmBlob });
                });
              };`
);

code = code.replace(
  /if\(message\.serverContent\?\.modelTurn\) \{\n                    setAiStatus\('speaking'\);\n                \}/,
  `if(message.serverContent?.modelTurn) {
                    setAiStatus('speaking');
                    isAiSpeakingRef.current = true;
                }`
);

code = code.replace(
  /if \(message\.serverContent\?\.turnComplete\) \{/,
  `if (message.serverContent?.turnComplete) {
                    isAiSpeakingRef.current = false;`
);

fs.writeFileSync('src/hooks/useInterview.ts', code);
