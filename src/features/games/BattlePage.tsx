import { useEffect, useState } from 'react';
import {
  clearBattleGame,
  createBattleGame,
  playBattleTurn,
  saveBattleGame
} from '../../application/game/BattleUseCases';
import { BattleGameState, BattleRoundCard, Card } from '../../game/engine';

interface BattlePageProps {
  playerName: string;
  initialGameState: BattleGameState | null;
  onBack: () => void;
}

function renderCardLabel(card: Card): string {
  const suitLabels: Record<Card['suit'], string> = {
    clubs: 'Trefle',
    diamonds: 'Carreau',
    hearts: 'Coeur',
    spades: 'Pique'
  };

  return `${card.rank} de ${suitLabels[card.suit]}`;
}

function renderWonCardLabel(entry: BattleRoundCard): string {
  const label = renderCardLabel(entry.card);
  return entry.visibility === 'face_down' ? `${label} (cachee)` : label;
}

function resolveInitialState(playerName: string, initialGameState: BattleGameState | null): BattleGameState {
  if (!initialGameState) {
    return createBattleGame(playerName);
  }

  const player = initialGameState.players[0];
  if (!player || player.name !== playerName) {
    return createBattleGame(playerName);
  }

  return initialGameState;
}

export function BattlePage({ playerName, initialGameState, onBack }: BattlePageProps) {
  const [gameState, setGameState] = useState<BattleGameState>(() =>
    resolveInitialState(playerName, initialGameState)
  );

  useEffect(() => {
    saveBattleGame(gameState);
  }, [gameState]);

  const player = gameState.players[0];
  const opponent = gameState.players[1];
  const isFinished = gameState.status === 'finished';
  const roundSummary =
    gameState.lastRound?.summary ?? 'La pioche est melangee. Lance le premier pli pour commencer la partie.';

  const handleNextRound = () => {
    setGameState((currentState) => playBattleTurn(currentState));
  };

  const handleRestart = () => {
    const nextGame = createBattleGame(playerName);
    clearBattleGame();
    setGameState(nextGame);
  };

  return (
    <main className="battle-page">
      <section className="battle-card">
        <header className="battle-head">
          <div>
            <p className="eyebrow">Partie jouable</p>
            <h1>Bataille</h1>
            <p className="battle-subtitle">
              {player.name} contre {opponent.name}
            </p>
          </div>

          <button type="button" className="ghost-btn battle-back" onClick={onBack}>
            Retour aux jeux
          </button>
        </header>

        <section className="battle-players">
          <p className="battle-summary">{roundSummary}</p>
          <div className="battle-players-list">
            <article className="battle-player-chip">
              <span>Joueur</span>
              <strong>{player.name}</strong>
            </article>
            <article className="battle-player-chip">
              <span>Adversaire</span>
              <strong>{opponent.name}</strong>
            </article>
          </div>
        </section>

        <section className="battle-center">
          <section className="battle-round-summary">
            <p className="eyebrow">Resume du tour</p>
            <p>{roundSummary}</p>
            {gameState.lastRound ? (
              <div className="battle-round-cards">
                {(gameState.lastRound.wonCards ?? []).map((entry, index) => (
                  <article
                    key={`${entry.playerId}-${entry.card.id}-${index}`}
                    className={`battle-round-card ${entry.visibility === 'face_down' ? 'is-hidden' : ''}`}
                  >
                    <span>{entry.playerName}</span>
                    <strong>{renderWonCardLabel(entry)}</strong>
                    <small>{entry.battleLevel > 0 ? `Bataille ${entry.battleLevel}` : 'Pli initial'}</small>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <div className="section-head">
            <div>
              <p className="eyebrow">Dernier duel</p>
              <h2>Cartes visibles sur le tour</h2>
            </div>
            <span>{isFinished ? 'Partie terminee' : `Tour ${gameState.round}`}</span>
          </div>

          <div className="reveal-grid">
            {gameState.lastRound ? (
              gameState.lastRound.reveals.map((reveal) => (
                <article key={reveal.playerId} className="reveal-card">
                  <p className="player-role">{reveal.playerName}</p>
                  <span>{reveal.remainingCards} carte(s)</span>
                  <strong>{reveal.card ? renderCardLabel(reveal.card) : 'Aucune carte'}</strong>
                  {reveal.faceDownCount ? <span>{reveal.faceDownCount} carte(s) cachee(s)</span> : null}
                </article>
              ))
            ) : (
              <article className="reveal-card reveal-card-empty">
                <strong>La partie est prete.</strong>
                <span>Pioche melangee, premier duel en attente.</span>
              </article>
            )}
          </div>
        </section>

        <footer className="battle-actions">
          <button
            type="button"
            className="submit-btn"
            onClick={handleNextRound}
            disabled={gameState.status === 'finished'}
          >
            {gameState.status === 'finished' ? 'Partie terminee' : 'Jouer un tour'}
          </button>

          <button type="button" className="secondary-btn" onClick={handleRestart}>
            Nouvelle partie
          </button>
        </footer>
      </section>
    </main>
  );
}
