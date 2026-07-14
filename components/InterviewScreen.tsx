
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useInterview } from '../hooks/useInterview';
import type { TranscriptionEntry, InterviewConfig, FeedbackEntry } from '../types';

interface InterviewScreenProps {
  onEnd: (transcription: TranscriptionEntry[], feedback: FeedbackEntry[]) => void;
  config: InterviewConfig;
  isPracticeMode: boolean;
}

const AiAvatar: React.FC<{ status: string }> = ({ status }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            // Slight speed up when speaking to add energy
            videoRef.current.playbackRate = status === 'speaking' ? 1.1 : 1.0;
        }
    }, [status]);

    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gray-900">
          {/* Background Ambience */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-80 z-0"></div>
          
          {/* Real Human Video Container */}
          <div className={`relative w-full h-full max-w-4xl mx-auto flex items-center justify-center transition-transform duration-700 ${status === 'speaking' ? 'scale-105' : 'scale-100'}`}>
              <div className="relative w-full h-full overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-top opacity-90"
                    poster="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  >
                      {/* Professional woman listening/nodding loop */}
                      <source src="https://cdn.pixabay.com/video/2020/04/18/36486-410064506_large.mp4" type="video/mp4" />
                  </video>
                  
                  {/* Speaking Overlay / Animation - Subtle glow */}
                  {status === 'speaking' && (
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/10 to-transparent mix-blend-overlay animate-pulse pointer-events-none"></div>
                  )}
                  
                  {/* Thinking Overlay - Subtle */}
                  {status === 'thinking' && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px] transition-all duration-500">
                          <div className="flex gap-2">
                              <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce delay-0"></div>
                              <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce delay-150"></div>
                              <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce delay-300"></div>
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* Status Badge Overlay */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
              <div className={`flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md border shadow-xl transition-all duration-300 ${
                  status === 'speaking' ? 'bg-brand-blue/80 border-brand-blue/50 text-white' :
                  status === 'listening' ? 'bg-black/60 border-white/10 text-gray-200' :
                  'bg-brand-yellow/80 border-brand-yellow/50 text-black'
              }`}>
                  <div className={`w-3 h-3 rounded-full ${
                      status === 'speaking' ? 'bg-white animate-pulse' :
                      status === 'listening' ? 'bg-brand-green' :
                      'bg-black animate-bounce'
                  }`}></div>
                  <span className="font-medium tracking-wide uppercase text-sm">
                      {status === 'speaking' ? 'Interviewer Speaking' : 
                       status === 'listening' ? 'Listening to You' : 
                       'Analyzing Response'}
                  </span>
              </div>
          </div>
      </div>
    );
};

const TranscriptionLog: React.FC<{ transcription: TranscriptionEntry[] }> = ({ transcription }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcription]);

  return (
    <div className="flex-grow space-y-4 p-4 overflow-y-auto custom-scrollbar font-mono text-sm h-full">
      {transcription.length === 0 && <p className="text-gray-600 text-center italic mt-10">Conversation will appear here...</p>}
      {transcription.map((entry, index) => (
        <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] p-3 rounded-2xl ${
            entry.speaker === 'user' 
            ? 'bg-brand-blue/20 border border-brand-blue/30 text-blue-100 rounded-tr-none' 
            : 'bg-gray-800/50 border border-white/10 text-gray-300 rounded-tl-none'
          }`}>
            <p className="leading-relaxed">{entry.text}</p>
          </div>
        </div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

const FeedbackLog: React.FC<{ feedback: FeedbackEntry[] }> = ({ feedback }) => {
  const feedbackEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedbackEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feedback]);

  if (feedback.length === 0) {
    return <p className="text-gray-500 text-xs text-center p-4 italic">Real-time feedback will appear here.</p>;
  }

  return (
    <div className="space-y-3 p-3 h-full overflow-y-auto custom-scrollbar">
      {feedback.map((entry, index) => (
        <div key={index} className="bg-brand-yellow/10 border border-brand-yellow/20 p-3 rounded-lg backdrop-blur-sm animate-slide-up">
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-yellow flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
               <p className="text-xs font-bold text-brand-yellow uppercase tracking-wide mb-1">Feedback</p>
               <p className="text-xs text-gray-300 leading-relaxed">{entry.feedbackText}</p>
            </div>
          </div>
        </div>
      ))}
      <div ref={feedbackEndRef} />
    </div>
  );
};

const InterviewScreen: React.FC<InterviewScreenProps> = ({ onEnd, config, isPracticeMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { transcription, aiStatus, isConnecting, error, endInterview, feedback, aiAudioStream, retry, suspendAudio, resumeAudio } = useInterview(config);

  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Handle Fullscreen Logic & Auto-Suspend
  useEffect(() => {
      const handleFullscreenChange = () => {
          const isFs = !!document.fullscreenElement;
          setIsFullscreen(isFs);
          if (isFs) {
              resumeAudio();
          } else {
              suspendAudio();
          }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      
      // Initial suspend until user starts session (via fullscreen)
      if (!sessionStarted || !document.fullscreenElement) {
          suspendAudio();
      }

      return () => {
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
  }, [resumeAudio, suspendAudio, sessionStarted]);

  const handleStartSession = async () => {
      if (containerRef.current) {
          try {
              await containerRef.current.requestFullscreen();
              setSessionStarted(true);
              resumeAudio();
          } catch (err) {
              console.error("Failed to enter fullscreen:", err);
              // Fallback for environments where fullscreen might fail or be blocked
              setSessionStarted(true);
              setIsFullscreen(true); // Force state to allow timer and prevent paused overlay
              resumeAudio();
          }
      }
  };

  useEffect(() => {
    if (!isConnecting && !error && isFullscreen && sessionStarted) {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isConnecting, error, isFullscreen, sessionStarted]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const downloadRecording = useCallback(() => {
    if (recordedChunksRef.current.length === 0) return;
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `prepareAI-session-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    recordedChunksRef.current = [];
  }, []);
  
  const stopAndSaveRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!videoRef.current?.srcObject || !aiAudioStream || !(videoRef.current.srcObject instanceof MediaStream)) {
        alert("Recording unavailable: Waiting for streams.");
        return;
    }
    try {
        const screenAndSystemAudioStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = screenAndSystemAudioStream;
        const userMediaStream = videoRef.current.srcObject as MediaStream;
        const videoTracks = screenAndSystemAudioStream.getVideoTracks();
        const audioTracks = [...userMediaStream.getAudioTracks()]; 
        if (screenAndSystemAudioStream.getAudioTracks().length > 0) {
            audioTracks.push(...screenAndSystemAudioStream.getAudioTracks());
        } else {
            audioTracks.push(...aiAudioStream.getAudioTracks());
        }
        const combinedStream = new MediaStream([...videoTracks, ...audioTracks]);
        recordedChunksRef.current = [];
        const options = { mimeType: 'video/webm; codecs=vp9,opus' };
        const recorder = new MediaRecorder(combinedStream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunksRef.current.push(event.data);
        };
        recorder.onstop = () => {
            downloadRecording();
            setIsRecording(false);
            setIsSaving(false);
        };
        screenAndSystemAudioStream.getVideoTracks()[0].onended = () => {
            if (mediaRecorderRef.current?.state === 'recording') {
                stopAndSaveRecording();
                setIsSaving(true);
            }
        };
        recorder.start();
        setIsRecording(true);
    } catch (err: any) {
        console.error("Recording failed:", err);
        let errorMsg = "Could not start recording.";
        if (err.name === 'NotAllowedError') {
            errorMsg = "Screen recording permission was denied. Please allow screen sharing to record your session.";
        } else if (err.name === 'NotFoundError') {
             errorMsg = "No screen recording source found.";
        } else if (err.message && err.message.includes("display-capture")) {
            errorMsg = "Screen recording is disabled in this environment (Permission Policy).";
        }
        alert(errorMsg);
        setIsRecording(false);
        setIsSaving(false);
    }
  }, [aiAudioStream, downloadRecording, stopAndSaveRecording]);

  const handleRecordingButtonClick = useCallback(() => {
    if (isRecording) {
      setIsSaving(true);
      stopAndSaveRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopAndSaveRecording]);

  const handleEndClick = useCallback(() => {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (isRecording) stopAndSaveRecording();
    endInterview();
    onEnd(transcription, feedback);
  }, [isRecording, stopAndSaveRecording, endInterview, onEnd, transcription, feedback]);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    setupCamera();
  }, []);

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
        <div className="relative">
            <div className="absolute inset-0 bg-brand-blue blur-xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 border-4 border-t-brand-blue border-r-transparent border-b-brand-blue border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-8 text-xl font-light text-gray-300 tracking-wide">Establishing Neural Link...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-lg mx-auto mt-20 p-8 glass-panel rounded-2xl text-center border border-red-500/30 shadow-[0_0_50px_rgba(234,67,53,0.1)]">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Connection Interrupted</h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <div className="flex justify-center gap-4">
            <button onClick={retry} className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-8 rounded-xl transition-colors">Retry</button>
            <button onClick={() => onEnd(transcription, feedback)} className="bg-transparent border border-gray-600 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-colors">Abort</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-[85vh] max-h-[900px] glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-fade-in border border-white/5 relative">
      
      {/* Start / Fullscreen Overlay */}
      {!sessionStarted && (
          <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-20 h-20 bg-brand-blue/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Ready to Begin?</h2>
                <p className="text-gray-400 mb-10 max-w-md text-lg leading-relaxed">
                    To ensure a distraction-free environment and realistic experience, the interview will take place in <span className="text-white font-semibold">Fullscreen Mode</span>.
                </p>
                <button 
                    onClick={handleStartSession}
                    className="px-8 py-4 bg-brand-blue hover:bg-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-brand-blue/30 transition-all transform hover:-translate-y-1"
                >
                    Enter Studio & Start
                </button>
          </div>
      )}

      {/* Paused Overlay */}
      {sessionStarted && !isFullscreen && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-fade-in">
               <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 text-yellow-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <h2 className="text-3xl font-bold text-white mb-3">Session Paused</h2>
               <p className="text-gray-400 mb-8 max-w-md">You exited fullscreen mode. Please return to resume your interview.</p>
               <button 
                    onClick={handleStartSession}
                    className="px-8 py-3 bg-white text-black hover:bg-gray-200 font-bold rounded-xl transition-colors"
                >
                    Resume Session
               </button>
          </div>
      )}

      {/* Top Bar Info */}
      <div className="h-16 bg-black/40 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${sessionStarted && isFullscreen ? 'bg-brand-green animate-pulse' : 'bg-yellow-500'}`}></div>
                 <span className="text-xs font-mono text-gray-300 tracking-widest uppercase">{sessionStarted && isFullscreen ? 'Live Session' : 'Standby'}</span>
              </div>
              <div className="h-4 w-px bg-gray-700"></div>
              <span className="text-sm text-gray-300 font-medium">{config.name}</span>
          </div>
          
          {/* Enhanced Timer UI */}
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border backdrop-blur-md transition-colors duration-300 ${sessionStarted && isFullscreen ? 'bg-brand-blue/10 border-brand-blue/30' : 'bg-white/5 border-white/10'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${sessionStarted && isFullscreen ? 'text-brand-blue' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="font-mono text-xl font-bold text-white tracking-widest leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(elapsedTime)}
              </div>
          </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Main Viewport (Avatar + Video) */}
        <div className="lg:w-3/5 bg-gradient-to-b from-gray-900 to-black relative flex flex-col">
           
           {/* AI Container */}
           <div className="flex-1 relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                <AiAvatar status={aiStatus} />
           </div>

           {/* User PIP (Picture in Picture) style or Split */}
           <div className="h-48 lg:h-64 relative bg-black border-t border-white/10 group">
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100 opacity-80 group-hover:opacity-100 transition-opacity"></video>
                <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono border border-white/10">YOU</div>
                {isRecording && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500/20 border border-red-500/50 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-red-500 uppercase">Rec</span>
                    </div>
                )}
           </div>
        </div>

        {/* Sidebar (Chat & Feedback) */}
        <div className="lg:w-2/5 flex flex-col border-l border-white/5 bg-black/20 backdrop-blur-sm">
            
            {/* Transcript Area */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Transcript</span>
                </div>
                <TranscriptionLog transcription={transcription} />
            </div>

            {/* Feedback Area (Collapsible or Fixed Height) */}
            <div className="h-1/3 min-h-[150px] border-t border-white/10 flex flex-col bg-black/20">
                 <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Analysis Stream</span>
                </div>
                <FeedbackLog feedback={feedback} />
            </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-20 bg-black/60 border-t border-white/5 flex items-center justify-center gap-6 backdrop-blur-md shrink-0 px-4">
          {!isPracticeMode && (
              <button 
                onClick={handleRecordingButtonClick}
                disabled={!aiAudioStream || isSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                    isRecording 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                } disabled:opacity-50`}
              >
                 <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                 {isRecording ? (isSaving ? 'Saving...' : 'Stop Recording') : 'Record Session'}
              </button>
          )}

          <button 
            onClick={handleEndClick}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-brand-red hover:bg-red-600 text-white font-bold shadow-lg hover:shadow-red-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
             {isSaving ? 'Finalizing...' : 'End Interview'}
          </button>
      </div>
    </div>
  );
};

export default InterviewScreen;
