
import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import type { LiveServerMessage, Blob, GenerateContentResponse } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../services/audioUtils';
import type { TranscriptionEntry, InterviewConfig, FeedbackEntry, } from '../types';

// Define a local type for the live session object as LiveSession is not exported from the SDK.
type LiveSession = {
  sendRealtimeInput: (input: { audio: Blob; }) => void;
  close: () => void;
};

export const useInterview = (config: InterviewConfig) => {
  const [transcription, setTranscription] = useState<TranscriptionEntry[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [aiStatus, setAiStatus] = useState<'connecting' | 'listening' | 'speaking' | 'thinking'>('connecting');
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAudioStream, setAiAudioStream] = useState<MediaStream | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const sessionRef = useRef<LiveSession | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const interruptIdRef = useRef(0);
  const isSessionClosedRef = useRef(false);
  const audioQueuePromiseRef = useRef<Promise<void>>(Promise.resolve());
  const transcriptionRef = useRef(transcription);
  const isAiSpeakingRef = useRef(false);
  useEffect(() => {
    transcriptionRef.current = transcription;
  }, [transcription]);

  const getFeedbackForAnswer = useCallback(async (userAnswer: string) => {
    if (!aiRef.current) return;
    setAiStatus('thinking');
    try {
      const lastAiQuestion = [...transcriptionRef.current]
        .reverse()
        .find(entry => entry.speaker === 'ai')?.text || "your introduction";

      const prompt = `You are an expert career coach providing feedback for a job interview simulation for the role of ${config.name}.
    
The interviewer asked: "${lastAiQuestion}"

The candidate responded: "${userAnswer}"

Analyze the candidate's response. Provide brief (1-2 sentences), constructive, and actionable feedback. If possible, refer to a specific part of their answer to make the feedback more concrete. For example, instead of "be more specific", you could say "When you mentioned 'handling a project,' giving a concrete example with metrics would have made your answer stronger." Frame the feedback positively.`;
      
      const response: GenerateContentResponse = await aiRef.current.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });
      const feedbackText = response.text;
      if (feedbackText) {
          setFeedback(prev => [...prev, { userText: userAnswer, feedbackText }]);
      }
    } catch (error) {
      const errStrConsole2 = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error || {}));
      if (!(errStrConsole2.includes("429") || errStrConsole2.toLowerCase().includes("quota"))) {
        console.error("Error getting feedback:", error);
      }
    } finally {
      setAiStatus('listening');
    }
  }, [config]);

  const endInterview = useCallback(() => {
    isSessionClosedRef.current = true;
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
    }
  }, []);

  const suspendAudio = useCallback(async () => {
      if (inputAudioContextRef.current?.state === 'running') await inputAudioContextRef.current.suspend();
      if (outputAudioContextRef.current?.state === 'running') await outputAudioContextRef.current.suspend();
  }, []);

  const resumeAudio = useCallback(async () => {
      if (inputAudioContextRef.current?.state === 'suspended') await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current?.state === 'suspended') await outputAudioContextRef.current.resume();
  }, []);

  const retry = useCallback(() => {
    setError(null);
    setIsConnecting(true);
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY environment variable not set.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });

        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const outputNode = outputAudioContextRef.current.createGain();
        outputNode.connect(outputAudioContextRef.current.destination);

        const destinationNode = outputAudioContextRef.current.createMediaStreamDestination();
        outputNode.connect(destinationNode);
        if (isMounted) {
          setAiAudioStream(destinationNode.stream);
        }

        isSessionClosedRef.current = false;
        const sessionPromise = aiRef.current.live.connect({
          model: 'gemini-3.1-flash-live-preview',
          callbacks: {
            onopen: () => {
              if (!isMounted) return;
              setIsConnecting(false);
              setAiStatus('listening');
              
              // Kickstart the conversation with a silent packet to make the AI speak first.
              sessionPromise.then((session) => {
                if (!isSessionClosedRef.current) {
                  try {
                    const silence = new Float32Array(1600); // 100ms of silence
                    const silentBlob = createBlob(silence);
                    session.sendRealtimeInput({ audio: silentBlob });
                  } catch(e) { console.warn("Failed to send silent kickstart", e); }
                }
              });

              mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(stream);
              scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);

              scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const isPlayingAudio = outputAudioContextRef.current && (nextStartTimeRef.current > outputAudioContextRef.current.currentTime);
                if (isAiSpeakingRef.current || isPlayingAudio || isSessionClosedRef.current) return;
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob: Blob = createBlob(inputData);
                sessionPromise.then((session) => {
                  if (!isSessionClosedRef.current) {
                    try {
                      session.sendRealtimeInput({ audio: pcmBlob });
                    } catch(e) {
                      console.warn("Failed to send audio", e);
                    }
                  }
                });
              };
              
              mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
              scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                if (!isMounted) return;

                if(message.serverContent?.modelTurn) {
                    setAiStatus('speaking');
                    isAiSpeakingRef.current = true;
                }

                if (message.serverContent?.outputTranscription) {
                    currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                }
                if (message.serverContent?.inputTranscription) {
                    currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                }
                if (message.serverContent?.turnComplete) {
                    isAiSpeakingRef.current = false;
                    const userInput = currentInputTranscriptionRef.current.trim();
                    const aiResponse = currentOutputTranscriptionRef.current.trim();
                    setTranscription(prev => {
                        const updatedTranscription = [...prev];
                        if (userInput) {
                            updatedTranscription.push({ speaker: 'user', text: userInput });
                        }
                        if (aiResponse) {
                            updatedTranscription.push({ speaker: 'ai', text: aiResponse });
                        }
                        return updatedTranscription;
                    });
                    
                    if (userInput) {
                      getFeedbackForAnswer(userInput);
                    } else {
                      setAiStatus('listening');
                    }
                    
                    currentInputTranscriptionRef.current = '';
                    currentOutputTranscriptionRef.current = '';
                }

                const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
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
                }
                const interrupted = message.serverContent?.interrupted;
                if (interrupted) {
                    interruptIdRef.current++;
                    for (const source of audioSourcesRef.current.values()) {
                        source.stop();
                    }
                    audioSourcesRef.current.clear();
                    nextStartTimeRef.current = 0;
                    // When the AI interrupts, discard any partial transcriptions for the aborted turn.
                    currentInputTranscriptionRef.current = '';
                    currentOutputTranscriptionRef.current = '';
                }
            },
            onerror: (e: ErrorEvent) => {
                if (!isMounted) return;
                console.error("Gemini session error:", e);
                setError("An error occurred with the AI session. Please try again.");
                endInterview();
            },
            onclose: () => {
                if (!isMounted) return;
                console.log("Gemini session closed.");
                isSessionClosedRef.current = true;
                if (sessionRef.current) {
                   sessionRef.current = null;
                }
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: config.systemInstruction,
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.9,
            },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          },
        });
        
        sessionRef.current = await sessionPromise;

      } catch (e) {
        if (!isMounted) return;
        const errStrConsole = String(e) + " " + JSON.stringify(e, Object.getOwnPropertyNames(e || {}));
        if (!(errStrConsole.includes("429") || errStrConsole.toLowerCase().includes("quota"))) {
          console.error("Initialization failed:", e);
        }
        let errorMessage = e instanceof Error ? e.message : "An unknown error occurred during setup.";
        const errStr = String(e) + " " + JSON.stringify(e, Object.getOwnPropertyNames(e || {}));
        if (errStr.includes("429") || errStr.toLowerCase().includes("quota")) {
            errorMessage = "We have temporarily exceeded our AI service quota. Please try again later.";
        }
        setError(`Failed to initialize interview: ${errorMessage}`);
        setIsConnecting(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
      endInterview();
    };
  }, [endInterview, getFeedbackForAnswer, config, retryCount]);

  return { transcription, aiStatus, isConnecting, error, endInterview, feedback, aiAudioStream, retry, suspendAudio, resumeAudio };
};
