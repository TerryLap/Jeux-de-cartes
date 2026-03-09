import { LocalStorageAccountRepository } from '../../infrastructure/auth/LocalStorageAccountRepository';
import { LocalStorageBattleGameRepository } from '../../infrastructure/game/LocalStorageBattleGameRepository';
import { LocalStorageSessionRepository } from '../../infrastructure/session/LocalStorageSessionRepository';

const RESET_FLAG_KEY = 'jdc.storage-reset.2026-03-09';

const accountRepository = new LocalStorageAccountRepository();
const sessionRepository = new LocalStorageSessionRepository();
const battleRepository = new LocalStorageBattleGameRepository();

export function resetStoredDataOnce(): void {
  if (localStorage.getItem(RESET_FLAG_KEY) === 'done') {
    return;
  }

  accountRepository.clear();
  sessionRepository.clear();
  battleRepository.clear();
  localStorage.setItem(RESET_FLAG_KEY, 'done');
}
