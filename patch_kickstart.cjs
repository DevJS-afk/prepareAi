const fs = require('fs');
let code = fs.readFileSync('src/hooks/useInterview.ts', 'utf8');

code = code.replace(
    'sessionPromise.then((session) => {\n                const silence = new Float32Array(1600); // 100ms of silence\n                const silentBlob: Blob = createBlob(silence);\n                session.sendRealtimeInput({ audio: silentBlob });\n              });',
    'sessionPromise.then((session) => {\n                if (!isSessionClosedRef.current) {\n                  try {\n                    const silence = new Float32Array(1600); // 100ms of silence\n                    const silentBlob = createBlob(silence);\n                    session.sendRealtimeInput({ audio: silentBlob });\n                  } catch(e) { console.warn("Failed to send silent kickstart", e); }\n                }\n              });'
);

code = code.replace(
    'isSessionClosedRef.current = true;',
    'isSessionClosedRef.current = true;\n                if (sessionRef.current) {\n                   sessionRef.current = null;\n                }'
);

fs.writeFileSync('src/hooks/useInterview.ts', code);
