const fs = require('fs');
let code = fs.readFileSync('src/hooks/useInterview.ts', 'utf8');

code = code.replace(
    'const sessionPromise = aiRef.current.live.connect({',
    'isSessionClosedRef.current = false;\n        const sessionPromise = aiRef.current.live.connect({'
);

code = code.replace(
    'const interruptIdRef = useRef<number>(0);',
    'const interruptIdRef = useRef<number>(0);\n  const isSessionClosedRef = useRef<boolean>(false);'
);

code = code.replace(
    'console.log("Gemini session closed.");',
    'console.log("Gemini session closed.");\n                isSessionClosedRef.current = true;'
);

code = code.replace(
    'if (isAiSpeakingRef.current || isPlayingAudio) return;',
    'if (isAiSpeakingRef.current || isPlayingAudio || isSessionClosedRef.current) return;'
);

code = code.replace(
    'sessionPromise.then((session) => {\n                  session.sendRealtimeInput({ audio: pcmBlob });\n                });',
    'sessionPromise.then((session) => {\n                  if (!isSessionClosedRef.current) {\n                    try {\n                      session.sendRealtimeInput({ audio: pcmBlob });\n                    } catch(e) {\n                      console.warn("Failed to send audio", e);\n                    }\n                  }\n                });'
);

fs.writeFileSync('src/hooks/useInterview.ts', code);
console.log("Patched useInterview.ts");
