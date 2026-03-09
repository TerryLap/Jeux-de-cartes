import { GameId } from '../games/GameCatalog';

export interface PlayerSession {
  nickname: string;
  selectedGame: GameId | null;
}
