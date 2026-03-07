import { FormEvent, useMemo, useState } from 'react';

type Game = {
  name: string;
  players: string;
  tag: string;
};

const GAMES: Game[] = [
  { name: 'Bataille', players: '2-6 joueurs', tag: 'Classique' },
  { name: 'Crapette', players: '2 joueurs', tag: 'Duel' },
  { name: 'Tarot', players: '3-5 joueurs', tag: 'Stratégie' },
  { name: 'Belote', players: '4 joueurs', tag: 'Équipe' },
  { name: 'Président', players: '4-7 joueurs', tag: 'Ambiance' },
  { name: 'Rami', players: '2-6 joueurs', tag: 'Combinaisons' },
  { name: 'Blackjack', players: '1+ joueurs', tag: 'Casino' },
  { name: 'Poker fermé', players: '2-8 joueurs', tag: 'Bluff' },
  { name: 'Speed', players: '2 joueurs', tag: 'Rapide' },
  { name: 'Whist', players: '4 joueurs', tag: 'Plis' }
];

export function GameShell() {
  const [query, setQuery] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState('');

  const displayedGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return GAMES;
    }

    return GAMES.filter((game) =>
      `${game.name} ${game.tag} ${game.players}`.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!nickname.trim() || !email.trim() || !password.trim()) {
      setMessage('Complète les 3 champs pour te connecter.');
      return;
    }

    setMessage(`Bienvenue ${nickname.trim()} ! Le lobby joueur sera activé ensuite.`);
    if (rememberMe) {
      localStorage.setItem('playerNickname', nickname.trim());
    }
  };

  return (
    <main className="app-shell">
      <div className="floating-cards" aria-hidden="true">
        <span className="card-shape shape-1" />
        <span className="card-shape shape-2" />
        <span className="card-shape shape-3" />
      </div>

      <header className="hero">
        <p className="eyebrow">Plateforme multi-jeux</p>
        <h1>Jeux de cartes</h1>
        <p className="subtitle">
          Choisis ton mode de jeu et connecte-toi pour préparer tes futures parties sur navigateur
          et mobile.
        </p>
      </header>

      <section className="layout-grid">
        <article className="panel games-panel">
          <div className="panel-head">
            <h2>Jeux disponibles</h2>
            <span className="counter">{displayedGames.length} jeux</span>
          </div>

          <label className="search-wrap" htmlFor="game-search">
            <span>Recherche</span>
            <input
              id="game-search"
              type="search"
              placeholder="Ex: tarot, belote, rapide..."
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
              </li>
            ))}
          </ul>
        </article>

        <article className="panel login-panel">
          <h2>Connexion joueur</h2>
          <p className="login-subtitle">
            Identification locale pour préparer le profil et l&apos;accès aux futurs lobbies.
          </p>

          <form onSubmit={handleLogin} className="login-form">
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
                placeholder="********"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <label className="remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Se souvenir de moi
            </label>

            <button type="submit">Se connecter</button>
          </form>

          {message ? <p className="status">{message}</p> : null}
        </article>
      </section>
    </main>
  );
}
