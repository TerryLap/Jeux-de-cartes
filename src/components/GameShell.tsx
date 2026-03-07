import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { setupBattleGame } from '../game/engine';

type Game = {
  name: string;
  players: string;
  tag: string;
};

type Phase = 'lobby' | 'battleConfig' | 'dealing' | 'playing';

const GAMES: Game[] = [
  { name: 'Bataille', players: '2-4 joueurs', tag: 'Classique' },
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
  const [connectedPlayer, setConnectedPlayer] = useState('');
  const [phase, setPhase] = useState<Phase>('lobby');
  const [battlePlayers, setBattlePlayers] = useState(2);
  const [cardsPerPlayer, setCardsPerPlayer] = useState(0);
  const [leftoverCards, setLeftoverCards] = useState(0);
  const [message, setMessage] = useState('');
  const dealTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

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

  const prepareAmbientMusic = () => {
    if (audioContextRef.current || typeof window === 'undefined') {
      return;
    }

    const context = new window.AudioContext();
    const masterGain = context.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(context.destination);

    const frequencies = [196, 246.94, 329.63];
    frequencies.forEach((frequency) => {
      const oscillator = context.createOscillator();
      const nodeGain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      nodeGain.gain.value = 0.012;
      oscillator.connect(nodeGain);
      nodeGain.connect(masterGain);
      oscillator.start();
    });

    audioContextRef.current = context;
    masterGainRef.current = masterGain;
  };

  const setAmbientLevel = (level: number) => {
    const context = audioContextRef.current;
    const gain = masterGainRef.current;
    if (!context || !gain) {
      return;
    }
    gain.gain.setTargetAtTime(level, context.currentTime, 0.4);
  };

  const stopAmbientMusic = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    masterGainRef.current = null;
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!nickname.trim() || !email.trim() || !password.trim()) {
      setMessage('Complète les 3 champs pour te connecter.');
      return;
    }

    const player = nickname.trim();
    setConnectedPlayer(player);
    setMessage(`Bienvenue ${player} ! Sélectionne "Bataille" pour lancer une partie.`);
    if (rememberMe) {
      localStorage.setItem('playerNickname', player);
    }
  };

  const handleSelectBattle = () => {
    if (!isConnected) {
      setMessage('Connecte-toi d abord pour lancer une partie.');
      return;
    }
    setPhase('battleConfig');
    setMessage('');
  };

  const handleLaunchBattle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const setup = setupBattleGame(battlePlayers);
    setCardsPerPlayer(setup.players[0].length);
    setLeftoverCards(setup.drawPile.length);
    prepareAmbientMusic();
    setPhase('dealing');
    setMessage('Distribution des cartes en cours...');

    if (dealTimerRef.current) {
      window.clearTimeout(dealTimerRef.current);
    }

    dealTimerRef.current = window.setTimeout(() => {
      setPhase('playing');
      setMessage('');
    }, 2800);
  };

  const handleBackToLobby = () => {
    setPhase('lobby');
    setCardsPerPlayer(0);
    setLeftoverCards(0);
    stopAmbientMusic();
    setMessage('');
  };

  useEffect(() => {
    if (phase === 'playing') {
      setAmbientLevel(0.03);
      return;
    }

    if (phase === 'dealing') {
      setAmbientLevel(0.005);
      return;
    }

    setAmbientLevel(0);
  }, [phase]);

  useEffect(() => {
    return () => {
      if (dealTimerRef.current) {
        window.clearTimeout(dealTimerRef.current);
      }
      stopAmbientMusic();
    };
  }, []);

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
                {game.name === 'Bataille' ? (
                  <button type="button" className="play-button" onClick={handleSelectBattle}>
                    Jouer
                  </button>
                ) : (
                  <button type="button" className="play-button disabled" disabled>
                    Bientot
                  </button>
                )}
              </li>
            ))}
          </ul>
        </article>

        <article className="panel login-panel">
          {phase === 'lobby' ? (
            <>
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
            </>
          ) : null}

          {phase === 'battleConfig' ? (
            <section className="battle-panel">
              <h2>Parametres - Bataille</h2>
              <p className="login-subtitle">Joueur connecte: {connectedPlayer}</p>

              <form className="login-form" onSubmit={handleLaunchBattle}>
                <label htmlFor="battle-players">
                  Nombre de joueurs (max 4)
                  <select
                    id="battle-players"
                    value={battlePlayers}
                    onChange={(event) => setBattlePlayers(Number(event.target.value))}
                  >
                    <option value={2}>2 joueurs</option>
                    <option value={3}>3 joueurs</option>
                    <option value={4}>4 joueurs</option>
                  </select>
                </label>
                <button type="submit">Lancer la partie</button>
              </form>
            </section>
          ) : null}

          {phase === 'dealing' ? (
            <section className="battle-panel">
              <h2>Bataille</h2>
              <p className="login-subtitle">Distribution en cours pour {battlePlayers} joueurs</p>
              <div className="deal-zone" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span
                    key={`deal-card-${index}`}
                    className="deal-card"
                    style={{ animationDelay: `${index * 0.13}s` }}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {phase === 'playing' ? (
            <section className="battle-panel">
              <h2>Partie lancee - Bataille</h2>
              <p className="login-subtitle">Bonne partie {connectedPlayer}, musique active.</p>

              <ul className="players-list">
                {Array.from({ length: battlePlayers }).map((_, index) => (
                  <li key={`player-${index + 1}`} className="player-item">
                    Joueur {index + 1}
                    <span>{cardsPerPlayer} cartes</span>
                  </li>
                ))}
              </ul>

              {leftoverCards > 0 ? (
                <p className="reserve-note">{leftoverCards} carte(s) restent en pioche reserve.</p>
              ) : null}

              <button type="button" onClick={handleBackToLobby}>
                Retour accueil
              </button>
            </section>
          ) : null}

          {message ? <p className="status">{message}</p> : null}
        </article>
      </section>
    </main>
  );
}
