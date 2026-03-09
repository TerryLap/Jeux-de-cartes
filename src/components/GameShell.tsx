import { useEffect, useState } from 'react';
import { getPlayableGame } from '../application/game/GameRegistry';
import { clearSession, loadSession, saveSession } from '../application/session/SessionUseCases';
import { BattleGameState } from '../game/engine';
import { AuthPage } from '../features/auth/AuthPage';
import { BattlePage } from '../features/games/BattlePage';
import { GamesPage } from '../features/games/GamesPage';
import { GameId } from '../domain/games/GameCatalog';

export function GameShell() {
  const [connectedPlayer, setConnectedPlayer] = useState(() => loadSession()?.nickname ?? '');
  const [selectedGame, setSelectedGame] = useState<GameId | null>(() => loadSession()?.selectedGame ?? null);

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
    clearSession();
    if (selectedGame) {
      getPlayableGame(selectedGame)?.runtime?.clearGame();
    }
  };

  if (connectedPlayer && selectedGame === 'battle') {
    const battleGame = getPlayableGame('battle');
    return (
      <BattlePage
        playerName={connectedPlayer}
        initialGameState={(battleGame?.runtime?.loadGame() as BattleGameState | null) ?? null}
        onBack={() => setSelectedGame(null)}
      />
    );
  }

  if (connectedPlayer) {
    return (
      <GamesPage
        playerName={connectedPlayer}
        onLogout={handleLogout}
        onSelectGame={setSelectedGame}
      />
    );
  }

  return <AuthPage onAuthenticated={setConnectedPlayer} />;
}
