import { Account } from '../../domain/auth/Account';

const STORAGE_KEY = 'jdc.accounts';

export class LocalStorageAccountRepository {
  loadAll(): Account[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Account[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveAll(accounts: Account[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }

  findByEmail(email: string): Account | undefined {
    return this.loadAll().find((account) => account.email === email);
  }

  create(account: Account): Account {
    const existing = this.loadAll();
    this.saveAll([...existing, account]);
    return account;
  }
}
