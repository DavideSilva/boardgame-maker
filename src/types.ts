export type ActionType = 'move' | 'attack' | 'draw' | 'heal' | 'custom';

export interface Action {
  id: string;
  type: ActionType;
  value: number | string;
  description: string;
}

export interface Card {
  id: string;
  name: string;
  description: string;
  actions: Action[];
}

export type CellType = 'empty' | 'blocked' | 'special' | 'start' | 'end';

export type GridType = 'square' | 'hexagonal';

export interface MapCell {
  x: number;
  y: number;
  type: CellType;
}

export interface GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  gridType: GridType;
  cells: MapCell[];
}
