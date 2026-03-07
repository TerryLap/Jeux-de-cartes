import { useState } from 'react';
import { AuthPage } from '../features/auth/AuthPage';
import { GamesPage } from '../features/games/GamesPage';

export function GameShell() {
  const [connectedPlayer, setConnectedPlayer] = useState('');

  if (connectedPlayer) {
    return <GamesPage playerName={connectedPlayer} onLogout={() => setConnectedPlayer('')} />;
  }

  return <AuthPage onAuthenticated={setConnectedPlayer} />;
}
