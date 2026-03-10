import { getRegisteredGames } from '../../application/game/GameRegistry';
import { GameId } from '../../domain/games/GameCatalog';

interface GamesPageProps {
  playerName: string;
  activeView: 'home' | 'games' | 'favorites';
  favoriteGameIds: GameId[];
  onToggleFavorite: (gameId: GameId) => void;
  onSelectGame: (gameId: GameId) => void;
}

function renderSectionTitle(activeView: GamesPageProps['activeView']): string {
  switch (activeView) {
    case 'favorites':
      return 'Mes jeux';
    case 'games':
      return 'Liste de jeux';
    default:
      return 'Accueil';
  }
}

function renderSectionSubtitle(activeView: GamesPageProps['activeView'], playerName: string): string {
  switch (activeView) {
    case 'favorites':
      return `Retrouve ici les jeux marques en favori par ${playerName}.`;
    case 'games':
      return 'Le catalogue complet des jeux disponibles et a venir.';
    default:
      return `Bienvenue ${playerName}. Reprends une partie ou explore ton catalogue.`;
  }
}

export function GamesPage({
  playerName,
  activeView,
  favoriteGameIds,
  onToggleFavorite,
  onSelectGame
}: GamesPageProps) {
  const games = getRegisteredGames();
  const playableGames = games.filter((game) => game.status === 'playable' && game.runtime).length;
  const favoriteGames = games.filter((game) => favoriteGameIds.includes(game.id));
  const visibleGames =
    activeView === 'favorites'
      ? favoriteGames
      : activeView === 'home'
        ? games.slice(0, 3)
        : games;

  return (
    <main className="dashboard-page">
      <section className="dashboard-card dashboard-card-full">
        <header className="dashboard-head dashboard-head-stacked">
          <div>
            <p className="eyebrow">{renderSectionTitle(activeView)}</p>
            <h1>Jeux de cartes</h1>
            <p className="dashboard-subtitle">{renderSectionSubtitle(activeView, playerName)}</p>
          </div>
        </header>

        <section className="dashboard-hero">
          <article className="dashboard-highlight">
            <strong>Session de {playerName}</strong>
            <p>Ta progression locale est conservee. Les favoris sont enregistres pour retrouver plus vite tes jeux.</p>
          </article>
          <article className="dashboard-stats">
            <div>
              <strong>{playableGames}</strong>
              <span>jeu jouable</span>
            </div>
            <div>
              <strong>{favoriteGameIds.length}</strong>
              <span>favori(s)</span>
            </div>
          </article>
        </section>

        {activeView === 'home' ? (
          <section className="dashboard-home-panels">
            <article className="dashboard-home-card">
              <p className="eyebrow">Acces rapide</p>
              <strong>Bataille</strong>
              <p>La partie jouable actuelle est disponible immediatement avec animation et reprise locale.</p>
              <button type="button" className="submit-btn game-action" onClick={() => onSelectGame('battle')}>
                Lancer la partie
              </button>
            </article>
            <article className="dashboard-home-card">
              <p className="eyebrow">Favoris</p>
              <strong>{favoriteGameIds.length ? `${favoriteGameIds.length} jeu(x) suivi(s)` : 'Aucun favori'}</strong>
              <p>
                {favoriteGameIds.length
                  ? 'Passe par le menu Mes jeux pour retrouver ta selection.'
                  : 'Ajoute des favoris depuis la liste de jeux pour construire ta selection.'}
              </p>
            </article>
          </section>
        ) : null}

        {activeView === 'favorites' && visibleGames.length === 0 ? (
          <section className="empty-state">
            <strong>Aucun jeu favori</strong>
            <p>Ajoute un jeu en favori depuis la liste pour le retrouver ici.</p>
          </section>
        ) : (
          <ul className="games-grid">
            {visibleGames.map((game) => {
              const isFavorite = favoriteGameIds.includes(game.id);

              return (
                <li key={game.id} className="game-tile">
                  <div className="game-tile-head">
                    <div>
                      <h2>{game.title}</h2>
                      <p className="game-mode">{game.playerMode}</p>
                    </div>
                    <div className="game-tile-meta">
                      <button
                        type="button"
                        className={`favorite-toggle ${isFavorite ? 'is-active' : ''}`}
                        onClick={() => onToggleFavorite(game.id)}
                        aria-pressed={isFavorite}
                        aria-label={isFavorite ? `Retirer ${game.title} des favoris` : `Ajouter ${game.title} aux favoris`}
                      >
                        {isFavorite ? '★' : '☆'}
                      </button>
                      <span className={`status-pill ${game.status}`}>{game.status === 'playable' ? 'Jouable' : 'Bientot'}</span>
                    </div>
                  </div>
                  <p>{game.description}</p>
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
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
