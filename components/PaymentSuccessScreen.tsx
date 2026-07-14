
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface PaymentSuccessScreenProps {
  onContinue: () => void;
  planName: string;
}

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({ onContinue, planName }) => {
  
  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center animate-fade-in text-center p-6">
      <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-brand-green/20 rounded-full animate-ping"></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Payment Successful!</h1>
      <p className="text-xl text-gray-300 max-w-lg mb-8 leading-relaxed">
          Thank you for subscribing to the <strong className="text-white">{planName}</strong> plan. Your account has been upgraded and you now have access to all premium features.
      </p>

      <button 
        onClick={onContinue}
        className="px-10 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
      >
          Go to Dashboard
      </button>
    </div>
  );
};

export default PaymentSuccessScreen;
