import { useRef, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { highlightLine } from '../utils/formatters';

const LANG_OPTIONS = ['javascript', 'typescript', 'python', 'rust', 'go'];

export default function CodeEditorPanel() {
  const { state, actions } = useAppStore();
  const textareaRef = useRef(null);
  const [localCode, setLocalCode] = useState(state.code);

  // Sync local → store with a slight debounce feel
  useEffect(() => {
    const t = setTimeout(() => actions.setCode(localCode), 300);
    return () => clearTimeout(t);
  }, [localCode, actions]);

  const lines = localCode.split('\n');
  const activeLine = state.steps?.[state.currentStep]?.line || null;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newCode = localCode.slice(0, start) + '  ' + localCode.slice(end);
      setLocalCode(newCode);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  }, [localCode]);

  const handleLineClick = useCallback((lineNum) => {
    actions.toggleBreakpoint(lineNum);
  }, [actions]);

  return (
    <aside
      className="flex flex-col h-full animate-slide-left"
      style={{ width: state.layout.leftWidth, minWidth: 280, maxWidth: 560 }}
    >


      {/* Editor body */}
      <div
        className="flex-1 overflow-auto relative font-mono text-sm"
        style={{ background: 'var(--color-bg-panel)' }}
      >
        <div className="flex" style={{ minHeight: '100%', minWidth: '100%', width: 'fit-content' }}>
          {/* Gutter: line numbers + breakpoints */}
          <div
            className="select-none shrink-0 py-4 border-r"
            style={{
              background: 'var(--color-bg-base)',
              borderColor: 'var(--color-border)',
              minWidth: '3.5rem',
            }}
          >
            {lines.map((_, i) => {
              const lineNum = i + 1;
              const hasBP = state.breakpoints.has(lineNum);
              const isActive = activeLine === lineNum;
              
              return (
                <div
                  key={i}
                  onClick={() => handleLineClick(lineNum)}
                  className="flex items-center justify-end pr-2 pl-2 cursor-pointer group relative transition-colors duration-200"
                  style={{ 
                    height: '1.5rem', 
                    lineHeight: '1.5rem',
                    background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                    color: isActive ? 'var(--color-accent)' : 'inherit'
                  }}
                  title={hasBP ? 'Remove breakpoint' : 'Add breakpoint'}
                >
                  {/* Breakpoint dot */}
                  <span
                    className={`absolute left-1.5 w-2 h-2 rounded-full transition-all ${
                      hasBP ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                    }`}
                    style={{ background: 'var(--color-accent-3)', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <span className="line-number">{lineNum}</span>
                </div>
              );
            })}
          </div>

          {/* Code area (hidden textarea + rendered highlight overlay) */}
          <div className="flex-1 grid">
            {/* Rendered highlight layer */}
            <div
              className="py-4 px-4 pointer-events-none"
              style={{ gridArea: '1/1', minWidth: 'max-content' }}
              aria-hidden="true"
            >
              {lines.map((line, i) => {
                const isActive = activeLine === (i + 1);
                return (
                  <div
                    key={i}
                    className="whitespace-pre transition-colors duration-200"
                    style={{ 
                      height: '1.5rem', 
                      lineHeight: '1.5rem', 
                      fontSize: '0.8125rem', 
                      color: 'var(--color-text-secondary)',
                      background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                      borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                      marginLeft: '-1rem', // Counteract padding to make background full width
                      paddingLeft: 'calc(1rem - 2px)', // minus border width
                      width: 'calc(100% + 2rem)'
                    }}
                    dangerouslySetInnerHTML={{ __html: highlightLine(line) || '&nbsp;' }}
                  />
                );
              })}
            </div>

            {/* Actual editable textarea (transparent on top) */}
            <textarea
              ref={textareaRef}
              value={localCode}
              onChange={(e) => setLocalCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              wrap="off"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className="resize-none outline-none py-4 px-4 font-mono caret-violet-400"
              style={{
                gridArea: '1/1',
                minWidth: 'max-content',
                overflow: 'hidden',
                fontSize: '0.8125rem',
                lineHeight: '1.5rem',
                color: 'transparent',
                background: 'transparent',
                caretColor: 'var(--color-accent)',
              }}
            />
          </div>
        </div>
      </div>


    </aside>
  );
}
