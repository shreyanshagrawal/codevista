import { useState, useEffect } from 'react';

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem('codevista_onboarding');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('codevista_onboarding', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to CodeVista ⬡",
      content: "CodeVista is a pedagogical code execution visualizer. It helps you see exactly how your code runs, step-by-step, to understand algorithms and data structures.",
    },
    {
      title: "1. The Code Editor",
      content: "On the left, you can write Python or Javascript-like pseudocode. You can click on line numbers to toggle breakpoints!",
    },
    {
      title: "2. Visualization Modes",
      content: "At the top of the canvas, switch between General Flowchart, Linked List, Binary Tree, or Recursion. Each mode is optimized to visualize specific algorithmic patterns.",
    },
    {
      title: "3. Execution Engine",
      content: "Use the bottom Control Bar to Play, Step Forward (F10), Step Backward (Shift+F10), or Stop (Shift+F5). Adjust playback speed to your liking.",
    },
    {
      title: "4. The Debug Panel",
      content: "On the right, monitor real-time Variables, the Call Stack, and Console Output. If your code has a syntax error, it will appear in the Output tab and highlight in the editor.",
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-[450px] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-bottom"
        style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border-bright)' }}
      >
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-panel)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {steps[step].title}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        
        <div className="px-6 py-6" style={{ color: 'var(--color-text-secondary)', minHeight: '120px' }}>
          <p className="leading-relaxed">{steps[step].content}</p>
        </div>

        <div 
          className="px-6 py-4 flex items-center justify-between border-t"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-panel)' }}
        >
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${i === step ? 'w-4' : ''}`}
                style={{ background: i === step ? 'var(--color-accent)' : 'var(--color-border)' }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-1.5 rounded text-sm transition-colors hover:bg-white/10"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Back
              </button>
            )}
            
            {step < steps.length - 1 ? (
              <button 
                onClick={() => setStep(s => s + 1)}
                className="px-4 py-1.5 rounded text-sm shadow-lg font-medium"
                style={{ background: 'linear-gradient(135deg, var(--color-accent), #5b54e8)', color: '#fff' }}
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleClose}
                className="px-4 py-1.5 rounded text-sm shadow-lg font-medium"
                style={{ background: 'linear-gradient(135deg, var(--color-accent-2), #00b38f)', color: '#fff' }}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
