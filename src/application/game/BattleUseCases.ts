import { BattleGameState, Card, playBattleRound, startBattleGame } from '../../game/engine';
import { LocalStorageBattleGameRepository } from '../../infrastructure/game/LocalStorageBattleGameRepository';

const repository = new LocalStorageBattleGameRepository();
const BOT_NAME = 'Bot Marcel';

export function createBattleGame(playerName: string, deck?: Card[]): BattleGameState {
  return startBattleGame([playerName, BOT_NAME], deck);
}

export function playBattleTurn(state: BattleGameState): BattleGameState {
  return playBattleRound(state);
}

export function loadSavedBattleGame(): BattleGameState | null {
  return repository.load();
}

export function saveBattleGame(state: BattleGameState): void {
  repository.save(state);
}

export function clearBattleGame(): void {
  repository.clear();
}
