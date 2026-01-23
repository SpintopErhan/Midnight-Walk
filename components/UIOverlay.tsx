import React, { useState, useEffect } from 'react';

interface Props {
  playerHp: number;
  flashlightBattery: number;
  score: number;
  distance: number;
  isFlashlightOn: boolean;
  isFullscreen: boolean;
  controlMode: 'keyboard' | 'touch';
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onToggleFullscreen: () => void;
  onControl: (control: string, active: boolean) => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

const UIOverlay: React.FC<Props> = ({ 
  playerHp, 
  flashlightBattery, 
  score, 
  distance, 
  isFlashlightOn, 
  isFullscreen, 
  controlMode,
  isMenuOpen,
  onToggleMenu,
  onToggleFullscreen, 
  onControl,
  onRestart,
  onMainMenu
}) => {
  const [isBallooning, setIsBallooning] = useState(false);
  
  useEffect(() => {
    if (score > 0) {
      setIsBallooning(true);
      const timer = setTimeout(() => setIsBallooning(false), 200);
      return () => clearTimeout(timer);
    }
  }, [score]);

  // If the player is dead, don't show the game UI elements (stats bar, etc.)
  if (playerHp <= 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col font-creepster text-white select-none overflow-hidden">
      
      {/* Top Stats Bar - Horizontal Layout */}
      <div className="w-full bg-black/80 backdrop-blur-md border-b border-white/10 p-3 flex flex-row justify-around items-center z-[60]">
        
        {/* DISTANCE */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest text-blue-300 opacity-60 uppercase">Distance</span>
          <p className="text-xl font-bold tabular-nums">{distance}M</p>
        </div>

        {/* LOOT */}
        <div className={`flex flex-col items-center transition-transform duration-200 ${isBallooning ? 'scale-125' : 'scale-100'}`}>
          <span className="text-[10px] tracking-widest text-amber-500 opacity-60 uppercase">Loot</span>
          <p className="text-xl font-bold tabular-nums text-amber-400">{score}</p>
        </div>

        {/* HEALTH */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest text-red-500 opacity-60 uppercase">Health</span>
          <p className={`text-xl font-bold tabular-nums ${playerHp < 30 ? 'text-red-600 animate-pulse' : 'text-red-400'}`}>{playerHp}%</p>
        </div>

        {/* BATTERY */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest text-blue-200 opacity-60 uppercase">Battery</span>
          <p className={`text-xl font-bold tabular-nums ${flashlightBattery < 20 ? 'text-blue-500 animate-pulse' : 'text-blue-200'}`}>{Math.floor(flashlightBattery)}%</p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          {/* MENU BUTTON */}
          <button 
            onClick={onToggleMenu}
            onTouchEnd={(e) => { e.preventDefault(); onToggleMenu(); }}
            className="pointer-events-auto px-3 py-1 bg-white/5 border border-white/20 rounded hover:bg-white/10 transition-colors active:scale-95"
          >
            <span className="text-[10px] tracking-widest text-white/40 uppercase font-black">
              MENU
            </span>
          </button>
          
          {/* FULLSCREEN TOGGLE */}
          <button 
            onClick={onToggleFullscreen}
            onTouchEnd={(e) => { e.preventDefault(); onToggleFullscreen(); }}
            className="pointer-events-auto px-3 py-1 bg-white/5 border border-white/20 rounded hover:bg-white/10 transition-colors active:scale-95"
          >
            <span className="text-[10px] tracking-widest text-white/40 uppercase font-black">
              {isFullscreen ? 'EXIT' : 'FULL'}
            </span>
          </button>
        </div>
      </div>

      {/* PAUSE MENU OVERLAY */}
      {isMenuOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center z-[70] animate-in fade-in duration-300">
          <h2 className="text-6xl font-creepster text-red-600 mb-8 tracking-widest uppercase italic drop-shadow-[0_0_20px_rgba(255,0,0,0.4)]">Paused</h2>
          
          <div className="flex flex-col gap-4 w-full max-w-[280px]">
            <button 
              onClick={onToggleMenu}
              className="pointer-events-auto py-4 bg-white/10 border border-white/20 rounded-full text-white text-lg font-creepster tracking-[0.2em] uppercase hover:bg-white/20 transition-all active:scale-95"
            >
              Resume
            </button>
            <button 
              onClick={onRestart}
              className="pointer-events-auto py-4 bg-red-950/20 border border-red-600/40 rounded-full text-red-500 text-lg font-creepster tracking-[0.2em] uppercase hover:bg-red-900/40 transition-all active:scale-95"
            >
              Restart
            </button>
            <button 
              onClick={onMainMenu}
              className="pointer-events-auto py-4 bg-transparent border border-white/10 rounded-full text-white/40 text-[10px] font-black tracking-[0.3em] uppercase hover:text-white hover:bg-white/5 transition-all active:scale-95"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}

      {/* Spacer to push buttons to bottom */}
      <div className="flex-grow"></div>

      {/* Manual Touch Controls Overlay (Triggered by controlMode setting) */}
      {controlMode === 'touch' && !isMenuOpen && (
        <div className="w-full p-6 sm:p-10 pointer-events-auto pb-safe">
          <div className="flex justify-between items-end w-full">
            {/* Left: Move Keys */}
            <div className="flex gap-4 pointer-events-auto">
              <button 
                className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center active:bg-white/20 active:scale-95 transition-all backdrop-blur-md"
                onPointerDown={() => onControl('MoveLeft', true)}
                onPointerUp={() => onControl('MoveLeft', false)}
                onPointerLeave={() => onControl('MoveLeft', false)}
              >
                <span className="text-4xl opacity-60">←</span>
              </button>
              <button 
                className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center active:bg-white/20 active:scale-95 transition-all backdrop-blur-md"
                onPointerDown={() => onControl('MoveRight', true)}
                onPointerUp={() => onControl('MoveRight', false)}
                onPointerLeave={() => onControl('MoveRight', false)}
              >
                <span className="text-4xl opacity-60">→</span>
              </button>
            </div>

            {/* Right: Actions Cluster */}
            <div className="flex flex-col items-end gap-3 pointer-events-auto">
              
              {/* Jump Button - Single tap responsive jump */}
              <button 
                  className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center active:bg-white/20 active:scale-[0.85] shadow-2xl transition-transform"
                  onPointerDown={(e) => {
                    onControl('Jump', true);
                    // Release immediately to allow single tap jump buffer to work
                    setTimeout(() => onControl('Jump', false), 50);
                  }}
              >
                  <span className="text-[10px] font-black tracking-widest text-white/60 uppercase">JUMP</span>
              </button>

              {/* Light and Shoot Row */}
              <div className="flex items-center gap-4">
                  {/* Light Button */}
                  <button 
                      className={`w-14 h-14 border rounded-full flex items-center justify-center transition-all active:scale-90 ${isFlashlightOn ? 'bg-blue-500/30 border-blue-400 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/5 border-white/10 text-white/40'}`}
                      onPointerDown={() => onControl('Flashlight', true)}
                  >
                      <span className="text-[10px] font-black tracking-widest uppercase">LIGHT</span>
                  </button>
                  
                  {/* Shoot Button - Machine Gun on hold */}
                  <button 
                    className="w-20 h-20 bg-red-950/20 border-2 border-red-600/30 rounded-full flex items-center justify-center active:bg-red-600/40 active:scale-95 transition-all shadow-[0_0_40px_rgba(220,38,38,0.2)]"
                    onPointerDown={() => onControl('Shoot', true)}
                    onPointerUp={() => onControl('Shoot', false)}
                    onPointerLeave={() => onControl('Shoot', false)}
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-red-600/40 flex items-center justify-center">
                      <div className="w-5 h-5 bg-red-600 rounded-full animate-pulse shadow-[0_0_20px_red]"></div>
                    </div>
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;