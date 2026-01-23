import React, { useState } from 'react';

interface Props {
  onStart: () => void;
  controlMode: 'keyboard' | 'touch';
  onUpdateControlMode: (mode: 'keyboard' | 'touch') => void;
}

const StartScreen: React.FC<Props> = ({ onStart, controlMode, onUpdateControlMode }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] p-6 text-center">
      {/* Background Overlay for focus */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-creepster text-red-600 mb-2 drop-shadow-[0_0_30px_rgba(255,0,0,0.6)] animate-pulse uppercase italic">
          Midnight Walk
        </h1>
        
        <p className="text-sm sm:text-lg md:text-xl text-white/50 tracking-[0.3em] uppercase mb-12 font-inter">
          Don't let the shadows catch you
        </p>

        {/* Settings View */}
        {showSettings && (
          <div className="bg-black/90 border border-white/10 p-8 rounded-2xl mb-12 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-creepster text-white mb-6 tracking-widest uppercase italic">Settings</h3>
            
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col items-start gap-2">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">Control Method</span>
                <div className="flex w-full bg-white/5 p-1 rounded-lg border border-white/10">
                  <button 
                    onClick={() => onUpdateControlMode('keyboard')}
                    className={`flex-1 py-2 rounded text-xs font-black tracking-widest uppercase transition-all ${controlMode === 'keyboard' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-white/40 hover:text-white'}`}
                  >
                    Keyboard
                  </button>
                  <button 
                    onClick={() => onUpdateControlMode('touch')}
                    className={`flex-1 py-2 rounded text-xs font-black tracking-widest uppercase transition-all ${controlMode === 'touch' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-white/40 hover:text-white'}`}
                  >
                    Touch
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-3 border border-white/10 rounded-lg text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white/5 transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 items-center">
          {!showSettings && (
            <>
              <button 
                onClick={onStart}
                onTouchEnd={(e) => { e.preventDefault(); onStart(); }}
                className="group relative pointer-events-auto"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-900 to-red-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative px-12 py-4 bg-black border-2 border-red-950 rounded-full text-white text-xl sm:text-2xl font-creepster tracking-widest uppercase hover:border-red-600 transition-colors shadow-2xl">
                  Enter the Darkness
                </div>
              </button>

              <button 
                onClick={() => setShowSettings(true)}
                className="px-8 py-2 bg-white/5 border border-white/10 rounded-full text-white/40 text-[10px] font-black tracking-[0.3em] uppercase hover:text-white hover:bg-white/10 transition-all pointer-events-auto"
              >
                Settings
              </button>
            </>
          )}
        </div>

        {!showSettings && (
          <div className="mt-12 text-[10px] text-white/20 uppercase tracking-[0.5em] font-inter">
            Version 2.7 • Developed for the Void
          </div>
        )}
      </div>
    </div>
  );
};

export default StartScreen;