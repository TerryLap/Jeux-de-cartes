import { Account, AuthMode } from '../../domain/auth/Account';
import { LocalStorageAccountRepository } from '../../infrastructure/auth/LocalStorageAccountRepository';
import { CredentialsInput, validateCredentials } from './AuthValidator';
import { hashPassword } from './PasswordHasher';

export interface AuthResult {
  success: boolean;
  message: string;
  account?: Account;
}

const repository = new LocalStorageAccountRepository();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function authenticate(mode: AuthMode, input: CredentialsInput): Promise<AuthResult> {
  const validation = validateCredentials(input, mode);
  if (!validation.ok) {
    return { success: false, message: validation.message };
  }

  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);

  if (mode === 'signup') {
    const alreadyExists = repository.findByEmail(email);
    if (alreadyExists) {
      return { success: false, message: 'Ce compte existe deja. Connecte-toi.' };
    }

    const created = repository.create({
      nickname: input.nickname.trim(),
      email,
      passwordHash
    });

    return { success: true, message: `Bienvenue ${created.nickname}.`, account: created };
  }

  const existing = repository.findByEmail(email);
  if (!existing || existing.passwordHash !== passwordHash) {
    return { success: false, message: 'Compte invalide: email ou mot de passe incorrect.' };
  }

  return { success: true, message: `Bienvenue ${existing.nickname}.`, account: existing };
}
