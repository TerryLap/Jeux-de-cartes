import { getRegisteredGames } from '../../application/game/GameRegistry';
import { GameId } from '../../domain/games/GameCatalog';

interface GamesPageProps {
  playerName: string;
  onLogout: () => void;
  onSelectGame: (gameId: GameId) => void;
}

export function GamesPage({ playerName, onLogout, onSelectGame }: GamesPageProps) {
  const games = getRegisteredGames();
  const playableGames = games.filter((game) => game.status === 'playable' && game.runtime).length;

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <header className="dashboard-head">
          <div>
            <p className="eyebrow">Accueil joueur</p>
            <h1>Jeux disponibles</h1>
            <p className="dashboard-subtitle">Connecte en tant que {playerName}</p>
          </div>
          <button type="button" className="ghost-btn dashboard-logout" onClick={onLogout}>
            Se deconnecter
          </button>
        </header>

        <section className="dashboard-hero">
          <article className="dashboard-highlight">
            <strong>Session prete</strong>
            <p>Bataille est disponible tout de suite en local contre une IA simple.</p>
          </article>
          <article className="dashboard-stats">
            <div>
              <strong>{playableGames}</strong>
              <span>jeu jouable</span>
            </div>
            <div>
              <strong>{games.length - playableGames}</strong>
              <span>jeu(x) en preparation</span>
            </div>
          </article>
        </section>

        <ul className="games-grid">
          {games.map((game) => (
            <li key={game.id} className="game-tile">
              <div className="game-tile-head">
                <h2>{game.title}</h2>
                <span className={`status-pill ${game.status}`}>{game.status === 'playable' ? 'Jouable' : 'Bientot'}</span>
              </div>
              <p>{game.description}</p>
              <p className="game-mode">{game.playerMode}</p>
              {game.status === 'playable' && game.runtime ? (
                <button type="button" className="submit-btn game-action" onClick={() => onSelectGame(game.id)}>
                  Lancer la partie
                </button>
              ) : (
                <button type="button" className="secondary-btn game-action" disabled>
                  Disponible plus tard
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
