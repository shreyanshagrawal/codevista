import { useEffect, useState, useRef } from 'react';

export default function LinkedListVisualizer({ step }) {
  if (!step || !step.data || !step.data.listValues) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in" style={{ background: 'var(--color-bg-surface)' }}>
        <div className="text-6xl opacity-20">⧖</div>
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Waiting for linked list traversal steps...
        </div>
      </div>
    );
  }

  const { listValues, activeNodeIndex, pointerPosition } = step.data;
  
  const NODE_WIDTH = 80;
  const GAP = 60;
  const STEP_SIZE = NODE_WIDTH + GAP;
  const PADDING_LEFT = 40;
  const POINTER_WIDTH = 60;

  // Calculate the exact pixel translation for the pointer
  // Center it above the target position (which can be fractional like 0.5 when moving)
  const pointerX = pointerPosition === 'null' 
    ? -9999 // Hide it if null (handled by condition anyway)
    : PADDING_LEFT + (pointerPosition * STEP_SIZE) + (NODE_WIDTH / 2) - (POINTER_WIDTH / 2);

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative overflow-hidden animate-fade-in" style={{ background: 'var(--color-bg-surface)' }}>
      {/* The linked list container */}
      <div className="flex items-center relative" style={{ paddingLeft: PADDING_LEFT, paddingRight: PADDING_LEFT }}>
        {listValues.map((val, i) => {
          const isActive = activeNodeIndex === i;
          return (
            <div key={i} className="flex items-center shrink-0">
              {/* Node Box */}
              <div
                className="flex items-center justify-center rounded-xl transition-all duration-300"
                style={{
                  width: NODE_WIDTH,
                  height: NODE_WIDTH,
                  background: isActive ? 'var(--color-bg-elevated)' : 'var(--color-bg-panel)',
                  border: `2px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  boxShadow: isActive ? '0 0 20px var(--color-accent-glow)' : '0 4px 6px rgba(0,0,0,0.3)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  zIndex: isActive ? 10 : 1
                }}
              >
                <span className="text-xl font-mono" style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                  {val}
                </span>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center relative" style={{ width: GAP }}>
                {/* Arrow line */}
                <div className="h-0.5 w-full transition-colors duration-300" 
                     style={{ background: isActive ? 'var(--color-accent)' : 'var(--color-border-bright)' }} />
                {/* Arrow head */}
                <div 
                  className="absolute right-0 w-3 h-3 border-t-2 border-r-2 rotate-45 transform translate-x-[2px] transition-colors duration-300" 
                  style={{ borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border-bright)' }}
                />
              </div>
            </div>
          );
        })}
        
        {/* Null Node */}
        <div 
          className="flex items-center justify-center rounded-xl border-2 border-dashed shrink-0"
          style={{
             width: NODE_WIDTH,
             height: NODE_WIDTH,
             borderColor: 'var(--color-border)',
             background: 'transparent'
          }}
        >
          <span className="font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>null</span>
        </div>

        {/* Floating Pointer (Current) */}
        {pointerPosition !== 'null' && (
          <div
            className="absolute -top-16 flex flex-col items-center transition-transform ease-in-out"
            style={{ 
              left: 0,
              transform: `translateX(${pointerX}px)`,
              width: `${POINTER_WIDTH}px`,
              transitionDuration: '150ms'
            }}
          >
            <span 
              className="text-xs font-mono px-2 py-1 rounded mb-2 shadow-lg"
              style={{ background: 'var(--color-accent-3)', color: '#fff' }}
            >
              current
            </span>
            <div 
              className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] animate-bounce" 
              style={{ borderTopColor: 'var(--color-accent-3)' }}
            />
          </div>
        )}
      </div>
      
    </div>
  );
}
