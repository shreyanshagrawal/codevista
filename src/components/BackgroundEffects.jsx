import { useAppStore } from '../store/useAppStore';

export default function BackgroundEffects() {
  const { state } = useAppStore();
  const theme = state.theme;
  const showEffects = state.settings?.particleEffects;

  if (!showEffects) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {theme === 'synthwave-neon' && (
        <>
          <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-[rgba(255,0,255,0.07)] to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-[rgba(0,255,255,0.07)] to-transparent" />
        </>
      )}
      
      {theme === 'forest-terminal' && (
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'linear-gradient(var(--color-accent) 1px, transparent 1px)', 
            backgroundSize: '100% 4px' 
          }} 
        />
      )}

      {theme === 'ocean-depths' && (
        <div className="absolute inset-0 opacity-[0.15]">
          <div className="absolute top-[20%] left-[10%] w-48 h-48 rounded-full bg-[var(--color-accent)] blur-[100px]" />
          <div className="absolute top-[70%] left-[80%] w-64 h-64 rounded-full bg-[var(--color-accent-2)] blur-[120px]" />
          <div className="absolute top-[80%] left-[20%] w-96 h-96 rounded-full bg-[var(--color-border-bright)] blur-[140px]" />
        </div>
      )}

      {theme === 'midnight-oled' && (
        <div className="absolute inset-0 flex justify-center opacity-30">
          <div className="w-[80%] h-full bg-gradient-to-b from-[var(--color-accent-glow)] to-transparent blur-[120px]" />
        </div>
      )}
    </div>
  );
}
