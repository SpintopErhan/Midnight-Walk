
export interface Vector2 {
  x: number;
  y: number;
}

export interface Player {
  pos: Vector2;
  vel: Vector2;
  hp: number;
  width: number;
  height: number;
  color: string;
  isFlashlightOn: boolean;
  flashlightBattery: number; // 0 to 100
  direction: 'left' | 'right';
}

export interface StreetLamp {
  x: number;
  range: number;
  intensity: number;
  isBroken: boolean;
}

export type PropType = 'box' | 'barrel';

export interface StreetProp {
  x: number;
  type: PropType;
  width: number;
  height: number;
}

export interface Pit {
  x: number;
  width: number;
}

export interface GoldCoin {
  id: string;
  x: number;
  y: number;
  vel: Vector2;
  value: number;
}

export interface CollectingCoin {
  id: string;
  screenPos: Vector2;
  value: number;
  progress: number; // 0 to 1
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  vel: Vector2;
  hp: number;
  maxHp: number;
  width: number;
  height: number;
  isAggroed: boolean;
  lastAttackTime: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  opacity: number;
  color?: string;
}

export interface Casing {
  id: string;
  x: number;
  y: number;
  vel: Vector2;
  rotation: number;
  rotVel: number;
  life: number;
}

export interface BloodParticle {
  id: string;
  x: number;
  y: number;
  vel: Vector2;
  size: number;
  life: number; // 1.0 to 0
}

export interface RainParticle {
  id: string;
  x: number;
  y: number;
  speed: number;
  len: number;
}

export interface GameState {
  player: Player;
  lamps: StreetLamp[];
  props: StreetProp[];
  pits: Pit[];
  enemies: Enemy[];
  coins: GoldCoin[];
  collectingCoins: CollectingCoin[];
  casings: Casing[];
  bloodParticles: BloodParticle[];
  floatingTexts: FloatingText[];
  rain: RainParticle[];
  score: number;
  worldOffset: number;
  isMoving: boolean;
  muzzleFlash: number;
  lightningIntensity: number;
}
