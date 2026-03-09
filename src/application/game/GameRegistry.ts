import { GameDefinition, GAME_CATALOG, GameId } from '../../domain/games/GameCatalog';
import { battleRuntime } from './BattleRuntime';

export interface RegisteredGameRuntime {
  loadGame: () => unknown | null;
  clearGame: () => void;
}

export interface RegisteredGame extends GameDefinition {
  runtime?: RegisteredGameRuntime;
}

const RUNTIMES: Partial<Record<GameId, RegisteredGameRuntime>> = {
  battle: {
    loadGame: () => battleRuntime.loadGame(),
    clearGame: () => battleRuntime.clearGame()
  }
};

export function getRegisteredGames(): RegisteredGame[] {
  return GAME_CATALOG.map((game) => ({
    ...game,
    runtime: RUNTIMES[game.id]
  }));
}

export function getRegisteredGame(gameId: GameId): RegisteredGame | undefined {
  return getRegisteredGames().find((game) => game.id === gameId);
}

export function getPlayableGame(gameId: GameId): RegisteredGame | undefined {
  const game = getRegisteredGame(gameId);
  if (!game?.runtime || game.status !== 'playable') {
    return undefined;
  }

  return game;
}
