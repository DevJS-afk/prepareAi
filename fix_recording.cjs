const fs = require('fs');

let content = fs.readFileSync('src/components/InterviewScreen.tsx', 'utf8');

// Replace startRecording
const newStartRecording = `  const startRecording = useCallback(async () => {
    if (!videoRef.current?.srcObject || !aiAudioStream || !(videoRef.current.srcObject instanceof MediaStream)) {
        return;
    }
    try {
        const userMediaStream = videoRef.current.srcObject as MediaStream;
        const videoTracks = userMediaStream.getVideoTracks();

        const audioCtx = new AudioContext();
        const dest = audioCtx.createMediaStreamDestination();

        if (userMediaStream.getAudioTracks().length > 0) {
            const micSource = audioCtx.createMediaStreamSource(userMediaStream);
            micSource.connect(dest);
        }

        if (aiAudioStream.getAudioTracks().length > 0) {
            const aiSource = audioCtx.createMediaStreamSource(aiAudioStream);
            aiSource.connect(dest);
        }

        const mixedAudioTrack = dest.stream.getAudioTracks()[0];
        const combinedStream = new MediaStream([...videoTracks, mixedAudioTrack]);

        recordedChunksRef.current = [];
        const options = { mimeType: 'video/webm; codecs=vp9,opus' };
        let recorder;
        if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9,opus')) {
            recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm; codecs=vp9,opus' });
        } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp8,opus')) {
            recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm; codecs=vp8,opus' });
        } else {
            recorder = new MediaRecorder(combinedStream);
        }
        
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunksRef.current.push(event.data);
        };
        recorder.onstop = () => {
            downloadRecording();
            setIsRecording(false);
            setIsSaving(false);
        };
        recorder.start();
        setIsRecording(true);
    } catch (err: any) {
        console.error('Recording error', err);
        setIsRecording(false);
        setIsSaving(false);
    }
  }, [aiAudioStream, downloadRecording]);`;

const regex = /const startRecording = useCallback\(async \(\) => \{[\s\S]*?\}, \[aiAudioStream, downloadRecording, stopAndSaveRecording\]\);/;
content = content.replace(regex, newStartRecording);

// Also remove screenStreamRef usage since we don't need it
content = content.replace(/if \(screenStreamRef\.current\) \{[\s\S]*?\}/g, '');

fs.writeFileSync('src/components/InterviewScreen.tsx', content);
console.log('Fixed startRecording');
