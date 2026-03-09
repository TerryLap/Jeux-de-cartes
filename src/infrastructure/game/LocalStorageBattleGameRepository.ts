import { BattleGameState, BattleRoundResult } from '../../game/engine';

const STORAGE_KEY = 'jdc.battle.current';

export class LocalStorageBattleGameRepository {
  load(): BattleGameState | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as BattleGameState;
      if (!Array.isArray(parsed.players) || typeof parsed.round !== 'number' || !parsed.status) {
        return null;
      }

      return {
        ...parsed,
        lastRound: normalizeLastRound(parsed.lastRound)
      };
    } catch {
      return null;
    }
  }

  save(state: BattleGameState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function normalizeLastRound(lastRound: BattleGameState['lastRound']): BattleRoundResult | null {
  if (!lastRound) {
    return null;
  }

  return {
    ...lastRound,
    reveals: Array.isArray(lastRound.reveals) ? lastRound.reveals : [],
    wonCards: Array.isArray(lastRound.wonCards) ? lastRound.wonCards : []
  };
}
