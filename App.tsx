
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas.tsx';
import UIOverlay from './components/UIOverlay.tsx';
import StartScreen from './components/StartScreen.tsx';
import { GameState, Player, StreetLamp, StreetProp, PropType, Enemy, Pit, GoldCoin, Casing, CollectingCoin, BloodParticle, RainParticle, Billboard, UpgradeStation, Grenade, Explosion, WeaponType } from './types.ts';

const ATMOSPHERIC_MESSAGES = [
  "The shadows are whispering secrets tonight.",
  "Every step feels heavier than the last.",
  "The silence here is a predator in disguise.",
  "Street lamps flicker like dying hopes.",
  "A cold wind carries the scent of rust.",
  "Don't look back; the darkness is following.",
  "This street has no end, only beginnings.",
  "The concrete remembers every forgotten name.",
  "Eyes watch from the void between the lights.",
  "The city breathes through its broken alleys.",
  "Time doesn't pass here; it just decays.",
  "A distant siren wails for a soul already lost.",
  "Your footsteps are the only heartbeat left.",
  "The fog hides what the mind fears to see.",
  "Broken glass glitters like fallen stars.",
  "Neon ghosts haunt the edges of your vision.",
  "The darkness is a blanket that never warms.",
  "Something moved in the alley, or was it a memory?",
  "The light is a sanctuary, but it is shrinking.",
  "The abyss is patient. It can wait forever.",
  "Noir skies bleed into the ink of the ground.",
  "Regret is the only currency accepted here."
];

const RAIN_COUNT = 150;
const STORAGE_KEY_CONTROL = 'midnight-walk-control-mode';
const STORAGE_KEY_MUTED = 'midnight-walk-is-muted';

const getFreshPlayer = (): Player => ({
  pos: { x: 300, y: 0 },
  vel: { x: 0, y: 0 },
  hp: 100,
  maxHp: 100,
  width: 30,
  height: 50,
  color: '#e2e8f0',
  isFlashlightOn: false,
  flashlightBattery: 100,
  flashlightMaxBattery: 100,
  flashlightChargeRate: 1.0,
  damagePower: 10,
  direction: 'right',
  currentWeapon: 'pistol',
  grenadeAmmo: 3
});

const generateInitialGameState = (): GameState => {
  const lamps: StreetLamp[] = Array.from({ length: 100 }, (_, i) => ({
    x: 300 + i * 600,
    range: 250,
    intensity: 0.9,
    isBroken: i > 0 && Math.random() < 0.3
  }));

  const billboards: Billboard[] = [];
  lamps.forEach((lamp, i) => {
    if (i > 0 && Math.random() < 0.3) {
      billboards.push({
        id: `billboard-${i}`,
        x: lamp.x,
        message: ATMOSPHERIC_MESSAGES[Math.floor(Math.random() * ATMOSPHERIC_MESSAGES.length)]
      });
    }
  });

  const pits: Pit[] = [];
  const props: StreetProp[] = [];
  
  for (let i = 0; i < 100; i++) {
    const lampX = 300 + i * 600;
    if (i > 0 && Math.random() < 0.35) {
      const pitX = lampX - 300 + (Math.random() - 0.5) * 100;
      pits.push({ x: pitX, width: 80 + Math.random() * 50 });
    }
  }

  const propTypes: PropType[] = ['box', 'barrel'];
  for (let i = 0; i < 100; i++) {
    const type = propTypes[Math.floor(Math.random() * propTypes.length)];
    let width = (type === 'barrel') ? 28 : 35;
    let height = (type === 'barrel') ? 42 : 35;
    let propX = 500 + i * 400 + Math.random() * 200;

    const overlapsPit = pits.some(pit => (propX < pit.x + pit.width && propX + width > pit.x));
    
    if (!overlapsPit) {
      props.push({ x: propX, type, width, height });
    }
  }

  props.sort((a, b) => a.x - b.x);

  const upgradeStations: UpgradeStation[] = [];
  for (let i = 1; i < 20; i++) {
    let stationX = i * 3000;
    let safetyAttempts = 0;
    while (safetyAttempts < 5) {
      const overlapsPit = pits.some(pit => (stationX - 50 < pit.x + pit.width && stationX + 90 > pit.x));
      if (!overlapsPit) break;
      stationX += 200;
      safetyAttempts++;
    }
    upgradeStations.push({ id: `station-${i}`, x: stationX });
  }

  const enemies: Enemy[] = [];
  for (let i = 3; i < 150; i++) {
    const lampPos = 300 + i * 600;
    const spawnX = lampPos + (Math.random() - 0.5) * 300;
    enemies.push({
      id: `enemy-${i}-${Date.now()}`,
      x: spawnX,
      y: 0,
      vel: { x: 0, y: 0 },
      hp: 50,
      maxHp: 50,
      width: 35,
      height: 65,
      isAggroed: false,
      lastAttackTime: 0
    });
  }

  const rain: RainParticle[] = Array.from({ length: RAIN_COUNT }, (_, i) => ({
    id: `rain-${i}`,
    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
    y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
    speed: 10 + Math.random() * 8,
    len: 5 + Math.random() * 10
  }));

  return {
    player: getFreshPlayer(),
    lamps,
    billboards,
    props,
    pits,
    enemies,
    upgradeStations,
    coins: [],
    collectingCoins: [],
    casings: [],
    bloodParticles: [],
    grenades: [],
    explosions: [],
    floatingTexts: [],
    rain,
    score: 0,
    worldOffset: 0,
    isMoving: false,
    muzzleFlash: 0,
    lightningIntensity: 0,
    screenShake: 0
  };
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(generateInitialGameState);
  const [deathReason, setDeathReason] = useState<'enemy' | 'falling' | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlMode, setControlMode] = useState<'keyboard' | 'touch'>('keyboard');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const jumpBuffered = useRef<boolean>(false);
  const shootCooldown = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const lastTime = useRef<number>(performance.now());
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const savedControl = localStorage.getItem(STORAGE_KEY_CONTROL);
    if (savedControl === 'touch' || savedControl === 'keyboard') {
      setControlMode(savedControl as 'touch' | 'keyboard');
    } else {
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      setControlMode(isTouch ? 'touch' : 'keyboard');
    }

    const savedMuted = localStorage.getItem(STORAGE_KEY_MUTED);
    if (savedMuted !== null) {
      setIsMuted(savedMuted === 'true');
    }
  }, []);

  useEffect(() => {
    if (controlMode === 'touch') {
        document.body.classList.add('mobile-touch-mode');
    } else {
        document.body.classList.remove('mobile-touch-mode');
    }
  }, [controlMode]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (gameStarted) {
        if (isInventoryOpen) {
            setIsInventoryOpen(false);
            window.history.pushState({ inGame: true }, "");
        } else if (!isMenuOpen) {
          setIsMenuOpen(true);
          window.history.pushState({ inGame: true }, "");
        } else {
          handleMainMenu();
        }
      }
    };

    if (gameStarted) {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [gameStarted, isMenuOpen, isInventoryOpen]);

  const ensureFullscreen = useCallback(async () => {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(() => {});
        }
        if ('orientation' in screen && (screen.orientation as any).lock) {
            await (screen.orientation as any).lock('landscape').catch(() => {});
        }
    } catch (e) {}
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await ensureFullscreen();
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  }, [ensureFullscreen]);

  useEffect(() => {
    (window as any).requestGameFullscreen = ensureFullscreen;
    return () => { delete (window as any).requestGameFullscreen; };
  }, [ensureFullscreen]);

  const handleUpdateControlMode = (mode: 'keyboard' | 'touch') => {
    setControlMode(mode);
    localStorage.setItem(STORAGE_KEY_CONTROL, mode);
  };

  const handleToggleMute = () => {
    setIsMuted(prev => {
      const newVal = !prev;
      localStorage.setItem(STORAGE_KEY_MUTED, String(newVal));
      return newVal;
    });
  };

  const handleStartGame = useCallback(async () => {
    await ensureFullscreen();
    window.history.pushState({ inGame: true }, "");
    setGameStarted(true);
  }, [ensureFullscreen]);

  const handleRestart = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    keysPressed.current = {};
    jumpBuffered.current = false;
    shootCooldown.current = 0;
    isMouseDown.current = false;
    lastTime.current = performance.now();
    setGameState(generateInitialGameState());
    setDeathReason(null);
    setIsMenuOpen(false);
    setIsInventoryOpen(false);
  }, []);

  const handleMainMenu = useCallback(() => {
    setGameStarted(false);
    setIsMenuOpen(false);
    setIsInventoryOpen(false);
    setGameState(generateInitialGameState());
    if (window.history.state?.inGame) {
      window.history.back();
    }
  }, []);

  const handleEquipWeapon = useCallback((weapon: WeaponType) => {
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, currentWeapon: weapon }
    }));
    setIsInventoryOpen(false);
  }, []);

  const toggleFlashlight = useCallback(() => {
    setGameState(prev => {
      if (!prev.player.isFlashlightOn && prev.player.flashlightBattery <= 0) return prev;
      return {
        ...prev,
        player: { ...prev.player, isFlashlightOn: !prev.player.isFlashlightOn }
      };
    });
  }, []);

  const handleUpgrade = useCallback((type: string, cost: number) => {
    setGameState(prev => {
      if (prev.score < cost) return prev;
      const nextPlayer = { ...prev.player };
      switch(type) {
        case 'hp':
          nextPlayer.maxHp += 20;
          nextPlayer.hp = nextPlayer.maxHp;
          break;
        case 'battery':
          nextPlayer.flashlightMaxBattery += 50;
          nextPlayer.flashlightBattery = nextPlayer.flashlightMaxBattery;
          break;
        case 'charge':
          nextPlayer.flashlightChargeRate += 0.5;
          break;
        case 'damage':
          nextPlayer.damagePower += 5;
          break;
      }
      return { ...prev, score: prev.score - cost, player: nextPlayer };
    });
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleTouchControl = useCallback((control: string, active: boolean) => {
    if (control === 'Flashlight' && active) {
        toggleFlashlight();
        return;
    }
    if (control === 'Inventory' && active) {
        setIsInventoryOpen(prev => !prev);
        return;
    }
    if (control === 'Shoot') {
        isMouseDown.current = active;
        return;
    }
    if (control === 'Jump' && active) {
        jumpBuffered.current = true;
        return;
    }
    keysPressed.current[control] = active;
  }, [toggleFlashlight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (e.code === 'KeyF' && gameState.player.hp > 0 && gameStarted && !isMenuOpen && !isInventoryOpen) {
        toggleFlashlight();
      }
      if (e.code === 'KeyI' && gameStarted && gameState.player.hp > 0 && !isMenuOpen) {
        setIsInventoryOpen(prev => !prev);
      }
      if (e.code === 'Escape' && gameStarted && gameState.player.hp > 0) {
        if (isInventoryOpen) setIsInventoryOpen(false);
        else setIsMenuOpen(prev => !prev);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.code] = false; };
    const handleMouseDown = () => { if (gameStarted && !isMenuOpen && !isInventoryOpen) isMouseDown.current = true; };
    const handleMouseUp = () => { isMouseDown.current = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gameState.player.hp, toggleFlashlight, gameStarted, isMenuOpen, isInventoryOpen]);

  useEffect(() => {
    const update = (time: number) => {
      const dt = Math.min((time - lastTime.current) / 16.66, 3);
      lastTime.current = time;

      setGameState(prev => {
        let nextScreenShake = prev.screenShake * 0.9 * (1 - (0.05 * dt));
        if (nextScreenShake < 0.1) nextScreenShake = 0;

        const sW = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const sH = typeof window !== 'undefined' ? window.innerHeight : 800;
        const groundLevelY = sH * 0.75;
        const windX = -2.5;

        if (!gameStarted || prev.player.hp <= 0 || isMenuOpen || isInventoryOpen) {
            let nextLamps = prev.lamps.map(lamp => {
              if (!lamp.isBroken) return lamp;
              let newIntensity = lamp.intensity;
              if (Math.random() < 0.05 * dt) {
                newIntensity = Math.random() < 0.3 ? 0 : 0.9;
              }
              return { ...lamp, intensity: Math.max(0, Math.min(0.9, newIntensity)) };
            });

            let nextRain = prev.rain.map(r => {
              let nx = r.x + windX * dt;
              let ny = r.y + r.speed * dt;
              if (ny > sH) { ny = -20; nx = Math.random() * (sW + 200); }
              if (nx < -100) nx = sW + 100;
              return { ...r, x: nx, y: ny };
            });

            let nextLightningIntensity = prev.lightningIntensity;
            if (nextLightningIntensity > 0) {
              nextLightningIntensity -= 0.05 * dt;
            } else if (Math.random() < 0.0015 * dt) {
              nextLightningIntensity = 1.0;
            }

            return { ...prev, rain: nextRain, lamps: nextLamps, lightningIntensity: nextLightningIntensity, screenShake: nextScreenShake };
        }

        const nextPlayer = { ...prev.player, pos: { ...prev.player.pos }, vel: { ...prev.player.vel } };
        let nextEnemies = [...prev.enemies];
        let nextCoins = [...prev.coins];
        let nextCollectingCoins = [...prev.collectingCoins];
        let nextCasings = [...prev.casings];
        let nextBloodParticles = [...prev.bloodParticles];
        let nextFloatingTexts = [...prev.floatingTexts];
        let nextGrenades = [...prev.grenades];
        let nextExplosions = [...prev.explosions];
        let nextMuzzleFlash = prev.muzzleFlash;
        let nextWorldOffset = prev.worldOffset;
        let nextScore = prev.score;
        let nextLamps = [...prev.lamps];
        let nextRain = [...prev.rain];
        let nextLightningIntensity = prev.lightningIntensity;
        
        const speed = 4.5;
        const gravity = 0.6;
        const jumpForce = -12;
        const now = Date.now();

        if (nextLightningIntensity > 0) {
          nextLightningIntensity -= 0.05 * dt;
        } else if (Math.random() < 0.0015 * dt) {
          nextLightningIntensity = 1.0;
        }

        let firedThisFrame = false;

        nextLamps = nextLamps.map(lamp => {
          if (!lamp.isBroken) return lamp;
          let newIntensity = lamp.intensity;
          if (Math.random() < 0.05 * dt) {
            newIntensity = Math.random() < 0.3 ? 0 : 0.9;
          } else {
            newIntensity += (Math.random() - 0.5) * 0.1 * dt;
          }
          return { ...lamp, intensity: Math.max(0, Math.min(0.9, newIntensity)) };
        });

        nextRain = nextRain.map(r => {
          let nx = r.x + windX * dt;
          let ny = r.y + r.speed * dt;
          if (ny > sH) {
            ny = -20;
            nx = Math.random() * (sW + 200);
          }
          if (nx < -100) nx = sW + 100;
          return { ...r, x: nx, y: ny };
        });

        const baseBatteryLossRate = (100 / (10 * 60)) * dt;
        if (nextPlayer.isFlashlightOn) {
          nextPlayer.flashlightBattery = Math.max(0, nextPlayer.flashlightBattery - baseBatteryLossRate);
          if (nextPlayer.flashlightBattery <= 0) {
            nextPlayer.isFlashlightOn = false;
          }
        } else {
          const rechargeRate = baseBatteryLossRate * 1.5 * nextPlayer.flashlightChargeRate;
          nextPlayer.flashlightBattery = Math.min(nextPlayer.flashlightMaxBattery, nextPlayer.flashlightBattery + rechargeRate);
        }

        if (shootCooldown.current > 0) shootCooldown.current -= dt;
        if (isMouseDown.current && shootCooldown.current <= 0) {
          if (nextPlayer.currentWeapon === 'pistol') {
            nextMuzzleFlash = 1.0;
            nextScreenShake = Math.min(nextScreenShake + 4, 15);
            shootCooldown.current = 7;
            firedThisFrame = true;
            const bulletRange = 600;
            const bulletDir = nextPlayer.direction === 'right' ? 1 : -1;
            const playerX = nextPlayer.pos.x;

            nextCasings.push({
              id: `casing-${now}-${Math.random()}`,
              x: playerX + (nextPlayer.direction === 'right' ? nextPlayer.width : 0),
              y: nextPlayer.pos.y - 36,
              vel: { x: -bulletDir * (Math.random() * 3 + 2), y: -Math.random() * 4 - 2 },
              rotation: Math.random() * Math.PI * 2,
              rotVel: (Math.random() - 0.5) * 0.5,
              life: 1.0
            });

            let closestDist = bulletRange;
            let hitType: 'none' | 'prop' | 'enemy' = 'none';
            let hitId: string | null = null;
            let hitPos: number = 0;
            let hitY: number = 0;

            if (nextPlayer.pos.y > -5) {
              for (const prop of prev.props) {
                const dist = bulletDir === 1 ? prop.x - playerX : playerX - (prop.x + prop.width);
                if (dist > 0 && dist < closestDist) {
                    closestDist = dist;
                    hitType = 'prop';
                    hitPos = bulletDir === 1 ? prop.x : prop.x + prop.width;
                }
              }
            }

            for (const enemy of nextEnemies) {
              const dist = bulletDir === 1 ? enemy.x - playerX : playerX - (enemy.x + enemy.width);
              if (dist > 0 && dist < closestDist) {
                  closestDist = dist;
                  hitType = 'enemy';
                  hitId = enemy.id;
                  hitPos = bulletDir === 1 ? enemy.x : enemy.x + enemy.width;
                  hitY = enemy.y - (enemy.height * (0.3 + Math.random() * 0.4));
              }
            }

            if (hitType === 'enemy' && hitId) {
              for (let i = 0; i < 8; i++) {
                nextBloodParticles.push({
                  id: `blood-${now}-${Math.random()}`,
                  x: hitPos,
                  y: hitY,
                  vel: { 
                    x: bulletDir * (2 + Math.random() * 4), 
                    y: (Math.random() - 0.7) * 4 
                  },
                  size: 2 + Math.random() * 3,
                  life: 1.0
                });
              }

              nextEnemies = nextEnemies.map(enemy => {
                if (enemy.id === hitId) {
                  const newHp = enemy.hp - nextPlayer.damagePower;
                  if (newHp <= 0) {
                    const coinCount = Math.floor(Math.random() * 3) + 2;
                    for (let i = 0; i < coinCount; i++) {
                      nextCoins.push({
                        id: `coin-${enemy.id}-${i}-${now}`,
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y - enemy.height / 2,
                        vel: { x: (Math.random() - 0.5) * 6, y: -5 - Math.random() * 5 },
                        value: Math.floor(Math.random() * 11) + 5
                      });
                    }
                    nextFloatingTexts.push({
                      id: `kill-${enemy.id}-${now}`,
                      x: enemy.x + enemy.width / 2,
                      y: -enemy.height - 40,
                      vx: 0,
                      vy: -1,
                      text: "ELIMINATED",
                      opacity: 1.0,
                      color: '#ff1a1a'
                    });
                  }
                  return { 
                    ...enemy, 
                    hp: newHp, 
                    isAggroed: true,
                    vel: { x: bulletDir * 6, y: -5 } 
                  };
                }
                return enemy;
              }).filter(e => e.hp > 0);
            }
          } else if (nextPlayer.currentWeapon === 'grenade' && nextPlayer.grenadeAmmo > 0) {
            // THROW GRENADE
            nextPlayer.grenadeAmmo--;
            const throwDir = nextPlayer.direction === 'right' ? 1 : -1;
            nextGrenades.push({
              id: `grenade-${now}-${Math.random()}`,
              x: nextPlayer.pos.x + (nextPlayer.direction === 'right' ? nextPlayer.width : 0),
              y: nextPlayer.pos.y - 40,
              vel: { x: throwDir * 8, y: -10 },
              rotation: 0,
              timer: 0,
              isArmed: true 
            });
            shootCooldown.current = 25;
          }
        }

        // GRENADE PHYSICS
        nextGrenades = nextGrenades.map(g => {
          const updated = { ...g, vel: { ...g.vel } };
          
          updated.timer += 16.66 * dt;

          // Physics
          updated.vel.y += gravity * dt;
          updated.x += updated.vel.x * dt;
          updated.y += updated.vel.y * dt;
          updated.rotation += updated.vel.x * 0.05 * dt;

          const gx = updated.x;
          const gy = updated.y;

          // Collision detection
          let gGround = 0;
          let gOverPit = prev.pits.some(pit => (gx > pit.x && gx < pit.x + pit.width));
          if (gOverPit) gGround = 1000;

          for (const prop of prev.props) {
            if (gx + 10 > prop.x && gx < prop.x + prop.width) {
              const pTop = -prop.height;
              if (updated.vel.y >= 0 && g.y <= pTop + 5 && updated.y >= pTop) {
                gGround = pTop;
                break;
              }
            }
          }

          if (updated.y > gGround) {
            updated.y = gGround;
            updated.vel.y = -updated.vel.y * 0.4; 
            updated.vel.x *= 0.6; 
          }

          // Fuse time reached (1.2s)
          if (updated.timer >= 1200) {
            nextExplosions.push({ id: `exp-${now}-${Math.random()}`, x: updated.x, y: updated.y, life: 1.0 });
            nextScreenShake = 30;
            // AOE Damage
            nextEnemies = nextEnemies.map(e => {
              const dx = e.x - updated.x;
              const dy = e.y - updated.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < 150) return { ...e, hp: 0 };
              return e;
            });
            return null as any;
          }
          
          return updated;
        }).filter(g => g !== null && g.y < 1200); 

        nextExplosions = nextExplosions.map(exp => ({
          ...exp, life: exp.life - 0.02 * dt
        })).filter(exp => exp.life > 0);

        nextCasings = nextCasings.map(c => {
          const updated = { ...c, vel: { ...c.vel } };
          updated.vel.y += gravity * dt;
          updated.x += updated.vel.x * dt;
          updated.y += updated.vel.y * dt;
          updated.rotation += updated.rotVel * dt;
          updated.life -= 0.005 * dt;
          if (updated.y > 0) {
            updated.y = 0;
            updated.vel.y = -updated.vel.y * 0.4;
            updated.vel.x *= 0.6;
            updated.rotVel *= 0.5;
          }
          return updated;
        }).filter(c => c.life > 0);

        nextBloodParticles = nextBloodParticles.map(bp => {
          const updated = { ...bp, vel: { ...bp.vel } };
          updated.vel.y += gravity * 0.5 * dt;
          updated.x += updated.vel.x * dt;
          updated.y += updated.vel.y * dt;
          updated.life -= 0.02 * dt;
          if (updated.y > 0) {
            updated.y = 0;
            updated.vel.x *= 0.5;
            updated.vel.y = 0;
          }
          return updated;
        }).filter(bp => bp.life > 0);

        nextCoins = nextCoins.map(coin => {
          const updatedCoin = { ...coin, vel: { ...coin.vel } };
          updatedCoin.vel.y += gravity * 0.8 * dt;
          const potX = updatedCoin.x + updatedCoin.vel.x * dt;
          const potY = updatedCoin.y + updatedCoin.vel.y * dt;

          let cGround = 0;
          let cOverPit = prev.pits.some(pit => (potX > pit.x && potX < pit.x + pit.width));
          if (cOverPit || updatedCoin.y > 5) cGround = 1000;
          
          for (const prop of prev.props) {
             if (potX + 10 > prop.x && potX < prop.x + prop.width) {
               if (updatedCoin.vel.y >= 0 && updatedCoin.y <= -prop.height + 5 && potY >= -prop.height) {
                 cGround = -prop.height;
                 break;
               }
             }
          }

          updatedCoin.x = potX;
          updatedCoin.y = potY;
          updatedCoin.vel.x *= 0.98;

          if (updatedCoin.y > cGround) {
            updatedCoin.y = cGround;
            updatedCoin.vel.y = -updatedCoin.vel.y * 0.4;
            updatedCoin.vel.x *= 0.8;
          }

          return updatedCoin;
        }).filter(coin => {
          const dx = coin.x - (nextPlayer.pos.x + nextPlayer.width/2);
          const dy = coin.y - (nextPlayer.pos.y - nextPlayer.height/2);
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 40) {
            nextCollectingCoins.push({
              id: coin.id,
              screenPos: { 
                x: coin.x - nextWorldOffset, 
                y: groundLevelY + coin.y - 10 
              },
              value: coin.value,
              progress: 0
            });
            return false;
          }
          return coin.y < 450; 
        });

        const uiTarget = { x: 180, y: 80 };
        nextCollectingCoins = nextCollectingCoins.map(c => {
          const nextProgress = c.progress + 0.02 * dt;
          const t = Math.min(1, nextProgress);
          const currentX = c.screenPos.x + (uiTarget.x - c.screenPos.x) * (t * t);
          const currentY = c.screenPos.y + (uiTarget.y - c.screenPos.y) * t;
          if (t >= 1) {
            nextScore += c.value;
            return null as any;
          }
          return {
            ...c,
            progress: nextProgress,
            screenPos: { x: currentX, y: currentY }
          };
        }).filter(Boolean);

        nextEnemies = nextEnemies.map(enemy => {
          const updatedEnemy = { ...enemy, vel: { ...enemy.vel } };
          const distToPlayer = updatedEnemy.x - nextPlayer.pos.x;
          const absDist = Math.abs(distToPlayer);
          
          if (nextPlayer.isFlashlightOn) {
            const facingCorrectWay = nextPlayer.direction === 'right' ? distToPlayer > 0 : distToPlayer < 0;
            if (facingCorrectWay && absDist < 350) updatedEnemy.isAggroed = true;
          }
          if (!updatedEnemy.isAggroed && firedThisFrame && absDist < 500) updatedEnemy.isAggroed = true;

          if (updatedEnemy.isAggroed) {
            if (Math.abs(updatedEnemy.vel.y) < 0.1) {
               const moveDir = distToPlayer > 0 ? -1 : 1;
               updatedEnemy.vel.x = moveDir * (2.2 + Math.random() * 0.8); 
            } else {
               updatedEnemy.vel.x *= 0.98;
            }
          } else {
            updatedEnemy.vel.x *= 0.85;
          }

          const enemyPotentialX = updatedEnemy.x + updatedEnemy.vel.x * dt;
          let enemyXBlocked = false;
          for (const prop of prev.props) {
            if (Math.abs(prop.x - enemyPotentialX) > 100) continue;
            const eTop = updatedEnemy.y - updatedEnemy.height;
            const eBottom = updatedEnemy.y;
            const pTop = -prop.height;
            if (eBottom > pTop + 5 && eTop < -5) {
                if (enemyPotentialX + updatedEnemy.width > prop.x && enemyPotentialX < prop.x + prop.width) {
                    enemyXBlocked = true;
                    updatedEnemy.vel.x = 0;
                    break;
                }
            }
          }

          if (enemyXBlocked && updatedEnemy.isAggroed && Math.abs(updatedEnemy.vel.y) < 0.1 && Math.abs(updatedEnemy.y) < 5) {
             updatedEnemy.vel.y = -8; 
             updatedEnemy.x = enemyPotentialX; 
          } else if (!enemyXBlocked) {
            updatedEnemy.x = enemyPotentialX;
          }

          updatedEnemy.vel.y += gravity * dt;
          const enemyPotentialY = updatedEnemy.y + updatedEnemy.vel.y * dt;
          
          let isEnemyOverPit = false;
          const enemyCenterX = updatedEnemy.x + updatedEnemy.width / 2;
          for (const pit of prev.pits) {
            if (enemyCenterX > pit.x && enemyCenterX < pit.x + pit.width) {
              isEnemyOverPit = true;
              break;
            }
          }

          let enemyGroundLevel = 0;
          if (isEnemyOverPit || updatedEnemy.y > 5) enemyGroundLevel = 1000;

          for (const prop of prev.props) {
            if (Math.abs(prop.x - updatedEnemy.x) > prop.width + 50) continue;
            if (updatedEnemy.x + updatedEnemy.width > prop.x && updatedEnemy.x < prop.x + prop.width) {
              const pTop = -prop.height;
              if (updatedEnemy.vel.y >= 0 && enemy.y <= pTop + 5 && enemyPotentialY >= pTop) {
                enemyGroundLevel = pTop;
                break;
              }
            }
          }

          updatedEnemy.y = enemyPotentialY;
          if (updatedEnemy.y > enemyGroundLevel) {
            updatedEnemy.y = enemyGroundLevel;
            updatedEnemy.vel.y = 0;
            updatedEnemy.vel.x *= 0.6;
          }

          const isEnemyMoving = Math.abs(updatedEnemy.vel.x) > 0.1 || Math.abs(updatedEnemy.vel.y) > 0.1;
          const isColliding = 
            isEnemyMoving &&
            Math.abs(updatedEnemy.x - nextPlayer.pos.x) < 30 && 
            Math.abs(updatedEnemy.y - nextPlayer.pos.y) < 50;

          if (isColliding && now - updatedEnemy.lastAttackTime > 1000) {
            const dmg = 10 + Math.floor(Math.random() * 6);
            nextPlayer.hp = Math.max(0, nextPlayer.hp - dmg);
            nextScreenShake = Math.min(nextScreenShake + 20, 40);
            const pushDir = nextPlayer.pos.x < updatedEnemy.x ? -1 : 1;
            nextPlayer.vel.x = pushDir * 10; 
            nextPlayer.vel.y = -7.5; 
            if (nextPlayer.hp <= 0) setDeathReason('enemy');
            updatedEnemy.lastAttackTime = now;
            nextFloatingTexts.push({
              id: `dmg-${Math.random()}`,
              x: nextPlayer.pos.x + nextPlayer.width / 2,
              y: -nextPlayer.height - 10,
              vx: pushDir * 2,
              vy: -4,
              text: `-${dmg}`,
              opacity: 1.0,
              color: '#ffffff'
            });
          }
          return updatedEnemy;
        }).filter(e => e.hp > 0 && e.y < 450);

        if (nextMuzzleFlash > 0) nextMuzzleFlash -= 0.15 * dt;
        
        let moveX = 0;
        if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'] || keysPressed.current['MoveRight']) {
          moveX += speed;
          nextPlayer.direction = 'right';
        }
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] || keysPressed.current['MoveLeft']) {
          moveX -= speed;
          nextPlayer.direction = 'left';
        }

        nextPlayer.vel.x += (moveX - nextPlayer.vel.x) * 0.2;
        const potentialX = nextPlayer.pos.x + nextPlayer.vel.x * dt;
        
        let xBlocked = false;
        for (const prop of prev.props) {
            if (Math.abs(prop.x - potentialX) > 100) continue;
            const playerTop = nextPlayer.pos.y - nextPlayer.height;
            const playerBottom = nextPlayer.pos.y;
            const propTop = -prop.height;
            if (playerBottom > propTop + 5 && playerTop < -5) {
                if (potentialX + nextPlayer.width > prop.x && potentialX < prop.x + prop.width) {
                    xBlocked = true;
                    nextPlayer.vel.x = 0;
                    break;
                }
            }
        }
        if (!xBlocked) nextPlayer.pos.x = potentialX;

        nextPlayer.vel.y += gravity * dt;
        const potentialY = nextPlayer.pos.y + nextPlayer.vel.y * dt;
        
        let isOverPit = false;
        const playerCenterX = nextPlayer.pos.x + nextPlayer.width / 2;
        for (const pit of prev.pits) {
            if (playerCenterX > pit.x && playerCenterX < pit.x + pit.width) {
                isOverPit = true;
                break;
            }
        }

        let groundLevel = 0;
        const isFallingDeep = prev.player.pos.y > 5;
        if (isOverPit || isFallingDeep) groundLevel = 1000;

        for (const prop of prev.props) {
            if (Math.abs(prop.x - nextPlayer.pos.x) > prop.width + 50) continue;
            if (nextPlayer.pos.x + nextPlayer.width > prop.x && nextPlayer.pos.x < prop.x + prop.width) {
                const propTop = -prop.height;
                if (nextPlayer.vel.y >= 0 && prev.player.pos.y <= propTop + 5 && potentialY >= propTop) {
                    groundLevel = propTop;
                    break;
                }
            }
        }

        nextPlayer.pos.y = potentialY;
        if (nextPlayer.pos.y > groundLevel) {
          nextPlayer.pos.y = groundLevel;
          nextPlayer.vel.y = 0;
        }

        if (nextPlayer.pos.y > 450) {
            nextPlayer.hp = 0;
            setDeathReason('falling');
        }

        const jumpIntent = keysPressed.current['Space'] || keysPressed.current['ArrowUp'] || keysPressed.current['KeyW'] || jumpBuffered.current;
        if (jumpIntent && (Math.abs(nextPlayer.pos.y - groundLevel) < 2)) {
          nextPlayer.vel.y = jumpForce;
          jumpBuffered.current = false;
        }

        const scrollThreshold = sW * 0.4;
        if (nextPlayer.pos.x - nextWorldOffset > scrollThreshold) {
          nextWorldOffset = nextPlayer.pos.x - scrollThreshold;
        } else if (nextPlayer.pos.x - nextWorldOffset < 100) {
            nextWorldOffset = Math.max(0, nextPlayer.pos.x - 100);
        }

        nextFloatingTexts = nextFloatingTexts.map(ft => ({
          ...ft,
          x: ft.x + ft.vx * dt,
          y: ft.y + ft.vy * dt,
          opacity: ft.opacity - 0.02 * dt
        })).filter(ft => ft.opacity > 0);

        return {
          ...prev,
          player: nextPlayer,
          enemies: nextEnemies,
          coins: nextCoins,
          collectingCoins: nextCollectingCoins,
          casings: nextCasings,
          bloodParticles: nextBloodParticles,
          floatingTexts: nextFloatingTexts,
          grenades: nextGrenades,
          explosions: nextExplosions,
          rain: nextRain,
          score: nextScore,
          muzzleFlash: nextMuzzleFlash,
          lightningIntensity: nextLightningIntensity,
          worldOffset: nextWorldOffset,
          isMoving: Math.abs(nextPlayer.vel.x) > 0.1,
          lamps: nextLamps,
          screenShake: nextScreenShake
        };
      });
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameStarted, isMenuOpen, isInventoryOpen]);

  const nearestStation = gameState.upgradeStations.find(s => Math.abs(s.x - gameState.player.pos.x) < 100);

  return (
    <div className="relative w-screen h-screen-dynamic bg-black overflow-hidden cursor-crosshair">
      <GameCanvas gameState={gameState} />
      
      {!gameStarted ? (
        <StartScreen 
          onStart={handleStartGame} 
          controlMode={controlMode} 
          onUpdateControlMode={handleUpdateControlMode}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      ) : (
        <>
          <UIOverlay 
            playerHp={gameState.player.hp}
            playerMaxHp={gameState.player.maxHp}
            flashlightBattery={gameState.player.flashlightBattery}
            flashlightMaxBattery={gameState.player.flashlightMaxBattery}
            score={gameState.score}
            distance={Math.max(0, Math.floor((gameState.player.pos.x - 300) / 10))} 
            isFlashlightOn={gameState.player.isFlashlightOn}
            isFullscreen={isFullscreen}
            controlMode={controlMode}
            isMenuOpen={isMenuOpen}
            isInventoryOpen={isInventoryOpen}
            currentWeapon={gameState.player.currentWeapon}
            grenadeAmmo={gameState.player.grenadeAmmo}
            onToggleMenu={() => setIsMenuOpen(p => !p)}
            onToggleFullscreen={toggleFullscreen}
            onControl={handleTouchControl}
            onRestart={handleRestart}
            onMainMenu={handleMainMenu}
            atUpgradeStation={!!nearestStation}
            nearestStationScreenX={nearestStation ? (nearestStation.x - gameState.worldOffset + 20) : null}
            onUpgrade={handleUpgrade}
            onEquipWeapon={handleEquipWeapon}
          />
          
          {gameState.player.hp <= 0 && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-[200] p-6 text-center animate-in fade-in duration-1000">
              <div className="flex flex-col items-center justify-center w-full max-w-lg">
                {deathReason === 'falling' ? (
                  <>
                    <h2 className="text-4xl sm:text-6xl md:text-7xl font-creepster mb-4 text-blue-600 drop-shadow-[0_0_20px_rgba(37,99,235,0.7)] break-words max-w-full uppercase leading-tight">THE ABYSS CONSUMED YOU</h2>
                    <p className="text-[10px] sm:text-xs md:text-lg mb-10 tracking-[0.2em] opacity-40 uppercase">You stepped into the eternal void</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl sm:text-6xl md:text-7xl font-creepster mb-4 text-red-600 drop-shadow-[0_0_20px_rgba(255,0,0,0.7)] break-words max-w-full uppercase leading-tight">DARKNESS TOOK YOU</h2>
                    <p className="text-[10px] sm:text-xs md:text-lg mb-10 tracking-[0.2em] opacity-40 uppercase">Your soul belongs to the shadows now</p>
                  </>
                )}
                <div className="flex flex-col gap-4 w-full max-w-[240px]">
                  <button 
                    onClick={() => handleRestart()}
                    className="px-6 py-4 bg-red-950/40 border-2 border-red-600/40 rounded-full text-lg sm:text-xl uppercase tracking-widest font-creepster hover:bg-red-800/40 hover:border-red-500 transition-all active:scale-95 pointer-events-auto shadow-[0_0_30px_rgba(255,0,0,0.2)]"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={handleMainMenu}
                    className="px-6 py-2 border border-white/10 rounded-full text-white/40 text-[10px] font-black tracking-[0.3em] uppercase hover:text-white hover:bg-white/10 transition-all pointer-events-auto active:scale-95"
                  >
                    Return to Main Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
