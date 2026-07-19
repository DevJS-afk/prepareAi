import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation, Trans } from 'react-i18next';

interface EmotionTrackerProps {
  videoElement: HTMLVideoElement | null;
  isRecording: boolean;
  aiStatus: 'connecting' | 'listening' | 'speaking' | 'thinking';
  onConfidenceUpdate?: (confidence: number) => void;
}

interface MetricHistory {
  confidence: number;
  engagement: number;
  motion: number;
}

export const EmotionTracker: React.FC<EmotionTrackerProps> = ({
  videoElement,
  isRecording,
  aiStatus,
  onConfidenceUpdate,
}) => {
  const { t } = useTranslation();
  const [motionIntensity, setMotionIntensity] = useState(0);
  const [confidence, setConfidence] = useState(85);
  const [engagement, setEngagement] = useState(88);
  const [primaryState, setPrimaryState] = useState<'focused' | 'calm' | 'expressive' | 'reflective' | 'fidgety'>('focused');
  
  const [history, setHistory] = useState<MetricHistory[]>([
    { confidence: 85, engagement: 88, motion: 5 },
    { confidence: 85, engagement: 88, motion: 6 },
    { confidence: 86, engagement: 89, motion: 4 },
  ]);

  const prevFramePixels = useRef<Uint8ClampedArray | null>(null);

  useEffect(() => {
    if (!videoElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');

    let intervalId: number;

    const processFrame = () => {
      if (!videoElement || videoElement.paused || videoElement.ended) return;
      if (!ctx) return;

      try {
        ctx.drawImage(videoElement, 0, 0, 40, 40);
        const imgData = ctx.getImageData(0, 0, 40, 40);
        const pixels = imgData.data;

        if (prevFramePixels.current) {
          let totalDiff = 0;
          let pixelCount = 0;

          for (let i = 0; i < pixels.length; i += 16) {
            const rDiff = Math.abs(pixels[i] - prevFramePixels.current[i]);
            const gDiff = Math.abs(pixels[i + 1] - prevFramePixels.current[i + 1]);
            const bDiff = Math.abs(pixels[i + 2] - prevFramePixels.current[i + 2]);
            
            const diff = (rDiff + gDiff + bDiff) / 3;
            totalDiff += diff;
            pixelCount++;
          }

          const avgDiff = totalDiff / pixelCount;
          const rawMotion = Math.min(100, (avgDiff / 32) * 100);
          
          setMotionIntensity(prev => {
            const smoothed = prev * 0.4 + rawMotion * 0.6;
            return Math.round(smoothed * 10) / 10;
          });
        }

        prevFramePixels.current = pixels;
      } catch (err) {}
    };

    intervalId = window.setInterval(processFrame, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, [videoElement]);

  useEffect(() => {
    let targetConfidence = 85;
    let targetEngagement = 88;
    let state: 'focused' | 'calm' | 'expressive' | 'reflective' | 'fidgety' = 'focused';

    if (motionIntensity > 22) {
      state = 'fidgety';
      targetConfidence = Math.max(62, confidence - 3);
      targetEngagement = Math.min(95, engagement + 1);
    } else if (motionIntensity > 8) {
      state = 'expressive';
      targetConfidence = Math.min(98, confidence + 2);
      targetEngagement = Math.min(98, engagement + 2);
    } else if (motionIntensity > 2) {
      state = 'focused';
      targetConfidence = Math.min(95, confidence + 0.5);
      targetEngagement = Math.min(92, engagement + 0.5);
    } else {
      if (aiStatus === 'listening') {
        state = 'reflective';
        targetConfidence = Math.max(80, confidence - 0.5);
        targetEngagement = Math.max(75, engagement - 1);
      } else {
        state = 'calm';
        targetConfidence = Math.min(92, confidence + 0.2);
        targetEngagement = Math.max(80, engagement - 0.5);
      }
    }

    if (aiStatus === 'listening' && state !== 'fidgety') {
      targetEngagement = Math.min(99, targetEngagement + 5);
      targetConfidence = Math.min(97, targetConfidence + 2);
    }

    const timer = setTimeout(() => {
      setConfidence(prev => {
        const step = (targetConfidence - prev) * 0.15;
        const val = Math.round((prev + step) * 10) / 10;
        if (onConfidenceUpdate) {
          onConfidenceUpdate(val);
        }
        return val;
      });
      setEngagement(prev => {
        const step = (targetEngagement - prev) * 0.15;
        return Math.round((prev + step) * 10) / 10;
      });
      setPrimaryState(state);
    }, 100);

    return () => clearTimeout(timer);
  }, [motionIntensity, aiStatus]);

  useEffect(() => {
    const historyTimer = setInterval(() => {
      setHistory(prev => {
        const nextItem = { confidence, engagement, motion: motionIntensity };
        const updated = [...prev, nextItem];
        if (updated.length > 20) {
          updated.shift();
        }
        return updated;
      });
    }, 1200);

    return () => clearInterval(historyTimer);
  }, [confidence, engagement, motionIntensity]);

  const stateConfig = {
    focused: {
      label: t('EmotionTracker.state_focused_label'),
      color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      description: t('EmotionTracker.state_focused_desc'),
    },
    calm: {
      label: t('EmotionTracker.state_calm_label'),
      color: 'bg-teal-500/15 border-teal-500/30 text-teal-300',
      description: t('EmotionTracker.state_calm_desc'),
    },
    expressive: {
      label: t('EmotionTracker.state_expressive_label'),
      color: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
      description: t('EmotionTracker.state_expressive_desc'),
    },
    reflective: {
      label: t('EmotionTracker.state_reflective_label'),
      color: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
      description: t('EmotionTracker.state_reflective_desc'),
    },
    fidgety: {
      label: t('EmotionTracker.state_fidgety_label'),
      color: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      description: t('EmotionTracker.state_fidgety_desc'),
    },
  }[primaryState];

  return (
    <div className="bg-black/35 rounded-xl border border-white/5 p-4 flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-ping"></div>
          <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider uppercase">{t('EmotionTracker.kinesics_analytics')}</span>
        </div>
        <div className="text-[10px] font-mono text-gray-500">
          {isRecording ? t('EmotionTracker.status_recording') : t('EmotionTracker.status_active')}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex flex-col gap-1">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t('EmotionTracker.confidence_score')}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-sans text-white">{Math.round(confidence)}%</span>
            <span className="text-[10px] text-brand-green font-mono">{t('EmotionTracker.stable')}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1 mt-1.5 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-brand-blue to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex flex-col gap-1">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{t('EmotionTracker.engagement_level')}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-sans text-white">{Math.round(engagement)}%</span>
            <span className="text-[10px] text-brand-blue font-mono">{t('EmotionTracker.active')}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1 mt-1.5 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${engagement}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className={`p-3 rounded-lg border flex flex-col gap-1 transition-all duration-300 ${stateConfig.color}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest">{t('EmotionTracker.postural_stance')}</span>
          <span className="text-[10px] font-mono opacity-80">{t('EmotionTracker.kinesics_intensity', { intensity: motionIntensity })}</span>
        </div>
        <div className="text-sm font-bold mt-0.5">{stateConfig.label}</div>
        <p className="text-xs leading-relaxed opacity-90 mt-1">{stateConfig.description}</p>
      </div>

      <div className="bg-black/40 rounded-lg p-3 border border-white/5 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
          <span>{t('EmotionTracker.engagement_sparkline')}</span>
          <span>{t('EmotionTracker.motion_spark')}</span>
        </div>
        <div className="h-8 flex items-end gap-0.5 px-1 relative">
          {history.map((h, i) => {
            const heightPercent = Math.min(100, Math.max(8, h.motion * 2.5 + 10));
            return (
              <div 
                key={i} 
                className="flex-1 rounded-t-sm transition-all duration-300" 
                style={{ 
                  height: `${heightPercent}%`,
                  backgroundColor: h.motion > 20 ? '#f59e0b' : h.motion > 8 ? '#3b82f6' : '#14b8a6',
                  opacity: 0.45 + (i / history.length) * 0.55
                }} 
              />
            );
          })}
          {history.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-600 font-mono italic">
              {t('EmotionTracker.awaiting_signal')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};