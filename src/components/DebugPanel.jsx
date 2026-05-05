import { useRef, useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatTimestamp } from '../utils/formatters';

const LOG_COLORS = {
  info:    'var(--color-text-secondary)',
  success: 'var(--color-accent-2)',
  log:     'var(--color-text-primary)',
  warn:    '#fcd34d',
  error:   'var(--color-accent-3)',
};

const LOG_PREFIX = {
  info:    'ℹ',
  success: '✓',
  log:     '›',
  warn:    '⚠',
  error:   '✕',
};

const TABS = ['Output', 'Call Stack', 'Variables', 'Breakpoints'];
const MODE_OPTIONS = [
  { value: 'flow',      label: '⬡ Flow' },
  { value: 'ast',       label: '⊳ AST' },
  { value: 'memory',    label: '▤ Memory' },
  { value: 'callstack', label: '⧖ Call Stack' },
];

export default function DebugPanel({ steps }) {
  const { state, actions } = useAppStore();
  const [activeTab, setActiveTab] = useState('Output');
  const logEndRef = useRef(null);
  const currentStep = steps?.[state.currentStep] ?? null;

  const handleClearLogs = useCallback(() => {
    actions.clearDebug();
    actions.appendDebug({ type: 'info', time: formatTimestamp(), text: 'Console cleared.' });
  }, [actions]);

  return (
    <aside
      className="flex flex-col h-full border-l animate-slide-right"
      style={{
        width: state.layout.rightWidth,
        minWidth: 260,
        maxWidth: 480,
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-panel)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-base)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Debug
        </span>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-base)' }}
      >
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3 py-2 text-xs transition-all relative"
            style={{
              color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {tab}
            {activeTab === tab && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ background: 'var(--color-accent)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-3 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {activeTab === 'Output' && (
          <div>
            {state.debugOutput.length === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                <div className="text-2xl mb-2">◎</div>
                <div>Run your code to see output</div>
              </div>
            )}
            {state.debugOutput.map((entry, i) => (
              <div key={i} className="flex gap-2 mb-1 animate-fade-in">
                <span style={{ color: 'var(--color-text-muted)', userSelect: 'none' }}>{entry.time}</span>
                <span style={{ color: LOG_COLORS[entry.type] ?? LOG_COLORS.log }}>
                  {LOG_PREFIX[entry.type]}
                </span>
                <span style={{ color: LOG_COLORS[entry.type] ?? LOG_COLORS.log }}>{entry.text}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}

        {activeTab === 'Call Stack' && (
          <div>
            {!currentStep && (
              <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                <div className="text-2xl mb-2">⧖</div>
                <div>No active execution</div>
              </div>
            )}
            {currentStep?.stateSnapshot?.callStack?.map((frame, i) => (
              <div
                key={i}
                className="flex items-center gap-2 mb-1.5 px-2 py-1.5 rounded"
                style={{
                  background: i === 0 ? 'var(--color-bg-elevated)' : 'transparent',
                  border: i === 0 ? '1px solid var(--color-border-bright)' : 'none',
                  color: i === 0 ? 'var(--color-accent)' : 'var(--color-text-muted)',
                }}
              >
                <span>{i === 0 ? '▶' : '·'}</span>
                <span className="truncate">{frame}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Variables' && (
          <div>
            {!currentStep && (
              <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                <div className="text-2xl mb-2">▤</div>
                <div>No active scope</div>
              </div>
            )}
            {currentStep && Object.entries(currentStep.stateSnapshot?.variables ?? {}).map(([k, v], i) => (
              <div
                key={i}
                className="flex items-center justify-between mb-1.5 px-2 py-1.5 rounded"
                style={{ background: 'var(--color-bg-elevated)' }}
              >
                <span style={{ color: 'var(--color-syntax-keyword)' }}>{k}</span>
                <span style={{ color: 'var(--color-syntax-number)' }}>{String(v)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Breakpoints' && (
          <div>
            {state.breakpoints.size === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                <div className="text-2xl mb-2">◉</div>
                <div>Click line numbers to add breakpoints</div>
              </div>
            )}
            {[...state.breakpoints].sort((a, b) => a - b).map(line => (
              <div
                key={line}
                className="flex items-center justify-between mb-1.5 px-2 py-1.5 rounded"
                style={{ background: 'var(--color-bg-elevated)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-3)' }} />
                  <span>Line {line}</span>
                </div>
                <button
                  onClick={() => actions.toggleBreakpoint(line)}
                  className="text-xs px-1 rounded transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-accent-3)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear button */}
      {activeTab === 'Output' && (
        <div
          className="px-3 py-2 border-t shrink-0"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-base)' }}
        >
          <button
            onClick={handleClearLogs}
            className="text-xs px-3 py-1 rounded transition-all hover:opacity-80"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-bright)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            Clear console
          </button>
        </div>
      )}

      {/* Execution progress bar */}
      {state.totalSteps > 0 && (
        <div
          className="px-4 py-2 border-t shrink-0"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-base)' }}
        >
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>Step {state.currentStep + 1}</span>
            <span>{state.totalSteps}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-elevated)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((state.currentStep + 1) / state.totalSteps) * 100}%`,
                background: `linear-gradient(90deg, var(--color-accent), var(--color-accent-2))`,
              }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
