import { AuthMode } from '../../domain/auth/Account';

export interface CredentialsInput {
  nickname: string;
  email: string;
  password: string;
}

export interface ValidationResult {
  ok: boolean;
  message: string;
}

export function validateCredentials(input: CredentialsInput, mode: AuthMode): ValidationResult {
  if (!input.email.trim() || !input.password.trim()) {
    return { ok: false, message: 'Email et mot de passe sont obligatoires.' };
  }

  if (!input.email.includes('@')) {
    return { ok: false, message: 'Email invalide.' };
  }

  if (input.password.trim().length < 6) {
    return { ok: false, message: 'Mot de passe trop court (6 caracteres minimum).' };
  }

  if (mode === 'signup' && !input.nickname.trim()) {
    return { ok: false, message: 'Pseudo obligatoire pour creer un compte.' };
  }

  return { ok: true, message: '' };
}
