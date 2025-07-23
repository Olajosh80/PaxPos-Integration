import { useEffect, useState } from 'react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Initializing PAX A920 Terminal...',
    'Connecting to PAX Terminal...',
    'Loading Payment Methods...',
    'Checking Hardware...',
    'Ready to Process Payments!'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(stepInterval);
  }, [steps.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 sm:p-12 max-w-md w-full text-center border border-white/20 shadow-2xl">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-4xl">💳</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PAX A920 POS</h1>
          <p className="text-white/80 text-lg">Terminal System</p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
            {/* Progress ring */}
            <div 
              className="absolute inset-0 border-4 border-white border-transparent rounded-full transition-all duration-300 ease-out"
              style={{
                borderTopColor: 'white',
                borderRightColor: progress > 25 ? 'white' : 'transparent',
                borderBottomColor: progress > 50 ? 'white' : 'transparent',
                borderLeftColor: progress > 75 ? 'white' : 'transparent',
                transform: `rotate(${progress * 3.6}deg)`
              }}
            ></div>
            {/* Center circle */}
            <div className="absolute inset-4 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Status text */}
        <div className="text-white/90 text-lg font-medium min-h-[1.5rem]">
          {steps[currentStep]}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
