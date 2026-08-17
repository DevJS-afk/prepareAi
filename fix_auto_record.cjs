const fs = require('fs');
let content = fs.readFileSync('src/components/InterviewScreen.tsx', 'utf8');

// Insert auto-recording effect
const autoRecordEffect = `
  useEffect(() => {
    if (sessionStarted && aiAudioStream && !isRecording && !isPracticeMode && videoRef.current?.srcObject) {
        startRecording();
    }
  }, [sessionStarted, aiAudioStream, isRecording, isPracticeMode, startRecording]);
`;

// Place it right after handleEndClick
content = content.replace(
    /const handleEndClick = useCallback\([\s\S]*?\}\, \[isRecording, stopAndSaveRecording, endInterview, onEnd, transcription, feedback\]\);/,
    `$&${autoRecordEffect}`
);

fs.writeFileSync('src/components/InterviewScreen.tsx', content);
console.log('Added auto recording effect');
