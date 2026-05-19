import { useAppStore } from '../store/useAppStore';

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border-bright)' }}>
      <div className="pr-4">
        <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</div>
        {description && <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{description}</div>}
      </div>
      <button 
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full relative transition-colors duration-200 shrink-0`}
        style={{ background: checked ? 'var(--color-accent)' : 'var(--color-bg-elevated)' }}
      >
        <span 
          className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200`}
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
        />
      </button>
    </div>
  );
}

function Select({ label, description, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border-bright)' }}>
      <div className="pr-4">
        <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</div>
        {description && <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{description}</div>}
      </div>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm rounded px-3 py-1.5 outline-none cursor-pointer shrink-0 transition-colors"
        style={{ 
          background: 'var(--color-bg-elevated)', 
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)'
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function SettingsPage() {
  const { state, actions } = useAppStore();
  const settings = state.settings || {
    defaultSpeed: 1,
    soundEffects: false,
    autoScroll: true,
    compactMode: false,
    defaultArraySize: 7,
    showStepCounter: true,
    showOperationCounters: true,
    smoothAnimations: true,
    particleEffects: false,
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    uiCorners: 'rounded',
    uiFont: 'sans',
    uiScale: 'medium',
  };

  const update = (key, value) => {
    actions.updateSettings({ [key]: value });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in" style={{ background: 'var(--color-bg-base)' }}>
      {/* Settings Header */}
      <div className="px-8 py-8 border-b shrink-0" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-panel)' }}>
        <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
          <span className="text-xl" style={{ color: 'var(--color-accent)' }}>⚙</span> Preferences
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Customize your visualization experience, tweak engine settings, and adjust accessibility options.
        </p>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-10">
          
          {/* Theme Selection Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--color-accent-2)' }}>Theme Selection</h2>
              <button 
                onClick={() => {
                  const themes = ['default', 'midnight-oled', 'arctic-light', 'synthwave-neon', 'forest-terminal', 'solar-sand', 'dracula-inspired', 'ocean-depths', 'high-contrast', 'pastel-dev', 'minimal-graphite'];
                  const rand = themes[Math.floor(Math.random() * themes.length)];
                  actions.setTheme(rand);
                }}
                className="text-xs px-2 py-1 rounded transition-colors hover:opacity-80"
                style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
              >
                🎲 Random Theme
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { id: 'default', label: 'Default', desc: 'Original CodeVista dark theme', color1: '#0d0f14', color2: '#6c63ff' },
                { id: 'midnight-oled', label: 'Midnight OLED', desc: 'Pure black AMOLED style', color1: '#000000', color2: '#39ff14' },
                { id: 'arctic-light', label: 'Arctic Light', desc: 'Clean light mode', color1: '#f8fafc', color2: '#0ea5e9' },
                { id: 'synthwave-neon', label: 'Synthwave Neon', desc: 'Cyberpunk aesthetic', color1: '#0f0a1c', color2: '#ff00ff' },
                { id: 'forest-terminal', label: 'Forest Terminal', desc: 'Hacker terminal inspired', color1: '#020f07', color2: '#4ade80' },
                { id: 'solar-sand', label: 'Solar Sand', desc: 'Warm low-eye-strain mode', color1: '#fdf6e3', color2: '#b58900' },
                { id: 'dracula-inspired', label: 'Dracula Inspired', desc: 'Popular developer dark mode', color1: '#282a36', color2: '#ff79c6' },
                { id: 'ocean-depths', label: 'Ocean Depths', desc: 'Deep blue professional theme', color1: '#011627', color2: '#82aaff' },
                { id: 'high-contrast', label: 'High Contrast', desc: 'Maximum accessibility', color1: '#000000', color2: '#ffff00' },
                { id: 'pastel-dev', label: 'Pastel Dev', desc: 'Soft pastel coding aesthetic', color1: '#faf9f9', color2: '#ffb3ba' },
                { id: 'minimal-graphite', label: 'Minimal Graphite', desc: 'Neutral grayscale', color1: '#1a1a1a', color2: '#d4d4d4' },
              ].map(t => (
                <div 
                  key={t.id}
                  onClick={() => actions.setTheme(t.id)}
                  className="rounded-xl border p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  style={{ 
                    background: state.theme === t.id ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
                    borderColor: state.theme === t.id ? 'var(--color-accent)' : 'var(--color-border)',
                    boxShadow: state.theme === t.id ? '0 4px 12px var(--color-accent-glow)' : 'none'
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded-full shrink-0 shadow-sm border" style={{ background: t.color1, borderColor: t.color2 }} />
                    <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{t.label}</div>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* General Section */}
          <section>
            <h2 className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: 'var(--color-accent-2)' }}>General Settings</h2>
            <div className="rounded-lg border px-5 py-1 shadow-sm" style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
              <Select 
                label="Animation Speed Default"
                description="The default speed multiplier when the app loads."
                value={settings.defaultSpeed}
                options={[
                  { label: '0.5x (Slow)', value: '0.5' },
                  { label: '1x (Normal)', value: '1' },
                  { label: '2x (Fast)', value: '2' },
                  { label: '5x (Very Fast)', value: '5' }
                ]}
                onChange={(v) => update('defaultSpeed', parseFloat(v))}
              />
              <Toggle 
                label="Sound Effects"
                description="Play subtle audio cues during algorithm execution steps."
                checked={settings.soundEffects}
                onChange={(v) => update('soundEffects', v)}
              />
              <Toggle 
                label="Auto-scroll Console"
                description="Automatically scroll the debug and output panel to the latest message."
                checked={settings.autoScroll}
                onChange={(v) => update('autoScroll', v)}
              />
              <div className="py-4 flex items-center justify-between border-b shrink-0 border-transparent">
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Compact Mode</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Reduce padding and shrink UI elements to fit more code.</div>
                </div>
                <button 
                  type="button"
                  onClick={() => update('compactMode', !settings.compactMode)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-200 shrink-0`}
                  style={{ background: settings.compactMode ? 'var(--color-accent)' : 'var(--color-bg-elevated)' }}
                >
                  <span 
                    className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200`}
                    style={{ transform: settings.compactMode ? 'translateX(20px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                  />
                </button>
              </div>
              <Select 
                label="UI Corners"
                description="Choose between rounded or sharp corners for UI elements."
                value={settings.uiCorners || 'rounded'}
                options={[
                  { label: 'Rounded', value: 'rounded' },
                  { label: 'Sharp', value: 'sharp' }
                ]}
                onChange={(v) => update('uiCorners', v)}
              />
              <Select 
                label="Primary Font"
                description="Select the primary font family for the UI."
                value={settings.uiFont || 'sans'}
                options={[
                  { label: 'Sans Serif (Inter)', value: 'sans' },
                  { label: 'Monospace (JetBrains)', value: 'mono' },
                  { label: 'Serif (Georgia)', value: 'serif' }
                ]}
                onChange={(v) => update('uiFont', v)}
              />
            </div>
          </section>

          {/* Visualization Section */}
          <section>
            <h2 className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: 'var(--color-accent-2)' }}>Visualization Settings</h2>
            <div className="rounded-lg border px-5 py-1 shadow-sm" style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
              <Select 
                label="Visualization Scale"
                description="Scale the entire visualization canvas up or down."
                value={settings.uiScale || 'medium'}
                options={[
                  { label: 'Small', value: 'small' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Large', value: 'large' }
                ]}
                onChange={(v) => update('uiScale', v)}
              />
              <Select 
                label="Default Array Size"
                description="The number of elements to generate for random array operations."
                value={settings.defaultArraySize}
                options={[
                  { label: 'Small (5 items)', value: '5' },
                  { label: 'Medium (7 items)', value: '7' },
                  { label: 'Large (12 items)', value: '12' }
                ]}
                onChange={(v) => update('defaultArraySize', parseInt(v, 10))}
              />
              <Toggle 
                label="Show Step Counter"
                description="Display the current step out of total steps in the visualizer."
                checked={settings.showStepCounter}
                onChange={(v) => update('showStepCounter', v)}
              />
              <Toggle 
                label="Show Operation Counters"
                description="Track and display total comparisons, swaps, and recursive calls."
                checked={settings.showOperationCounters}
                onChange={(v) => update('showOperationCounters', v)}
              />
              <Toggle 
                label="Smooth Animations"
                description="Enable CSS transitions for moving nodes. Disable for better performance."
                checked={settings.smoothAnimations}
                onChange={(v) => update('smoothAnimations', v)}
              />
              <div className="py-4 flex items-center justify-between border-b shrink-0 border-transparent">
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Particle & Background Effects</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Enable rich visual effects like glowing nodes and background particles.</div>
                </div>
                <button 
                  type="button"
                  onClick={() => update('particleEffects', !settings.particleEffects)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-200 shrink-0`}
                  style={{ background: settings.particleEffects ? 'var(--color-accent)' : 'var(--color-bg-elevated)' }}
                >
                  <span 
                    className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200`}
                    style={{ transform: settings.particleEffects ? 'translateX(20px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Accessibility Section */}
          <section>
            <h2 className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: 'var(--color-accent-2)' }}>Accessibility Settings</h2>
            <div className="rounded-lg border px-5 py-1 shadow-sm" style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
              <Select 
                label="Font Size"
                description="Adjust the size of the text in the code editor and UI."
                value={settings.fontSize}
                options={[
                  { label: 'Small', value: 'small' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Large', value: 'large' }
                ]}
                onChange={(v) => update('fontSize', v)}
              />
              <Toggle 
                label="High Contrast Mode"
                description="Increase contrast for text and visualization edges."
                checked={settings.highContrast}
                onChange={(v) => update('highContrast', v)}
              />
              <div className="py-4 flex items-center justify-between border-b shrink-0 border-transparent">
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Reduced Motion</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Minimize animations and transitions throughout the application.</div>
                </div>
                <button 
                  type="button"
                  onClick={() => update('reducedMotion', !settings.reducedMotion)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-200 shrink-0`}
                  style={{ background: settings.reducedMotion ? 'var(--color-accent)' : 'var(--color-bg-elevated)' }}
                >
                  <span 
                    className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200`}
                    style={{ transform: settings.reducedMotion ? 'translateX(20px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="pt-4 pb-12">
            <div className="p-5 rounded-lg border border-red-500/20 bg-red-500/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-red-400">Reset Preferences</h3>
                <p className="text-xs mt-1 text-red-400/70">Restore all settings to their original defaults. This action cannot be undone.</p>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset all preferences to default?")) {
                    actions.resetSettings();
                  }
                }}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm font-medium transition-colors"
              >
                Reset All
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
