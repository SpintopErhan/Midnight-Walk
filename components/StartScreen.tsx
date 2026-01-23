import React, { useState } from 'react';

interface Props {
  onStart: () => void;
  controlMode: 'keyboard' | 'touch';
  onUpdateControlMode: (mode: 'keyboard' | 'touch') => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const StartScreen: React.FC<Props> = ({ onStart, controlMode, onUpdateControlMode, isMuted, onToggleMute }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] p-6 text-center">
      {/* Background Overlay for focus */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl transition-all duration-500">
        
        {/* Midnight Walk Title and Subtitle - Hidden when settings open */}
        {!showSettings && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-creepster text-red-600 mb-2 mt-4 drop-shadow-[0_0_30px_rgba(255,0,0,0.6)] animate-pulse uppercase italic">
              Midnight Walk
            </h1>
            <p className="text-[10px] sm:text-sm md:text-base text-white/50 tracking-[0.3em] uppercase mb-12 font-inter">
              Don't let the shadows catch you
            </p>
          </div>
        )}

        {/* Settings View */}
        {showSettings && (
          <div className="bg-black/95 border border-white/10 p-10 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-creepster text-white mb-8 tracking-widest uppercase italic border-b border-white/10 pb-4">Settings</h3>
            
            <div className="flex flex-col space-y-8">
              {/* Control Method Selector */}
              <div className="flex flex-col items-start gap-3">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Control Method</span>
                <div className="flex w-full bg-white/5 p-1 rounded-xl border border-white/10">
                  <button 
                    onClick={() => onUpdateControlMode('keyboard')}
                    className={`flex-1 py-3 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${controlMode === 'keyboard' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-white/40 hover:text-white'}`}
                  >
                    Keyboard
                  </button>
                  <button 
                    onClick={() => onUpdateControlMode('touch')}
                    className={`flex-1 py-3 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${controlMode === 'touch' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-white/40 hover:text-white'}`}
                  >
                    Touch
                  </button>
                </div>
              </div>

              {/* Sound Toggle */}
              <div className="flex flex-col items-start gap-3">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Sound Settings</span>
                <button 
                  onClick={onToggleMute}
                  className={`w-full py-3 rounded-xl border flex items-center justify-center gap-3 transition-all ${isMuted ? 'border-red-600/30 bg-red-950/20 text-red-500' : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'}`}
                >
                  <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
                  <span className="text-xs font-black tracking-widest uppercase">{isMuted ? 'Sound Off' : 'Sound On'}</span>
                </button>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-4 border border-white/20 rounded-xl text-xs font-black tracking-[0.4em] uppercase hover:bg-white/10 hover:border-white transition-all text-white/60 active:scale-95 shadow-lg"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Menu Buttons */}
        <div className="flex flex-col gap-8 items-center mt-4">
          {!showSettings && (
            <>
              <button 
                onClick={onStart}
                onTouchEnd={(e) => { e.preventDefault(); onStart(); }}
                className="group relative pointer-events-auto active:scale-90 transition-transform"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-900 to-red-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative px-12 py-4 bg-black border-2 border-red-950 rounded-full text-white text-xl sm:text-2xl font-creepster tracking-widest uppercase hover:border-red-600 transition-all shadow-[0_0_40px_rgba(255,0,0,0.2)]">
                  Enter the Darkness
                </div>
              </button>

              <button 
                onClick={() => setShowSettings(true)}
                className="px-10 py-3 bg-white/5 border border-white/10 rounded-full text-white/40 text-[11px] font-black tracking-[0.4em] uppercase hover:text-white hover:bg-white/10 hover:border-white/20 transition-all pointer-events-auto active:scale-95"
              >
                Settings
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartScreen;