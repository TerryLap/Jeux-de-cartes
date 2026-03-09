import { GameId } from './GameCatalog';

export interface GameAction {
  type: string;
  label: string;
}

export interface GameViewPlayer {
  id: string;
  name: string;
}

export interface GameViewModel {
  title: string;
  summary: string;
  players: GameViewPlayer[];
}

export interface GameRuntime<TState, TAction extends GameAction = GameAction> {
  id: GameId;
  startGame: (playerName: string) => TState;
  loadGame: () => TState | null;
  saveGame: (state: TState) => void;
  clearGame: () => void;
  getAvailableActions: (state: TState) => TAction[];
  applyAction: (state: TState, action: TAction) => TState;
  getViewModel: (state: TState) => GameViewModel;
}
