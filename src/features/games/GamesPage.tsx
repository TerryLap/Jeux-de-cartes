import { UPCOMING_GAMES } from '../../domain/games/GameCatalog';

interface GamesPageProps {
  playerName: string;
  onLogout: () => void;
}

export function GamesPage({ playerName, onLogout }: GamesPageProps) {
  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <header className="dashboard-head">
          <h1>Jeux disponibles</h1>
          <button type="button" className="ghost-btn" onClick={onLogout}>
            Se deconnecter
          </button>
        </header>

        <p className="dashboard-subtitle">Connecte en tant que {playerName}</p>

        <ul className="games-grid">
          {UPCOMING_GAMES.map((game) => (
            <li key={game} className="game-tile">
              <h2>{game}</h2>
              <p>Liste detaillee a definir prochainement.</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
