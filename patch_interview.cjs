const fs = require('fs');
let code = fs.readFileSync('src/hooks/useInterview.ts', 'utf8');

code = code.replace(
  "const transcriptionRef = useRef(transcription);",
  "const audioQueuePromiseRef = useRef<Promise<void>>(Promise.resolve());\n  const transcriptionRef = useRef(transcription);"
);

const oldCode = `                const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64EncodedAudioString && outputAudioContextRef.current) {
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContextRef.current, 24000, 1);
                    const source = outputAudioContextRef.current.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputNode);
                    source.addEventListener('ended', () => {
                        audioSourcesRef.current.delete(source);
                    });
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    audioSourcesRef.current.add(source);
                }`;

const newCode = `                const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64EncodedAudioString && outputAudioContextRef.current) {
                    audioQueuePromiseRef.current = audioQueuePromiseRef.current.then(async () => {
                        if (!outputAudioContextRef.current) return;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                        try {
                            const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        } catch (err) {
                            console.error("Error decoding audio:", err);
                        }
                    });
                }`;

if (code.includes(oldCode)) {
    code = code.replace(oldCode, newCode);
    console.log("Patched audio block");
} else {
    console.log("Could not find oldCode");
}

fs.writeFileSync('src/hooks/useInterview.ts', code);
