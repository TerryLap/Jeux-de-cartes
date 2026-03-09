import { PlayerSession } from '../../domain/session/Session';
import { LocalStorageSessionRepository } from '../../infrastructure/session/LocalStorageSessionRepository';

const repository = new LocalStorageSessionRepository();

export function loadSession(): PlayerSession | null {
  return repository.load();
}

export function saveSession(session: PlayerSession): void {
  repository.save(session);
}

export function clearSession(): void {
  repository.clear();
}
