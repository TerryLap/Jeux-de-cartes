import { FormEvent, useState } from 'react';

type AuthMode = 'signin' | 'signup';

type Account = {
  nickname: string;
  email: string;
  password: string;
};

const STORAGE_KEY = 'jdc.accounts';

function loadAccounts(): Account[] {
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

function saveAccounts(accounts: Account[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function GameShell() {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [connectedPlayer, setConnectedPlayer] = useState('');
  const [authStatus, setAuthStatus] = useState('');

  const clearForm = () => {
    setNickname('');
    setEmail('');
    setPassword('');
  };

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      setAuthStatus('Email et mot de passe sont obligatoires.');
      return false;
    }
    if (!email.includes('@')) {
      setAuthStatus('Email invalide.');
      return false;
    }
    if (password.trim().length < 6) {
      setAuthStatus('Mot de passe trop court (6 caracteres minimum).');
      return false;
    }
    if (authMode === 'signup' && !nickname.trim()) {
      setAuthStatus('Pseudo obligatoire pour creer un compte.');
      return false;
    }
    return true;
  };

  const handleAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    const accounts = loadAccounts();
    const normalizedEmail = email.trim().toLowerCase();

    if (authMode === 'signup') {
      const alreadyExists = accounts.some((account) => account.email === normalizedEmail);
      if (alreadyExists) {
        setAuthStatus('Ce compte existe deja. Connecte-toi.');
        return;
      }

      const newAccount: Account = {
        nickname: nickname.trim(),
        email: normalizedEmail,
        password: password.trim()
      };
      saveAccounts([...accounts, newAccount]);
      setConnectedPlayer(newAccount.nickname);
      setAuthStatus(`Bienvenue ${newAccount.nickname}.`);
      clearForm();
      return;
    }

    const existing = accounts.find((account) => account.email === normalizedEmail);
    if (!existing || existing.password !== password.trim()) {
      setAuthStatus('Compte invalide: email ou mot de passe incorrect.');
      return;
    }

    setConnectedPlayer(existing.nickname);
    setAuthStatus(`Bienvenue ${existing.nickname}.`);
    clearForm();
  };

  return (
    <main className="auth-page">
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />

      <section className="auth-card">
        <h1>Jeux de cartes</h1>

        <div className="auth-switch">
          <button
            type="button"
            className={authMode === 'signin' ? 'active' : ''}
            onClick={() => setAuthMode('signin')}
          >
            Connexion
          </button>
          <button
            type="button"
            className={authMode === 'signup' ? 'active' : ''}
            onClick={() => setAuthMode('signup')}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          {authMode === 'signup' ? (
            <label htmlFor="nickname">
              Pseudo
              <input
                id="nickname"
                type="text"
                placeholder="Ton pseudo"
                autoComplete="nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
              />
            </label>
          ) : null}

          <label htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              placeholder="nom@mail.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label htmlFor="password">
            Mot de passe
            <input
              id="password"
              type="password"
              placeholder="******"
              autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button type="submit" className="submit-btn">
            {authMode === 'signin' ? 'Se connecter' : 'Creer un compte'}
          </button>
        </form>

        {connectedPlayer ? (
          <button type="button" className="ghost-btn" onClick={() => setConnectedPlayer('')}>
            Se deconnecter ({connectedPlayer})
          </button>
        ) : null}

        {authStatus ? <p className="status">{authStatus}</p> : null}
      </section>
    </main>
  );
}
