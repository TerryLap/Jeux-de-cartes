import { useEffect, useState } from 'react';
import { loadFavoriteGames, toggleFavoriteGame } from '../application/game/FavoriteGamesUseCases';
import { getPlayableGame } from '../application/game/GameRegistry';
import { clearSession, loadSession, saveSession } from '../application/session/SessionUseCases';
import { BattleGameState } from '../game/engine';
import { AuthPage } from '../features/auth/AuthPage';
import { BattlePage } from '../features/games/BattlePage';
import { GamesPage } from '../features/games/GamesPage';
import { GameId } from '../domain/games/GameCatalog';

type AppView = 'home' | 'games' | 'favorites';

export function GameShell() {
  const initialSession = loadSession();
  const [connectedPlayer, setConnectedPlayer] = useState(() => initialSession?.nickname ?? '');
  const [selectedGame, setSelectedGame] = useState<GameId | null>(() => initialSession?.selectedGame ?? null);
  const [activeView, setActiveView] = useState<AppView>('home');
  const [favoriteGameIds, setFavoriteGameIds] = useState<GameId[]>(() =>
    initialSession?.nickname ? loadFavoriteGames(initialSession.nickname) : []
  );

  useEffect(() => {
    if (!connectedPlayer) {
      clearSession();
      return;
    }

    saveSession({ nickname: connectedPlayer, selectedGame });
  }, [connectedPlayer, selectedGame]);

  const handleLogout = () => {
    setConnectedPlayer('');
    setSelectedGame(null);
    setActiveView('home');
    setFavoriteGameIds([]);
    clearSession();
    if (selectedGame) {
      getPlayableGame(selectedGame)?.runtime?.clearGame();
    }
  };

  const handleAuthenticated = (nickname: string) => {
    setConnectedPlayer(nickname);
    setFavoriteGameIds(loadFavoriteGames(nickname));
  };

  const handleNavigate = (view: AppView) => {
    setSelectedGame(null);
    setActiveView(view);
  };

  const handleToggleFavorite = (gameId: GameId) => {
    if (!connectedPlayer) {
      return;
    }

    setFavoriteGameIds(toggleFavoriteGame(connectedPlayer, gameId));
  };

  const handleSelectGame = (gameId: GameId) => {
    setSelectedGame(gameId);
  };

  if (connectedPlayer && selectedGame === 'battle') {
    const battleGame = getPlayableGame('battle');
    return (
      <div className="app-shell">
        <aside className="app-nav">
          <div className="app-nav-brand">
            <span className="eyebrow">Joueur connecte</span>
            <strong>{connectedPlayer}</strong>
          </div>
          <nav className="app-nav-menu" aria-label="Navigation principale">
            <button type="button" className="app-nav-item" onClick={() => handleNavigate('home')}>
              Accueil
            </button>
            <button type="button" className="app-nav-item" onClick={() => handleNavigate('games')}>
              Liste de jeux
            </button>
            <button type="button" className="app-nav-item" onClick={() => handleNavigate('favorites')}>
              Mes jeux
            </button>
            <button type="button" className="app-nav-item app-nav-item-danger" onClick={handleLogout}>
              Se deconnecter
            </button>
          </nav>
        </aside>
        <section className="app-content">
          <BattlePage
            playerName={connectedPlayer}
            initialGameState={(battleGame?.runtime?.loadGame() as BattleGameState | null) ?? null}
          />
        </section>
      </div>
    );
  }

  if (connectedPlayer) {
    return (
      <div className="app-shell">
        <aside className="app-nav">
          <div className="app-nav-brand">
            <span className="eyebrow">Joueur connecte</span>
            <strong>{connectedPlayer}</strong>
          </div>
          <nav className="app-nav-menu" aria-label="Navigation principale">
            <button
              type="button"
              className={`app-nav-item ${activeView === 'home' ? 'is-active' : ''}`}
              onClick={() => handleNavigate('home')}
            >
              Accueil
            </button>
            <button
              type="button"
              className={`app-nav-item ${activeView === 'games' ? 'is-active' : ''}`}
              onClick={() => handleNavigate('games')}
            >
              Liste de jeux
            </button>
            <button
              type="button"
              className={`app-nav-item ${activeView === 'favorites' ? 'is-active' : ''}`}
              onClick={() => handleNavigate('favorites')}
            >
              Mes jeux
            </button>
            <button type="button" className="app-nav-item app-nav-item-danger" onClick={handleLogout}>
              Se deconnecter
            </button>
          </nav>
        </aside>
        <section className="app-content">
          <GamesPage
            playerName={connectedPlayer}
            activeView={activeView}
            favoriteGameIds={favoriteGameIds}
            onToggleFavorite={handleToggleFavorite}
            onSelectGame={handleSelectGame}
          />
        </section>
      </div>
    );
  }

  return <AuthPage onAuthenticated={handleAuthenticated} />;
}
