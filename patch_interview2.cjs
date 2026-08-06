const fs = require('fs');
let code = fs.readFileSync('src/hooks/useInterview.ts', 'utf8');

code = code.replace(
  "const audioQueuePromiseRef = useRef<Promise<void>>(Promise.resolve());",
  "const interruptIdRef = useRef(0);\n  const audioQueuePromiseRef = useRef<Promise<void>>(Promise.resolve());"
);

const oldCode = `                const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
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

const newCode = `                const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64EncodedAudioString && outputAudioContextRef.current) {
                    const currentInterruptId = interruptIdRef.current;
                    audioQueuePromiseRef.current = audioQueuePromiseRef.current.then(async () => {
                        if (!outputAudioContextRef.current || currentInterruptId !== interruptIdRef.current) return;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                        try {
                            const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContextRef.current, 24000, 1);
                            if (currentInterruptId !== interruptIdRef.current) return;
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
    console.log("Patched audio block with interrupt id");
} else {
    console.log("Could not find oldCode");
}

const oldInterrupt = `                const interrupted = message.serverContent?.interrupted;
                if (interrupted) {
                    for (const source of audioSourcesRef.current.values()) {
                        source.stop();
                    }
                    audioSourcesRef.current.clear();
                    nextStartTimeRef.current = 0;`;

const newInterrupt = `                const interrupted = message.serverContent?.interrupted;
                if (interrupted) {
                    interruptIdRef.current++;
                    for (const source of audioSourcesRef.current.values()) {
                        source.stop();
                    }
                    audioSourcesRef.current.clear();
                    nextStartTimeRef.current = 0;`;

if (code.includes(oldInterrupt)) {
    code = code.replace(oldInterrupt, newInterrupt);
    console.log("Patched interrupted block");
} else {
    console.log("Could not find oldInterrupt");
}

fs.writeFileSync('src/hooks/useInterview.ts', code);
