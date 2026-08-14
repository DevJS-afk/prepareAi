import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useInterview } from '../hooks/useInterview';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';
import { motion } from 'motion/react';
import type { TranscriptionEntry, InterviewConfig, FeedbackEntry, PersonaKey } from '../types';
import { EmotionTracker } from './EmotionTracker';

interface InterviewScreenProps {
  onEnd: (transcription: TranscriptionEntry[], feedback: FeedbackEntry[], confidenceTrend?: { time: string; confidence: number }[]) => void;
  config: InterviewConfig;
  isPracticeMode: boolean;
}

interface AiAvatarProps {
  status: 'connecting' | 'listening' | 'speaking' | 'thinking';
  persona?: PersonaKey;
  audioStream: MediaStream | null;
}

const AiAvatar: React.FC<AiAvatarProps> = ({ status, persona = 'friendly', audioStream }) => {
    const { t } = useTranslation();
    const [audioVolume, setAudioVolume] = useState(0);
    const [isBlinking, setIsBlinking] = useState(false);
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let timer: number;
        const triggerBlink = () => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 140);
            const nextBlinkTime = 2500 + Math.random() * 3500;
            timer = window.setTimeout(triggerBlink, nextBlinkTime);
        };
        timer = window.setTimeout(triggerBlink, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let timer: number;
        const shiftEyes = () => {
            if (status === 'thinking') {
                setEyePosition({ x: -2, y: -2.5 });
            } else {
                const randomX = (Math.random() - 0.5) * 2.5;
                const randomY = (Math.random() - 0.5) * 1.2;
                setEyePosition({ x: randomX, y: randomY });
            }
            const nextShiftTime = 3500 + Math.random() * 4000;
            timer = window.setTimeout(shiftEyes, nextShiftTime);
        };
        timer = window.setTimeout(shiftEyes, 2000);
        return () => clearTimeout(timer);
    }, [status]);

    useEffect(() => {
        if (status !== 'speaking') {
            setAudioVolume(0);
            return;
        }

        if (audioStream) {
            let audioCtx: AudioContext | null = null;
            let source: MediaStreamAudioSourceNode | null = null;
            let analyser: AnalyserNode | null = null;
            let animationFrameId: number;

            try {
                audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                source = audioCtx.createMediaStreamSource(audioStream);
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 128;
                source.connect(analyser);

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const updateVolume = () => {
                    if (!analyser) return;
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    let activeBins = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                        if (dataArray[i] > 0) activeBins++;
                    }
                    const average = bufferLength > 0 ? sum / bufferLength : 0;
                    
                    if (average > 1) {
                        const volume = Math.min(100, Math.max(0, (average / 180) * 150));
                        setAudioVolume(volume);
                    } else {
                        setAudioVolume(12 + Math.sin(Date.now() * 0.02) * 8);
                    }
                    animationFrameId = requestAnimationFrame(updateVolume);
                };

                updateVolume();

                return () => {
                    cancelAnimationFrame(animationFrameId);
                    if (source) source.disconnect();
                    if (audioCtx && audioCtx.state !== 'closed') {
                        audioCtx.close();
                    }
                };
            } catch (err) {
                console.error("Audio Context setup failed inside AiAvatar:", err);
            }
        }

        const intervalId = window.setInterval(() => {
            const volume = 25 + Math.random() * 55;
            setAudioVolume(volume);
        }, 110);

        return () => clearInterval(intervalId);
    }, [status, audioStream]);

    const dxPupil = status === 'thinking' ? -2 : eyePosition.x;
    const dyPupil = status === 'thinking' ? -2.5 : eyePosition.y;
    const dyEyebrow = status === 'thinking' ? -3 : (status === 'speaking' ? Math.min(3, audioVolume * 0.04) : 0);

    const openFactor = audioVolume / 100;
    const syllableMultiplier = 0.82 + 0.18 * Math.sin(Date.now() * 0.016);
    const finalOpen = status === 'speaking' ? openFactor * syllableMultiplier : 0;

    const mouthHeight = 1 + 17 * finalOpen;
    const mouthWidth = 14 + 4 * finalOpen;

    const personaInfo = {
        friendly: {
            name: t('InterviewScreen.persona_sarah_name'),
            title: t('InterviewScreen.persona_sarah_title'),
            lipColor: "#f43f5e",
            lipWidth: 4,
            skinColor: "url(#skin-grad-sarah)",
            badgeBg: "bg-teal-500/20 text-teal-300 border-teal-500/30",
        },
        stern: {
            name: t('InterviewScreen.persona_marcus_name'),
            title: t('InterviewScreen.persona_marcus_title'),
            lipColor: "#9a3412",
            lipWidth: 4.5,
            skinColor: "url(#skin-grad-marcus)",
            badgeBg: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        },
        curious: {
            name: t('InterviewScreen.persona_sophia_name'),
            title: t('InterviewScreen.persona_sophia_title'),
            lipColor: "#be123c",
            lipWidth: 4,
            skinColor: "url(#skin-grad-sophia)",
            badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        },
    }[persona] || {
        name: t('InterviewScreen.persona_sarah_name'),
        title: t('InterviewScreen.persona_sarah_title'),
        lipColor: "#f43f5e",
        lipWidth: 4,
        skinColor: "url(#skin-grad-sarah)",
        badgeBg: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    };

    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gray-950 p-4">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-90 z-0"></div>
          
          <motion.div 
            className="absolute w-[450px] h-[450px] rounded-full blur-3xl opacity-20 pointer-events-none"
            animate={{
              scale: status === 'speaking' ? [1, 1.15, 1] : 1,
              opacity: status === 'speaking' ? [0.2, 0.4, 0.2] : 0.2,
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: persona === 'stern' ? 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' :
                          persona === 'curious' ? 'radial-gradient(circle, #ec4899 0%, transparent 70%)' :
                          'radial-gradient(circle, #14b8a6 0%, transparent 70%)',
            }}
          />

          <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black/50 flex items-center justify-center">
             
             <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <span className={`w-2 h-2 rounded-full ${status === 'speaking' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">{status}</span>
             </div>

             <div className="absolute top-4 left-4 z-20 flex flex-col">
                  <span className="text-white font-bold text-sm tracking-wide">{personaInfo.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{personaInfo.title}</span>
             </div>

             <style dangerouslySetInnerHTML={{__html: `
                @keyframes idleSway {
                  0%, 100% { transform: translate(0, 0) rotate(0deg); }
                  50% { transform: translate(1.5px, 2px) rotate(0.6deg); }
                }
                @keyframes breathing {
                  0%, 100% { transform: scale(1) translate(0, 0); }
                  50% { transform: scale(1.01) translate(0, -1.2px); }
                }
                .animate-avatar-sway {
                  animation: idleSway 5.5s ease-in-out infinite;
                  transform-origin: bottom center;
                }
                .animate-avatar-breath {
                  animation: breathing 3.8s ease-in-out infinite;
                  transform-origin: bottom center;
                }
             `}} />

             <svg viewBox="0 0 400 400" className="w-full h-full object-contain relative z-10">
                <defs>
                  <radialGradient id="sarah-bg" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#115e59" />
                    <stop offset="100%" stopColor="#042f2e" />
                  </radialGradient>
                  <linearGradient id="blazer-grad-sarah" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                  <linearGradient id="skin-grad-sarah" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffeedd" />
                    <stop offset="100%" stopColor="#f5cbab" />
                  </linearGradient>
                  <linearGradient id="hair-grad-sarah" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#9a3412" />
                    <stop offset="100%" stopColor="#431407" />
                  </linearGradient>
                  <radialGradient id="marcus-bg" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#020617" />
                  </radialGradient>
                  <linearGradient id="suit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <linearGradient id="skin-grad-marcus" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fff7ed" />
                    <stop offset="100%" stopColor="#ffedd5" />
                  </linearGradient>
                  <linearGradient id="beard-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <radialGradient id="sophia-bg" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#3b0764" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                  </radialGradient>
                  <linearGradient id="top-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#be123c" />
                    <stop offset="100%" stopColor="#4c0519" />
                  </linearGradient>
                  <linearGradient id="skin-grad-sophia" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffeedd" />
                    <stop offset="100%" stopColor="#f5cbab" />
                  </linearGradient>
                  <linearGradient id="hair-grad-sophia" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#27272a" />
                    <stop offset="100%" stopColor="#09090b" />
                  </linearGradient>
                </defs>

                <g className="animate-avatar-breath">
                   {persona === 'friendly' && <ellipse cx="200" cy="195" rx="66" ry="66" fill="url(#hair-grad-sarah)" />}
                   {persona === 'stern' && <ellipse cx="200" cy="185" rx="58" ry="58" fill="#0f172a" />}
                   {persona === 'curious' && <path d="M 230 190 Q 285 220 270 280 Q 235 240 240 195 Z" fill="url(#hair-grad-sophia)" />}

                   {persona === 'stern' ? (
                     <>
                       <path d="M 100 380 Q 200 310 300 380 L 320 420 L 80 420 Z" fill="url(#suit-grad)" />
                       <path d="M 165 325 L 200 375 L 235 325 Z" fill="#ffffff" />
                       <path d="M 193 335 L 200 420 L 207 335 Z" fill="#3b82f6" />
                     </>
                   ) : persona === 'curious' ? (
                     <>
                       <path d="M 110 380 Q 200 315 290 380 L 310 420 L 90 420 Z" fill="url(#top-grad)" />
                       <ellipse cx="200" cy="355" rx="22" ry="10" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
                       <polygon points="200,365 196,373 204,373" fill="#fbbf24" />
                     </>
                   ) : (
                     <>
                       <path d="M 115 380 Q 200 315 285 380 L 305 420 L 95 420 Z" fill="url(#blazer-grad-sarah)" />
                       <path d="M 170 325 L 200 368 L 230 325 Z" fill="#fffcf0" />
                       <path d="M 170 325 L 188 420 L 212 420 L 230 325 Z" fill="#2dd4bf" opacity="0.3" />
                     </>
                   )}

                   <rect x="184" y="235" width="32" height="52" fill={personaInfo.skinColor} rx="6" />
                   <path d="M 184 265 Q 200 278 216 265" fill="none" stroke="#e0a982" strokeWidth="2.5" />
                   <ellipse cx="200" cy="200" rx="52" ry="62" fill={personaInfo.skinColor} />

                   {persona === 'stern' && (
                     <>
                       <path d="M 149 190 C 149 248 165 264 200 264 C 235 264 251 248 251 190 C 251 210 243 256 200 256 C 157 256 149 210 149 190 Z" fill="url(#beard-grad)" opacity="0.9" />
                       <path d="M 182 232 Q 200 238 218 232 Q 200 234 182 232" fill="#0f172a" />
                     </>
                   )}

                   <circle cx="145" cy="208" r="8.5" fill={personaInfo.skinColor} />
                   <circle cx="255" cy="208" r="8.5" fill={personaInfo.skinColor} />
                   {persona === 'friendly' && (
                     <>
                       <circle cx="144" cy="214" r="3.5" fill="#f59e0b" />
                       <circle cx="256" cy="214" r="3.5" fill="#f59e0b" />
                     </>
                   )}
                   {persona === 'curious' && (
                     <>
                       <circle cx="145" cy="212" r="9" stroke="#fbbf24" strokeWidth="2" fill="none" />
                       <circle cx="255" cy="212" r="9" stroke="#fbbf24" strokeWidth="2" fill="none" />
                     </>
                   )}

                   <g className="animate-avatar-sway">
                      {persona === 'stern' ? (
                        <path d="M 147 185 C 145 130 255 125 253 185 C 244 152 218 148 200 152 C 180 148 156 152 147 185 Z" fill="#0f172a" />
                      ) : persona === 'curious' ? (
                        <path d="M 148 188 C 145 132 255 132 252 188 C 248 142 220 146 200 150 C 180 146 152 142 148 188 Z" fill="url(#hair-grad-sophia)" />
                      ) : (
                        <path d="M 141 195 C 139 125 261 125 259 195 C 265 210 260 230 250 240 C 248 215 240 180 200 180 C 160 180 152 215 150 240 C 140 230 135 210 141 195 Z" fill="url(#hair-grad-sarah)" />
                      )}

                      <path d={`M 160 ${174 - dyEyebrow} Q 174 ${168 - dyEyebrow} 187 ${173 - dyEyebrow}`} stroke={persona === 'stern' ? '#0f172a' : persona === 'curious' ? '#09090b' : '#431407'} strokeWidth="4" fill="none" strokeLinecap="round" />
                      <path d={`M 213 ${173 - dyEyebrow} Q 226 ${168 - dyEyebrow} 240 ${174 - dyEyebrow}`} stroke={persona === 'stern' ? '#0f172a' : persona === 'curious' ? '#09090b' : '#451a03'} strokeWidth="4" fill="none" strokeLinecap="round" />

                      {isBlinking ? (
                        <>
                          <path d="M 168 193 Q 180 198 192 193" stroke={persona === 'stern' ? '#0f172a' : '#27272a'} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                          <path d="M 208 193 Q 220 198 232 193" stroke={persona === 'stern' ? '#0f172a' : '#27272a'} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                        </>
                      ) : (
                        <>
                          <ellipse cx="180" cy="193" rx="11" ry="7.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
                          <ellipse cx="220" cy="193" rx="11" ry="7.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
                          <circle cx={180 + dxPupil} cy={193 + dyPupil} r="5.5" fill={persona === 'stern' ? '#1e293b' : persona === 'curious' ? '#451a03' : '#1e3a8a'} />
                          <circle cx={220 + dxPupil} cy={193 + dyPupil} r="5.5" fill={persona === 'stern' ? '#1e293b' : persona === 'curious' ? '#451a03' : '#1e3a8a'} />
                          <circle cx={178 + dxPupil} cy={191 + dyPupil} r="1.8" fill="#ffffff" />
                          <circle cx={218 + dxPupil} cy={191 + dyPupil} r="1.8" fill="#ffffff" />
                        </>
                      )}

                      {persona === 'friendly' && (
                        <>
                          <circle cx="180" cy="193" r="17" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.85" />
                          <circle cx="220" cy="193" r="17" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.85" />
                          <line x1="197" y1="193" x2="203" y2="193" stroke="#fbbf24" strokeWidth="2" />
                          <path d="M 163 193 Q 152 191 146 197" stroke="#fbbf24" strokeWidth="1.8" fill="none" opacity="0.8" />
                          <path d="M 237 193 Q 248 191 254 197" stroke="#fbbf24" strokeWidth="1.8" fill="none" opacity="0.8" />
                        </>
                      )}
                      {persona === 'stern' && (
                        <>
                          <rect x="157" y="178" width="32" height="24" rx="4" stroke="#475569" strokeWidth="2.5" fill="none" opacity="0.85" />
                          <rect x="211" y="178" width="32" height="24" rx="4" stroke="#475569" strokeWidth="2.5" fill="none" opacity="0.85" />
                          <line x1="189" y1="187" x2="211" y2="187" stroke="#475569" strokeWidth="2.5" />
                          <line x1="157" y1="183" x2="149" y2="186" stroke="#475569" strokeWidth="2" />
                          <line x1="243" y1="183" x2="251" y2="186" stroke="#475569" strokeWidth="2" />
                        </>
                      )}

                      <path d="M 200 193 Q 196 216 200 221 Q 204 222 205 218" fill="none" stroke="#e0a982" strokeWidth="2.2" strokeLinecap="round" />

                      {persona === 'friendly' && (
                        <>
                          <ellipse cx="160" cy="218" rx="8" ry="4" fill="#f43f5e" opacity="0.12" />
                          <ellipse cx="240" cy="218" rx="8" ry="4" fill="#f43f5e" opacity="0.12" />
                        </>
                      )}
                      {persona === 'curious' && (
                        <>
                          <ellipse cx="162" cy="218" rx="6" ry="3" fill="#f43f5e" opacity="0.1" />
                          <ellipse cx="238" cy="218" rx="6" ry="3" fill="#f43f5e" opacity="0.1" />
                        </>
                      )}

                      <g>
                        {finalOpen === 0 ? (
                          <path 
                            d={persona === 'friendly' 
                              ? "M 183 244 Q 200 252 217 244" 
                              : persona === 'stern' 
                              ? "M 185 245 Q 200 247 215 245" 
                              : "M 184 244 Q 200 249 216 244"} 
                            stroke={personaInfo.lipColor} 
                            strokeWidth={personaInfo.lipWidth} 
                            fill="none" 
                            strokeLinecap="round" 
                          />
                        ) : (
                          <>
                            <ellipse cx="200" cy={245 + finalOpen * 2} rx={mouthWidth} ry={mouthHeight} fill="#3f0712" />
                            <rect x={200 - mouthWidth + 3} y={245 - 0.5} width={mouthWidth * 2 - 6} height={Math.min(5, mouthHeight * 0.45)} fill="#ffffff" rx="1.5" />
                            <ellipse cx="200" cy={245 + mouthHeight - 1} rx={mouthWidth - 3} ry={Math.min(6, mouthHeight * 0.5)} fill="#fca5a5" />
                            <path d={`M ${200 - mouthWidth - 1} ${245} Q 200 ${245 - 4.5 * finalOpen} ${200 + mouthWidth + 1} ${245}`} stroke={personaInfo.lipColor} strokeWidth={personaInfo.lipWidth} fill="none" strokeLinecap="round" />
                            <path d={`M ${200 - mouthWidth - 1} ${245} Q 200 ${245 + mouthHeight + 1.5} ${200 + mouthWidth + 1} ${245}`} stroke={personaInfo.lipColor} strokeWidth={personaInfo.lipWidth} fill="none" strokeLinecap="round" />
                          </>
                        )}
                      </g>
                   </g>
                </g>
             </svg>

             {status === 'thinking' && (
                 <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                     <div className="flex gap-2 bg-black/85 px-4 py-2.5 rounded-full border border-white/10 shadow-xl">
                         <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce delay-0"></div>
                         <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce delay-150"></div>
                         <div className="w-2.5 h-2.5 bg-brand-yellow rounded-full animate-bounce delay-300"></div>
                     </div>
                 </div>
             )}
          </div>

          <div className="mt-4 z-10 flex flex-col items-center">
              <div className={`px-4 py-1.5 rounded-full border ${personaInfo.badgeBg} backdrop-blur-md text-[10px] font-semibold tracking-wider uppercase shadow-md flex items-center gap-2`}>
                  <span className={`w-2 h-2 rounded-full ${status === 'speaking' ? 'bg-red-500 animate-ping' : status === 'listening' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>{status === 'speaking' ? t('InterviewScreen.transmitting_voice') : status === 'listening' ? t('InterviewScreen.awaiting_speech') : t('InterviewScreen.analyzing_mind')}</span>
              </div>
          </div>
      </div>
    );
};

const TranscriptionLog: React.FC<{ transcription: TranscriptionEntry[] }> = ({ transcription }) => {
  const { t } = useTranslation();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcription]);

  return (
    <div className="flex-grow space-y-4 p-4 overflow-y-auto custom-scrollbar font-mono text-sm h-full">
      {transcription.length === 0 && <p className="text-gray-600 text-center italic mt-10">{t('InterviewScreen.conversation_placeholder')}</p>}
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
  const { t } = useTranslation();
  const feedbackEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedbackEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feedback]);

  if (feedback.length === 0) {
    return <p className="text-gray-500 text-xs text-center p-4 italic">{t('InterviewScreen.feedback_placeholder')}</p>;
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
               <p className="text-xs font-bold text-brand-yellow uppercase tracking-wide mb-1">{t('InterviewScreen.feedback_label')}</p>
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
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const currentConfidenceRef = useRef<number>(85);
  const confidenceTrendRef = useRef<{time: string, confidence: number}[]>([]);
  
  const { transcription, aiStatus, isConnecting, error, endInterview, feedback, aiAudioStream, retry, suspendAudio, resumeAudio } = useInterview(config);

  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  useGlobalShortcuts({
    ' ': (e) => {
      if (sessionStarted && isFullscreen) {
        e.preventDefault();
        setIsManuallyPaused(prev => !prev);
      }
    }
  });

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
              setIsManuallyPaused(false);
              resumeAudio();
          } catch (err) {
              setSessionStarted(true);
              setIsFullscreen(true);
              setIsManuallyPaused(false);
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

  useEffect(() => {
    if (elapsedTime > 0 && elapsedTime % 5 === 0) {
      const timeStr = formatTime(elapsedTime);
      const exists = confidenceTrendRef.current.some(item => item.time === timeStr);
      if (!exists) {
        confidenceTrendRef.current.push({
          time: timeStr,
          confidence: Math.round(currentConfidenceRef.current)
        });
      }
    }
  }, [elapsedTime]);

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
    onEnd(transcription, feedback, confidenceTrendRef.current);
  }, [isRecording, stopAndSaveRecording, endInterview, onEnd, transcription, feedback]);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setVideoElement(videoRef.current);
        }
      } catch (err) {
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
        <p className="mt-8 text-xl font-light text-gray-300 tracking-wide">{t('InterviewScreen.neural_link_loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-lg mx-auto mt-20 p-8 glass-panel rounded-2xl text-center border border-red-500/30 shadow-[0_0_50px_rgba(234,67,53,0.1)]">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{t('InterviewScreen.connection_interrupted')}</h2>
        <p className="text-slate-600 dark:text-gray-400 mb-8">{error}</p>
        <div className="flex justify-center gap-4">
            <button onClick={retry} className="bg-slate-200 dark:bg-white text-slate-900 dark:text-black hover:bg-slate-300 dark:hover:bg-gray-200 font-bold py-3 px-8 rounded-xl transition-colors">{t('InterviewScreen.retry')}</button>
            <button onClick={() => onEnd(transcription, feedback, confidenceTrendRef.current)} className="bg-transparent border border-slate-300 dark:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-white font-bold py-3 px-8 rounded-xl transition-colors">{t('InterviewScreen.abort')}</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-[85vh] max-h-[900px] bg-gray-950 rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-fade-in border border-white/5 relative">
      
      {!sessionStarted && (
          <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-20 h-20 bg-brand-blue/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">{t('InterviewScreen.ready_to_begin')}</h2>
                <p className="text-gray-400 mb-10 max-w-md text-lg leading-relaxed">
                    <Trans i18nKey="InterviewScreen.fullscreen_instruction">
                      To ensure a distraction-free environment and realistic experience, the interview will take place in <span className="text-white font-semibold">Fullscreen Mode</span>.
                    </Trans>
                </p>
                <button 
                    onClick={handleStartSession}
                    className="px-8 py-4 bg-brand-blue hover:bg-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-brand-blue/30 transition-all transform hover:-translate-y-1"
                >
                    {t('InterviewScreen.enter_studio_start')}
                </button>
          </div>
      )}

      {sessionStarted && (!isFullscreen || isManuallyPaused) && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-fade-in">
               <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 text-yellow-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <h2 className="text-3xl font-bold text-white mb-3">{t('InterviewScreen.paused_session')}</h2>
               <p className="text-slate-600 dark:text-gray-400 mb-8 max-w-md">
                 {!isFullscreen ? t('InterviewScreen.paused_instruction') : t('InterviewScreen.paused_instruction')}
                 <br/><span className="text-sm mt-2 block">{t('InterviewScreen.paused_keyboard_hint')}</span>
               </p>
               <button 
                    onClick={() => {
                        if (!isFullscreen) handleStartSession();
                        else setIsManuallyPaused(false);
                    }}
                    className="px-8 py-3 bg-slate-200 dark:bg-white text-slate-900 dark:text-black hover:bg-slate-300 dark:hover:bg-gray-200 font-bold rounded-xl transition-colors"
                >
                    {t('InterviewScreen.resume_session')}
               </button>
          </div>
      )}

      <div className="h-16 bg-black/40 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${sessionStarted && isFullscreen ? 'bg-brand-green animate-pulse' : 'bg-yellow-500'}`}></div>
                 <span className="text-xs font-mono text-gray-300 tracking-widest uppercase">{sessionStarted && isFullscreen ? t('InterviewScreen.live_session') : t('InterviewScreen.standby')}</span>
              </div>
              <div className="h-4 w-px bg-gray-700"></div>
              <span className="text-sm text-gray-300 font-medium">{config.name}</span>
          </div>
          
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
        
        <div className="lg:w-3/5 bg-gradient-to-b from-gray-900 to-black relative flex flex-col">
           
           <div className="flex-1 relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                <AiAvatar status={aiStatus} persona={config.persona} audioStream={aiAudioStream} />
           </div>

           <div className="h-48 lg:h-64 relative bg-black border-t border-white/10 group overflow-hidden">
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100 opacity-80 group-hover:opacity-100 transition-opacity"></video>
                
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border border-dashed border-brand-blue/20 rounded-lg">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-blue/60"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-brand-blue/60"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-brand-blue/60"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-blue/60"></div>
                        
                        <div className="absolute w-full h-0.5 bg-brand-blue/30 top-0 left-0 shadow-[0_0_8px_#3b82f6] animate-[scan_4s_ease-in-out_infinite]"></div>
                        
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-brand-blue font-mono border border-brand-blue/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
                            {t('InterviewScreen.engagement_feedback_active')}
                        </div>
                    </div>
                </div>

                <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono border border-white/10">{t('InterviewScreen.you_label')}</div>
                {isRecording && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500/20 border border-red-500/50 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-red-500 uppercase">{t('InterviewScreen.rec_indicator')}</span>
                    </div>
                )}
           </div>
        </div>

        <div className="lg:w-2/5 flex flex-col border-l border-white/5 bg-black/20 backdrop-blur-sm overflow-y-auto custom-scrollbar">
            
            <div className="flex-[2] flex flex-col min-h-[200px]">
                <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('InterviewScreen.live_transcript')}</span>
                </div>
                <TranscriptionLog transcription={transcription} />
            </div>

            <div className="p-3 border-t border-white/10 bg-black/10">
                <EmotionTracker 
                  videoElement={videoElement} 
                  isRecording={isRecording} 
                  aiStatus={aiStatus} 
                  onConfidenceUpdate={(val) => { currentConfidenceRef.current = val; }}
                />
            </div>

            <div className="flex-1 min-h-[150px] border-t border-white/10 flex flex-col bg-black/20">
                 <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('InterviewScreen.analysis_stream')}</span>
                </div>
                <FeedbackLog feedback={feedback} />
            </div>
        </div>
      </div>

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
                 {isRecording ? (isSaving ? t('InterviewScreen.saving') : t('InterviewScreen.stop_recording')) : t('InterviewScreen.record_session')}
              </button>
          )}

          <button 
            onClick={handleEndClick}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-brand-red hover:bg-red-600 text-white font-bold shadow-lg hover:shadow-red-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
             {isSaving ? t('InterviewScreen.finalizing') : t('InterviewScreen.end_interview')}
          </button>
      </div>
    </div>
  );
};

export default InterviewScreen;