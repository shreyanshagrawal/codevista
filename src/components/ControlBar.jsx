import { useAppStore } from '../store/useAppStore';

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 3, 5];

export default function ControlBar({ onRun, onPause, onStep, onStepBackward, onReset }) {
  const { state, actions } = useAppStore();

  const isIdle = !state.isPlaying && state.currentStep === 0;

  return (
    <footer
      className="flex items-center gap-3 px-5 py-2.5 border-t shrink-0 animate-slide-bottom"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-base)',
        height: '52px',
      }}
    >
      {/* Logo / title */}
      <div className="flex items-center gap-2 mr-2">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))', color: '#fff' }}
        >
          ⬡
        </div>
        <span className="text-xs font-semibold tracking-wide hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>
          CodeVista
        </span>
      </div>

      <div className="w-px h-6 shrink-0" style={{ background: 'var(--color-border)' }} />

      {/* Run / Pause / Resume */}
      {!state.isPlaying && (
        <CtrlBtn
          id="btn-run"
          onClick={onRun}
          label={isIdle ? "▶ Run" : "▶ Resume"}
          primary
          title={isIdle ? "Execute and visualize" : "Resume execution"}
        />
      )}
      {state.isPlaying && (
        <CtrlBtn
          id="btn-pause"
          onClick={onPause}
          label="⏸ Pause"
          title="Pause execution"
        />
      )}

      {/* Step backward */}
      <CtrlBtn
        id="btn-step-backward"
        onClick={onStepBackward}
        label="⏮ Prev"
        disabled={state.isPlaying}
        title="Step to previous instruction"
      />

      {/* Step forward */}
      <CtrlBtn
        id="btn-step"
        onClick={onStep}
        label="Next ⏭"
        disabled={state.isPlaying}
        title="Step to next instruction"
      />

      {/* Reset */}
      <CtrlBtn
        id="btn-reset"
        onClick={onReset}
        label="↺ Reset"
        title="Reset visualizer"
      />

      <div className="w-px h-6 shrink-0" style={{ background: 'var(--color-border)' }} />

      {/* Speed control */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Speed
        </span>
        <div className="flex gap-1">
          {SPEED_OPTIONS.map(s => (
            <button
              key={s}
              id={`btn-speed-${s}`}
              onClick={() => actions.setSpeed(s)}
              className="text-xs px-2 py-0.5 rounded transition-all"
              style={{
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: state.speed === s ? 'var(--color-accent)' : 'var(--color-border)',
                background: state.speed === s ? 'var(--color-accent-glow)' : 'var(--color-bg-elevated)',
                color: state.speed === s ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${state.isPlaying ? 'animate-pulse-dot' : ''}`}
          style={{
            background: state.isPlaying
              ? 'var(--color-accent-2)'
              : !isIdle
                ? '#fcd34d'
                : 'var(--color-text-muted)',
          }}
        />
        <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          {state.isPlaying ? 'Playing' : !isIdle ? 'Paused' : 'Idle'}
        </span>
      </div>

      {state.totalSteps > 0 && (
        <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
          {state.currentStep + 1} / {state.totalSteps}
        </span>
      )}
    </footer>
  );
}

function CtrlBtn({ id, onClick, label, primary, disabled, title }) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="text-xs px-3 py-1.5 rounded font-medium transition-all duration-150"
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        border: '1px solid',
        borderColor: primary ? 'var(--color-accent)' : 'var(--color-border-bright)',
        background: primary
          ? 'linear-gradient(135deg, var(--color-accent), #5b54e8)'
          : 'var(--color-bg-elevated)',
        color: primary ? '#fff' : 'var(--color-text-secondary)',
        boxShadow: primary ? '0 2px 12px var(--color-accent-glow)' : 'none',
      }}
    >
      {label}
    </button>
  );
}
