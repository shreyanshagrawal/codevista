import React from 'react';

export default function RecursionVisualizer({ step }) {
  if (!step || !step.data || !step.data.stack) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in" style={{ background: 'var(--color-bg-surface)' }}>
        <div className="text-6xl opacity-20">▤</div>
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Waiting for recursion simulation steps...
        </div>
      </div>
    );
  }

  const { stack, currentFrame, message, returnedValue } = step.data;

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative overflow-hidden animate-fade-in" style={{ background: 'var(--color-bg-surface)' }}>
      
      {/* Visual Stack Container: flex-col-reverse makes it grow upwards! */}
      <div 
        className="flex flex-col-reverse items-center justify-start w-full max-w-md h-3/4 gap-3 pb-2 relative overflow-y-auto"
        style={{ borderBottom: '4px solid var(--color-border)' }}
      >
        {stack.length === 0 && (
          <div className="text-xs font-mono absolute bottom-4 opacity-50" style={{ color: 'var(--color-text-muted)' }}>
            Stack is empty
          </div>
        )}

        {/* Render each frame in the stack */}
        {stack.map((frame, index) => {
          const isActive = currentFrame && frame.id === currentFrame.id;
          
          let bg = 'var(--color-bg-panel)';
          let borderColor = 'var(--color-border)';

          if (isActive) {
            bg = 'var(--color-bg-elevated)';
            borderColor = 'var(--color-accent)';
          } else if (frame.status === 'waiting') {
            bg = 'var(--color-bg-base)';
            borderColor = 'var(--color-border-bright)';
          } else if (frame.status === 'returning') {
            bg = 'var(--color-accent-glow)';
            borderColor = 'var(--color-accent-2)';
          }

          return (
            <div
              key={frame.id}
              className="w-64 p-4 rounded-xl border-2 shadow-lg transition-all duration-300 flex justify-between items-center shrink-0 animate-fade-in"
              style={{
                background: bg,
                borderColor: borderColor,
                boxShadow: isActive ? '0 0 20px var(--color-accent-glow)' : '0 4px 6px rgba(0,0,0,0.3)',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                zIndex: isActive ? 10 : 1,
              }}
            >
              {/* Function Signature */}
              <div className="flex flex-col">
                <span className="font-mono font-bold" style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                  factorial
                </span>
                <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  n = <span className="font-bold" style={{ color: 'var(--color-syntax-number)' }}>{frame.n}</span>
                </span>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center">
                {frame.status === 'calling' && <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>Calling...</span>}
                {frame.status === 'waiting' && <span className="text-xs font-mono" style={{ color: '#fcd34d' }}>Waiting ⧖</span>}
                {frame.status === 'computing' && <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-accent)' }}>Computing ⚙</span>}
                {frame.status === 'base_case' && <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-accent-2)' }}>Base Case!</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Result Value for Return/Pop Steps */}
      {returnedValue !== null && (step.action === 'pop' || step.action === 'base_case') && (
        <div 
          className="absolute font-mono text-3xl font-bold animate-bounce z-20"
          style={{
            top: '20%',
            color: 'var(--color-accent-2)',
            textShadow: '0 0 15px rgba(0, 212, 170, 0.5)' // matches accent-2 glow
          }}
        >
          {step.action === 'pop' ? 'Returns' : 'Yields'} {returnedValue}
        </div>
      )}

      {/* Step Message Floating at Bottom */}
      <div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-sm font-mono shadow-xl transition-all border w-11/12 max-w-lg text-center"
        style={{
          background: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-bright)',
          color: 'var(--color-text-secondary)'
        }}
      >
        {message}
      </div>
      
    </div>
  );
}
