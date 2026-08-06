const fs = require('fs');
let code = fs.readFileSync('src/hooks/useInterview.ts', 'utf8');

const oldCode = `              scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                if (isAiSpeakingRef.current) return;
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);`;

const newCode = `              scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const isPlayingAudio = outputAudioContextRef.current && (nextStartTimeRef.current > outputAudioContextRef.current.currentTime);
                if (isAiSpeakingRef.current || isPlayingAudio) return;
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);`;

if (code.includes(oldCode)) {
    code = code.replace(oldCode, newCode);
    console.log("Patched onaudioprocess");
} else {
    console.log("Could not find oldCode");
}

fs.writeFileSync('src/hooks/useInterview.ts', code);
