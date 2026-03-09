import { PlayerSession } from '../../domain/session/Session';

const STORAGE_KEY = 'jdc.session';

export class LocalStorageSessionRepository {
  load(): PlayerSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as PlayerSession;
      if (typeof parsed.nickname !== 'string') {
        return null;
      }

      return {
        nickname: parsed.nickname,
        selectedGame: parsed.selectedGame ?? null
      };
    } catch {
      return null;
    }
  }

  save(session: PlayerSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
