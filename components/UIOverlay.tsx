
import React, { useState, useEffect } from 'react';

interface Props {
  playerHp: number;
  playerMaxHp: number;
  flashlightBattery: number;
  flashlightMaxBattery: number;
  score: number;
  distance: number;
  isFlashlightOn: boolean;
  isFullscreen: boolean;
  controlMode: 'keyboard' | 'touch';
  isMenuOpen: boolean;
  atUpgradeStation: boolean;
  nearestStationScreenX?: number | null;
  onToggleMenu: () => void;
  onToggleFullscreen: () => void;
  onControl: (control: string, active: boolean) => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onUpgrade: (type: string, cost: number) => void;
}

const UIOverlay: React.FC<Props> = ({ 
  playerHp, 
  playerMaxHp,
  flashlightBattery, 
  flashlightMaxBattery,
  score, 
  distance, 
  isFlashlightOn, 
  isFullscreen, 
  controlMode,
  isMenuOpen,
  atUpgradeStation,
  nearestStationScreenX,
  onToggleMenu,
  onToggleFullscreen, 
  onControl,
  onRestart,
  onMainMenu,
  onUpgrade
}) => {
  const [isBallooning, setIsBallooning] = useState(false);
  const [showShop, setShowShop] = useState(false);
  
  useEffect(() => {
    if (score > 0) {
      setIsBallooning(true);
      const timer = setTimeout(() => setIsBallooning(false), 200);
      return () => clearTimeout(timer);
    }
  }, [score]);

  if (playerHp <= 0) return null;

  const UPGRADES = [
    { id: 'hp', name: 'Armor Vest', cost: 150, desc: '+20 Max HP & Full Heal', icon: '❤️' },
    { id: 'battery', name: 'High Capacity', cost: 100, desc: '+50 Battery Capacity', icon: '🔋' },
    { id: 'charge', name: 'Fast Charger', cost: 120, desc: '+50% Recharge Speed', icon: '⚡' },
    { id: 'damage', name: 'Lead Bullets', cost: 200, desc: '+5 Bullet Damage', icon: '💥' },
  ];

  // Calculate percentages safely
  const hpPercent = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));
  const batteryPercent = Math.max(0, Math.min(100, (flashlightBattery / flashlightMaxBattery) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col font-creepster text-white select-none overflow-hidden">
      
      {/* Top Stats Bar */}
      <div className="w-full bg-black/80 backdrop-blur-md border-b border-white/10 p-3 flex flex-row justify-around items-center z-[60]">
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] tracking-widest text-blue-300 opacity-60 uppercase">Distance</span>
          <p className="text-xl font-bold tabular-nums">{distance}M</p>
        </div>

        <div className={`flex flex-col items-center transition-transform duration-200 ${isBallooning ? 'scale-125' : 'scale-100'}`}>
          <span className="text-[10px] tracking-widest text-amber-500 opacity-60 uppercase">Loot</span>
          <p className="text-xl font-bold tabular-nums text-amber-400">{score}</p>
        </div>

        <div className="flex flex-col items-center w-24">
          <span className="text-[10px] tracking-widest text-red-500 opacity-60 uppercase">Health</span>
          <div className="w-full h-1.5 bg-red-950 rounded-full mt-1 border border-red-500/20 overflow-hidden">
            <div 
              className="h-full bg-red-600 transition-[width] duration-150 ease-out" 
              style={{ width: `${hpPercent}%` }}
            ></div>
          </div>
          <p className={`text-xs font-bold tabular-nums mt-0.5 ${playerHp < playerMaxHp * 0.3 ? 'text-red-600 animate-pulse' : 'text-red-400'}`}>{playerHp}</p>
        </div>

        <div className="flex flex-col items-center w-24">
          <span className="text-[10px] tracking-widest text-blue-200 opacity-60 uppercase">Battery</span>
          <div className="w-full h-1.5 bg-blue-950 rounded-full mt-1 border border-blue-500/20 overflow-hidden">
            <div 
              className={`h-full bg-blue-400 transition-[width] duration-150 ease-out ${isFlashlightOn ? 'animate-pulse' : ''}`} 
              style={{ width: `${batteryPercent}%` }}
            ></div>
          </div>
          <p className={`text-xs font-bold tabular-nums mt-0.5 ${flashlightBattery < flashlightMaxBattery * 0.2 ? 'text-blue-500 animate-pulse' : 'text-blue-200'}`}>{Math.floor(flashlightBattery)}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Full Screen Toggle Button */}
          <button 
            onClick={onToggleFullscreen}
            className="pointer-events-auto px-3 py-1 bg-white/5 border border-white/20 rounded hover:bg-white/10 transition-colors active:scale-95 flex items-center justify-center min-w-[44px]"
            title="Toggle Fullscreen"
          >
            <span className="text-[10px] tracking-widest text-white/40 uppercase font-black">{isFullscreen ? 'EXIT' : 'FULL'}</span>
          </button>
          
          <button 
            onClick={onToggleMenu}
            className="pointer-events-auto px-3 py-1 bg-white/5 border border-white/20 rounded hover:bg-white/10 transition-colors active:scale-95 flex items-center justify-center min-w-[44px]"
          >
            <span className="text-[10px] tracking-widest text-white/40 uppercase font-black">MENU</span>
          </button>
        </div>
      </div>

      {/* SHOP label directly over the station */}
      {atUpgradeStation && !showShop && !isMenuOpen && nearestStationScreenX !== null && (
        <div 
          className="absolute pointer-events-auto animate-pulse z-[50]"
          style={{ 
            left: `${nearestStationScreenX}px`, 
            bottom: 'calc(25% + 95px)',
            transform: 'translateX(-50%)'
          }}
        >
          <button 
            onClick={() => setShowShop(true)}
            className="px-4 py-2 bg-amber-600 border-2 border-amber-400 rounded-lg text-white font-black tracking-[0.2em] text-sm shadow-[0_0_15px_rgba(251,191,36,0.6)] active:scale-90 transition-transform whitespace-nowrap"
          >
            SHOP
          </button>
        </div>
      )}

      {/* SHOP UI */}
      {showShop && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-[80] animate-in fade-in zoom-in-95 pointer-events-auto">
          <h2 className="text-5xl font-creepster text-amber-500 mb-8 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)] uppercase italic tracking-widest">Vending Machine</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl p-6">
            {UPGRADES.map(u => (
              <button 
                key={u.id}
                onClick={() => onUpgrade(u.id, u.cost)}
                disabled={score < u.cost}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-95 ${score >= u.cost ? 'bg-white/5 border-amber-600/40 hover:bg-white/10 shadow-lg' : 'bg-black/40 border-white/5 opacity-50 grayscale cursor-not-allowed'}`}
              >
                <span className="text-3xl">{u.icon}</span>
                <div className="flex-1 text-left">
                  <p className="text-lg font-bold text-white">{u.name}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-inter">{u.desc}</p>
                </div>
                <div className="text-amber-400 font-bold tabular-nums">🪙{u.cost}</div>
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowShop(false)}
            className="mt-8 px-12 py-3 border border-white/20 rounded-full text-xs font-black tracking-widest uppercase hover:bg-white/5 transition-colors"
          >
            Close Machine
          </button>
        </div>
      )}

      {/* PAUSE MENU OVERLAY */}
      {isMenuOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center z-[70] animate-in fade-in duration-300">
          <h2 className="text-6xl font-creepster text-red-600 mb-8 tracking-widest uppercase italic drop-shadow-[0_0_20px_rgba(255,0,0,0.4)]">Paused</h2>
          <div className="flex flex-col gap-4 w-full max-w-[280px]">
            <button onClick={onToggleMenu} className="pointer-events-auto py-4 bg-white/10 border border-white/20 rounded-full text-white text-lg font-creepster tracking-[0.2em] uppercase hover:bg-white/20 transition-all active:scale-95">Resume</button>
            <button onClick={onRestart} className="pointer-events-auto py-4 bg-red-950/20 border border-red-600/40 rounded-full text-red-500 text-lg font-creepster tracking-[0.2em] uppercase hover:bg-red-900/40 transition-all active:scale-95">Restart</button>
            <button onClick={onMainMenu} className="pointer-events-auto py-4 bg-transparent border border-white/10 rounded-full text-white/40 text-[10px] font-black tracking-[0.3em] uppercase hover:text-white hover:bg-white/5 transition-all active:scale-95">Main Menu</button>
          </div>
        </div>
      )}

      <div className="flex-grow"></div>

      {/* Touch Controls */}
      {controlMode === 'touch' && !isMenuOpen && !showShop && (
        <div className="w-full p-6 sm:p-10 pointer-events-auto pb-safe">
          <div className="flex justify-between items-end w-full">
            <div className="flex gap-4">
              <button className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center active:bg-white/20 active:scale-95 transition-all" onPointerDown={() => onControl('MoveLeft', true)} onPointerUp={() => onControl('MoveLeft', false)}><span className="text-4xl opacity-60">←</span></button>
              <button className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center active:bg-white/20 active:scale-95 transition-all" onPointerDown={() => onControl('MoveRight', true)} onPointerUp={() => onControl('MoveRight', false)}><span className="text-4xl opacity-60">→</span></button>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center active:bg-white/20 active:scale-[0.85]" onPointerDown={() => { onControl('Jump', true); setTimeout(() => onControl('Jump', false), 50); }}><span className="text-[10px] font-black tracking-widest uppercase">JUMP</span></button>
              <div className="flex items-center gap-4">
                  <button className={`w-14 h-14 border rounded-full flex items-center justify-center transition-all ${isFlashlightOn ? 'bg-blue-500/30 border-blue-400 text-blue-100 shadow-lg' : 'bg-white/5 border-white/10 text-white/40'}`} onPointerDown={() => onControl('Flashlight', true)}><span className="text-[10px] font-black tracking-widest uppercase">LIGHT</span></button>
                  <button className="w-20 h-20 bg-red-950/20 border-2 border-red-600/30 rounded-full flex items-center justify-center active:bg-red-600/40 active:scale-95 shadow-xl" onPointerDown={() => onControl('Shoot', true)} onPointerUp={() => onControl('Shoot', false)}><div className="w-12 h-12 rounded-full border-2 border-red-600/40 flex items-center justify-center"><div className="w-5 h-5 bg-red-600 rounded-full animate-pulse shadow-lg"></div></div></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
