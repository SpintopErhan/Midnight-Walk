import React from 'react';

interface Props {
  onStart: () => void;
}

const StartScreen: React.FC<Props> = ({ onStart }) => {
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

        {/* Controls Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 max-w-2xl text-white/80 font-inter">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-red-500/80 text-[10px] uppercase tracking-widest font-black">Movement</span>
            <div className="flex gap-2">
                <kbd className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm">WASD</kbd>
                <kbd className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm">ARROWS</kbd>
            </div>
            <p className="text-xs opacity-50">Navigate the dark alley</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <span className="text-red-500/80 text-[10px] uppercase tracking-widest font-black">Combat</span>
            <div className="flex gap-2">
                <kbd className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm">MOUSE</kbd>
                <kbd className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm">TAP</kbd>
            </div>
            <p className="text-xs opacity-50">Fire your weapon</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <span className="text-red-500/80 text-[10px] uppercase tracking-widest font-black">Actions</span>
            <div className="flex gap-2">
                <kbd className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm">SPACE</kbd>
                <kbd className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm">F</kbd>
            </div>
            <p className="text-xs opacity-50">Jump & Toggle Flashlight</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <span className="text-red-500/80 text-[10px] uppercase tracking-widest font-black">Mobile</span>
            <p className="text-xs opacity-70">Use the on-screen buttons</p>
            <p className="text-[10px] opacity-40 uppercase tracking-tighter">Optimized for Landscape</p>
          </div>
        </div>

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

        <div className="mt-12 text-[10px] text-white/20 uppercase tracking-[0.5em] font-inter">
          Version 2.5 • Developed for the Void
        </div>
      </div>
    </div>
  );
};

export default StartScreen;