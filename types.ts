
export interface Vector2 {
  x: number;
  y: number;
}

export type WeaponType = 'pistol' | 'grenade';

export interface Player {
  pos: Vector2;
  vel: Vector2;
  hp: number;
  maxHp: number;
  width: number;
  height: number;
  color: string;
  isFlashlightOn: boolean;
  flashlightBattery: number; // 0 to max
  flashlightMaxBattery: number;
  flashlightChargeRate: number;
  damagePower: number;
  direction: 'left' | 'right';
  currentWeapon: WeaponType;
  grenadeAmmo: number;
}

export interface StreetLamp {
  x: number;
  range: number;
  intensity: number;
  isBroken: boolean;
}

export interface Billboard {
  id: string;
  x: number;
  message: string;
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

export interface UpgradeStation {
  id: string;
  x: number;
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

export interface Grenade {
  id: string;
  x: number;
  y: number;
  vel: Vector2;
  rotation: number;
  timer: number; // 0 to 2000ms
  isArmed: boolean;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
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
  billboards: Billboard[];
  props: StreetProp[];
  pits: Pit[];
  enemies: Enemy[];
  upgradeStations: UpgradeStation[];
  coins: GoldCoin[];
  collectingCoins: CollectingCoin[];
  casings: Casing[];
  bloodParticles: BloodParticle[];
  grenades: Grenade[];
  explosions: Explosion[];
  floatingTexts: FloatingText[];
  rain: RainParticle[];
  score: number;
  worldOffset: number;
  isMoving: boolean;
  muzzleFlash: number;
  lightningIntensity: number;
  screenShake: number;
}
