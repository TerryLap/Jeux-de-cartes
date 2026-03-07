import { FormEvent, useMemo, useState } from 'react';

type Game = {
  name: string;
  players: string;
  tag: string;
};

type AuthMode = 'signin' | 'signup';

type Account = {
  nickname: string;
  email: string;
  password: string;
};

const STORAGE_KEY = 'jdc.accounts';

const GAMES: Game[] = [
  { name: 'Bataille', players: '2-4 joueurs', tag: 'Classique' },
  { name: 'Crapette', players: '2 joueurs', tag: 'Duel' },
  { name: 'Tarot', players: '3-5 joueurs', tag: 'Strategie' },
  { name: 'Belote', players: '4 joueurs', tag: 'Equipe' },
  { name: 'President', players: '4-7 joueurs', tag: 'Ambiance' },
  { name: 'Rami', players: '2-6 joueurs', tag: 'Combinaisons' },
  { name: 'Blackjack', players: '1+ joueurs', tag: 'Casino' },
  { name: 'Poker ferme', players: '2-8 joueurs', tag: 'Bluff' },
  { name: 'Speed', players: '2 joueurs', tag: 'Rapide' },
  { name: 'Whist', players: '4 joueurs', tag: 'Plis' }
];

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
  const [query, setQuery] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [connectedPlayer, setConnectedPlayer] = useState('');
  const [authStatus, setAuthStatus] = useState('');

  const displayedGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return GAMES;
    }
    return GAMES.filter((game) =>
      `${game.name} ${game.tag} ${game.players}`.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  const isConnected = connectedPlayer.length > 0;

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
      setAuthStatus(`Compte cree et valide. Bienvenue ${newAccount.nickname}.`);
      clearForm();
      return;
    }

    const existing = accounts.find((account) => account.email === normalizedEmail);
    if (!existing || existing.password !== password.trim()) {
      setAuthStatus('Compte invalide: email ou mot de passe incorrect.');
      return;
    }

    setConnectedPlayer(existing.nickname);
    setAuthStatus(`Connexion validee. Bienvenue ${existing.nickname}.`);
    clearForm();
  };

  return (
    <main className="app-shell">
      <div className="floating-cards" aria-hidden="true">
        <span className="card-shape shape-1" />
        <span className="card-shape shape-2" />
        <span className="card-shape shape-3" />
      </div>

      <header className="hero">
        <p className="eyebrow">Phase 1 - Authentification</p>
        <h1>Jeux de cartes</h1>
        <p className="subtitle">
          Avant toute partie, le joueur doit disposer d un compte valide et etre connecte.
        </p>
      </header>

      <section className="layout-grid">
        <article className="panel games-panel">
          <div className="panel-head">
            <h2>Catalogue des jeux</h2>
            <span className="counter">{displayedGames.length} jeux</span>
          </div>

          <label className="search-wrap" htmlFor="game-search">
            <span>Recherche</span>
            <input
              id="game-search"
              type="search"
              placeholder="Ex: bataille, tarot..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <ul className="game-list">
            {displayedGames.map((game) => (
              <li key={game.name} className="game-item">
                <h3>{game.name}</h3>
                <p>{game.players}</p>
                <small>{game.tag}</small>
                <button
                  type="button"
                  className={`play-button ${isConnected ? '' : 'disabled'}`}
                  disabled={!isConnected}
                >
                  {isConnected ? 'Pret pour phase suivante' : 'Connexion requise'}
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel login-panel">
          <h2>{isConnected ? 'Session active' : 'Connexion joueur'}</h2>
          <p className="login-subtitle">
            {isConnected
              ? `Compte valide connecte: ${connectedPlayer}`
              : 'Inscris-toi ou connecte-toi pour valider la premiere phase.'}
          </p>

          {!isConnected ? (
            <>
              <div className="auth-switch">
                <button
                  type="button"
                  className={authMode === 'signin' ? 'active' : ''}
                  onClick={() => setAuthMode('signin')}
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  className={authMode === 'signup' ? 'active' : ''}
                  onClick={() => setAuthMode('signup')}
                >
                  S inscrire
                </button>
              </div>

              <form onSubmit={handleAuth} className="login-form">
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

                <button type="submit">
                  {authMode === 'signin' ? 'Valider la connexion' : 'Creer et valider le compte'}
                </button>
              </form>
            </>
          ) : (
            <button type="button" onClick={() => setConnectedPlayer('')}>
              Se deconnecter
            </button>
          )}

          {authStatus ? <p className="status">{authStatus}</p> : null}
        </article>
      </section>
    </main>
  );
}
