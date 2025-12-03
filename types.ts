
export interface Question {
  id: number;
  category: 'Desconto' | 'Travesseiro' | 'Frete' | 'Comissão' | 'Atendimento';
  text: string;
  answers: [string, string, string]; // Left, Center, Right
  correctIndex: number; // 0, 1, or 2
}

export type GameState = 'MENU' | 'CUSTOMIZE' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

export interface GameConfig {
  speed: number;
  laneCount: number;
}

export interface TruckConfig {
  color: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'slate';
  pattern: 'solid' | 'stripe';
  hasSpoiler: boolean;
  hasRack: boolean;
  hasNeon: boolean;
  hasExhaust: boolean;
  cargoType: 'mattress' | 'box_bed' | 'sofa' | 'empty';
  wheelType: 'classic' | 'chrome' | 'dark';
}