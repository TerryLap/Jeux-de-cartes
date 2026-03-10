import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import {
  clearBattleGame,
  createBattleGame,
  playBattleTurn,
  saveBattleGame
} from '../../application/game/BattleUseCases';
import { BattleGameState, BattleRoundCard, BattleRoundResult, Card } from '../../game/engine';
import { PlayingCard } from './PlayingCard';

interface BattlePageProps {
  playerName: string;
  initialGameState: BattleGameState | null;
}

type BattleSeat = 'south' | 'north' | 'north-west' | 'north-east' | 'west' | 'east';
type WinnerSide = 'player' | 'opponent' | null;
type RoundAnimationPhase = 'idle' | 'revealing' | 'revealing-hidden' | 'flipping-for-collect' | 'moving-to-winner';

interface AnimatedBattleLevel {
  battleLevel: number;
  playerFaceUp: BattleRoundCard | null;
  opponentFaceUp: BattleRoundCard | null;
  playerFaceDown: BattleRoundCard | null;
  opponentFaceDown: BattleRoundCard | null;
}

interface RoundAnimationState {
  levels: AnimatedBattleLevel[];
  visibleFaceUpLevels: number;
  visibleFaceDownLevels: number;
  revealHiddenCards: boolean;
  phase: RoundAnimationPhase;
  active: boolean;
  winnerSide: WinnerSide;
}

interface DisplayedStackCounts {
  player: number;
  opponent: number;
}

const COMPARE_DURATION_MS = 1500;
const BATTLE_STEP_DELAY_MS = 680;
const HIDDEN_TO_REVEAL_DELAY_MS = 360;
const HIDDEN_REVEAL_HOLD_MS = 620;
const PRE_COLLECT_FLIP_DURATION_MS = 320;
const COLLECT_DURATION_MS = 920;

const EMPTY_ANIMATION_STATE: RoundAnimationState = {
  levels: [],
  visibleFaceUpLevels: 0,
  visibleFaceDownLevels: 0,
  revealHiddenCards: false,
  phase: 'idle',
  active: false,
  winnerSide: null
};

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

function renderPlayedCards(entries: BattleRoundCard[] | undefined, playerId: string): string {
  const labels = (entries ?? [])
    .filter((entry) => entry.playerId === playerId)
    .map((entry) => renderWonCardLabel(entry));

  return labels.length ? labels.join(', ') : 'Aucune carte jouee';
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

function getBattleSeat(playerIndex: number, playerCount: number): BattleSeat {
  if (playerIndex === 0) {
    return 'south';
  }

  if (playerCount === 2) {
    return 'north';
  }

  if (playerCount === 3) {
    return playerIndex === 1 ? 'north-west' : 'north-east';
  }

  if (playerCount === 4) {
    if (playerIndex === 1) {
      return 'west';
    }

    if (playerIndex === 2) {
      return 'north';
    }

    return 'east';
  }

  return 'north';
}

function buildAnimatedLevels(round: BattleRoundResult | null, playerId: string, opponentId: string): AnimatedBattleLevel[] {
  if (!round) {
    return [];
  }

  const levels = new Map<number, AnimatedBattleLevel>();

  round.wonCards.forEach((entry) => {
    const currentLevel =
      levels.get(entry.battleLevel) ??
      {
        battleLevel: entry.battleLevel,
        playerFaceUp: null,
        opponentFaceUp: null,
        playerFaceDown: null,
        opponentFaceDown: null
      };

    const isPlayer = entry.playerId === playerId;
    const isOpponent = entry.playerId === opponentId;

    if (entry.visibility === 'face_up') {
      if (isPlayer) {
        currentLevel.playerFaceUp = entry;
      }

      if (isOpponent) {
        currentLevel.opponentFaceUp = entry;
      }
    } else {
      if (isPlayer) {
        currentLevel.playerFaceDown = entry;
      }

      if (isOpponent) {
        currentLevel.opponentFaceDown = entry;
      }
    }

    levels.set(entry.battleLevel, currentLevel);
  });

  return [...levels.values()].sort((left, right) => left.battleLevel - right.battleLevel);
}

function getBoardCardStyle(
  owner: 'player' | 'opponent',
  slot: 'face-up' | 'face-down',
  levelIndex: number
): CSSProperties {
  const step = 118;
  const hiddenOffset = 58;
  const targetX = levelIndex * step - (slot === 'face-down' ? hiddenOffset : 0);
  const targetY = owner === 'player' ? 36 : -162;
  const sourceX = owner === 'player' ? -190 : 190;
  const sourceY = owner === 'player' ? 214 : -292;

  return {
    ['--battle-level-index' as string]: levelIndex,
    ['--card-target-x' as string]: `${targetX}px`,
    ['--card-target-y' as string]: `${targetY}px`,
    ['--card-source-x' as string]: `${sourceX}px`,
    ['--card-source-y' as string]: `${sourceY}px`
  };
}

function createAnimationState(levels: AnimatedBattleLevel[], winnerSide: WinnerSide): RoundAnimationState {
  if (!levels.length) {
    return EMPTY_ANIMATION_STATE;
  }

  return {
    levels,
    visibleFaceUpLevels: 1,
    visibleFaceDownLevels: 0,
    revealHiddenCards: false,
    phase: 'revealing',
    active: true,
    winnerSide
  };
}

export function BattlePage({ playerName, initialGameState }: BattlePageProps) {
  const [gameState, setGameState] = useState<BattleGameState>(() => resolveInitialState(playerName, initialGameState));
  const [animationState, setAnimationState] = useState<RoundAnimationState>(EMPTY_ANIMATION_STATE);
  const [displayedStackCounts, setDisplayedStackCounts] = useState<DisplayedStackCounts>(() => {
    const resolvedState = resolveInitialState(playerName, initialGameState);
    return {
      player: resolvedState.players[0]?.stack.length ?? 0,
      opponent: resolvedState.players[1]?.stack.length ?? 0
    };
  });
  const timersRef = useRef<number[]>([]);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    saveBattleGame(gameState);
  }, [gameState]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current = [];
    },
    []
  );

  useEffect(() => {
    flipAudioRef.current = new Audio('/sounds/card-flip.mp3');
    flipAudioRef.current.preload = 'auto';

    return () => {
      flipAudioRef.current = null;
    };
  }, []);

  const player = gameState.players[0];
  const opponent = gameState.players[1];
  const playerSeat = getBattleSeat(0, gameState.players.length);
  const opponentSeat = getBattleSeat(1, gameState.players.length);
  const isFinished = gameState.status === 'finished';
  const roundCards = gameState.lastRound?.wonCards ?? [];
  const winnerSide: WinnerSide =
    gameState.lastRound?.winnerId === player.id
      ? 'player'
      : gameState.lastRound?.winnerId === opponent.id
        ? 'opponent'
        : null;
  const duelTableClassName = [
    'battle-duel-table',
    gameState.lastRound?.battleLevel ? 'is-war' : '',
    winnerSide ? `winner-${winnerSide}` : '',
    isFinished ? 'is-finished' : ''
  ]
    .filter(Boolean)
    .join(' ');
  const isAnimating = animationState.active;
  const animatedLevels = animationState.levels;

  const boardCards = useMemo(() => {
    return animatedLevels.flatMap((level, levelIndex) => {
      const cards: Array<{
        key: string;
        entry: BattleRoundCard;
        owner: 'player' | 'opponent';
        slot: 'face-up' | 'face-down';
        concealed: boolean;
        levelIndex: number;
      }> = [];

      const hiddenShouldBeVisible = animationState.revealHiddenCards;

      if (level.playerFaceDown && levelIndex < animationState.visibleFaceDownLevels) {
        cards.push({
          key: `${level.playerFaceDown.card.id}-player-hidden-${levelIndex}`,
          entry: level.playerFaceDown,
          owner: 'player',
          slot: 'face-down',
          concealed: !hiddenShouldBeVisible,
          levelIndex
        });
      }

      if (level.playerFaceUp && levelIndex < animationState.visibleFaceUpLevels) {
        cards.push({
          key: `${level.playerFaceUp.card.id}-player-up-${levelIndex}`,
          entry: level.playerFaceUp,
          owner: 'player',
          slot: 'face-up',
          concealed: false,
          levelIndex
        });
      }

      if (level.opponentFaceDown && levelIndex < animationState.visibleFaceDownLevels) {
        cards.push({
          key: `${level.opponentFaceDown.card.id}-opponent-hidden-${levelIndex}`,
          entry: level.opponentFaceDown,
          owner: 'opponent',
          slot: 'face-down',
          concealed: !hiddenShouldBeVisible,
          levelIndex
        });
      }

      if (level.opponentFaceUp && levelIndex < animationState.visibleFaceUpLevels) {
        cards.push({
          key: `${level.opponentFaceUp.card.id}-opponent-up-${levelIndex}`,
          entry: level.opponentFaceUp,
          owner: 'opponent',
          slot: 'face-up',
          concealed: false,
          levelIndex
        });
      }

      return cards;
    });
  }, [animatedLevels, animationState.revealHiddenCards, animationState.visibleFaceDownLevels, animationState.visibleFaceUpLevels]);

  function clearAnimationTimers() {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }

  function playFlipSound() {
    if (!flipAudioRef.current) {
      return;
    }
    const audio = flipAudioRef.current.cloneNode(true) as HTMLAudioElement;
    audio.volume = 0.45;
    void audio.play().catch(() => {});
  }

  function queueAnimationStep(delay: number, callback: () => void) {
    const timerId = window.setTimeout(callback, delay);
    timersRef.current.push(timerId);
  }

  function startRoundAnimation(round: BattleRoundResult | null, nextCounts: DisplayedStackCounts) {
    clearAnimationTimers();

    const levels = buildAnimatedLevels(round, player.id, opponent.id);
    const nextWinnerSide: WinnerSide =
      round?.winnerId === player.id ? 'player' : round?.winnerId === opponent.id ? 'opponent' : null;

    if (!levels.length) {
      setAnimationState(EMPTY_ANIMATION_STATE);
      setDisplayedStackCounts(nextCounts);
      return;
    }

    setAnimationState(createAnimationState(levels, nextWinnerSide));
    playFlipSound();

    let elapsed = 0;

    for (let levelIndex = 1; levelIndex < levels.length; levelIndex += 1) {
      elapsed += BATTLE_STEP_DELAY_MS;
      queueAnimationStep(elapsed, () => {
        setAnimationState((currentState) => ({
          ...currentState,
          visibleFaceDownLevels: Math.max(currentState.visibleFaceDownLevels, levelIndex + 1)
        }));
      });

      elapsed += HIDDEN_TO_REVEAL_DELAY_MS;
      queueAnimationStep(elapsed, () => {
        setAnimationState((currentState) => ({
          ...currentState,
          visibleFaceUpLevels: Math.max(currentState.visibleFaceUpLevels, levelIndex + 1)
        }));
        playFlipSound();
      });
    }

    if (levels.length > 1) {
      elapsed += BATTLE_STEP_DELAY_MS;
      queueAnimationStep(elapsed, () => {
        setAnimationState((currentState) => ({
          ...currentState,
          revealHiddenCards: true,
          phase: 'revealing-hidden'
        }));
        playFlipSound();
      });

      elapsed += HIDDEN_REVEAL_HOLD_MS;
    } else {
      elapsed += COMPARE_DURATION_MS;
    }

    queueAnimationStep(elapsed, () => {
      setAnimationState((currentState) => ({
        ...currentState,
        phase: 'flipping-for-collect'
      }));
    });

    queueAnimationStep(elapsed + PRE_COLLECT_FLIP_DURATION_MS, () => {
      setAnimationState((currentState) => ({
        ...currentState,
        phase: 'moving-to-winner'
      }));
    });

    queueAnimationStep(elapsed + PRE_COLLECT_FLIP_DURATION_MS + COLLECT_DURATION_MS, () => {
      setAnimationState(EMPTY_ANIMATION_STATE);
      setDisplayedStackCounts(nextCounts);
    });
  }

  const handleNextRound = () => {
    if (isAnimating) {
      return;
    }

    const nextState = playBattleTurn(gameState);
    setDisplayedStackCounts({
      player: gameState.players[0]?.stack.length ?? 0,
      opponent: gameState.players[1]?.stack.length ?? 0
    });
    setGameState(nextState);
    startRoundAnimation(nextState.lastRound, {
      player: nextState.players[0]?.stack.length ?? 0,
      opponent: nextState.players[1]?.stack.length ?? 0
    });
  };

  const handleRestart = () => {
    clearAnimationTimers();
    const nextGame = createBattleGame(playerName);
    clearBattleGame();
    setAnimationState(EMPTY_ANIMATION_STATE);
    setDisplayedStackCounts({
      player: nextGame.players[0]?.stack.length ?? 0,
      opponent: nextGame.players[1]?.stack.length ?? 0
    });
    setGameState(nextGame);
  };

  return (
    <main className="battle-page">
      <section className="battle-card">
        <header className="battle-head">
          <div className="battle-head-spacer" />
          <div className="battle-head-title">
            <h1>Bataille</h1>
          </div>
          <div className="battle-head-actions" />
        </header>

        <section className={duelTableClassName} aria-label="Table de duel">
          <div className="battle-round-summary">
            <button
              type="button"
              className="battle-round-summary-trigger"
              aria-label="Afficher le detail textuel du tour"
            >
              i
            </button>
            <div className="battle-round-summary-panel" role="tooltip">
              <p>{player.name}</p>
              <p>{renderPlayedCards(roundCards, player.id)}</p>
              <p>{opponent.name}</p>
              <p>{renderPlayedCards(roundCards, opponent.id)}</p>
            </div>
          </div>

          <div className="battle-table-ambient battle-table-ambient-left" aria-hidden="true" />
          <div className="battle-table-ambient battle-table-ambient-right" aria-hidden="true" />
          <div className="battle-table-center-glow" aria-hidden="true" />

          <article className={`battle-player-panel battle-player-panel-${playerSeat}`}>
            <strong>{player.name}</strong>
            <div className="battle-player-stack">
              <button
                type="button"
                className={`battle-deck-stack battle-deck-stack-button ${
                  winnerSide === 'player' && animationState.phase === 'moving-to-winner' ? 'is-collecting' : ''
                }`}
                onClick={handleNextRound}
                disabled={gameState.status === 'finished' || isAnimating}
                aria-label={
                  gameState.status === 'finished'
                    ? 'Partie terminee'
                    : isAnimating
                      ? 'Tour en cours'
                      : 'Jouer un tour'
                }
              >
                <div className="battle-deck-card battle-deck-card-back" />
                <div className="battle-deck-card battle-deck-card-back" />
                <div className="battle-deck-card battle-deck-card-back" />
              </button>
              <p>{displayedStackCounts.player} cartes</p>
            </div>
          </article>

          <section className="battle-arena">
            {boardCards.map((item) => {
              const wrapperClassName = [
                'battle-sequence-card',
                `battle-sequence-card-${item.owner}`,
                `battle-sequence-card-${item.slot}`,
                animationState.phase === 'revealing' || animationState.phase === 'revealing-hidden' ? 'is-dealing' : '',
                animationState.phase === 'flipping-for-collect' ? 'is-flipping-for-collect' : '',
                animationState.phase === 'moving-to-winner' ? 'is-moving-to-winner' : '',
                animationState.phase === 'moving-to-winner' && winnerSide ? `to-${winnerSide}` : ''
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div
                  key={`${gameState.round}-${item.key}`}
                  className={wrapperClassName}
                  style={getBoardCardStyle(item.owner, item.slot, item.levelIndex)}
                >
                  <PlayingCard
                    card={item.entry.card}
                    alt={renderWonCardLabel(item.entry)}
                    concealed={item.concealed}
                    className="battle-sequence-playing-card"
                  />
                </div>
              );
            })}

            <div className="battle-duel-vs" aria-hidden="true">
              VS
            </div>
          </section>

          <article className={`battle-player-panel battle-player-panel-${opponentSeat}`}>
            <strong>{opponent.name}</strong>
            <div className="battle-player-stack">
              <div
                className={`battle-deck-stack ${
                  winnerSide === 'opponent' && animationState.phase === 'moving-to-winner' ? 'is-collecting' : ''
                }`}
                aria-hidden="true"
              >
                <div className="battle-deck-card battle-deck-card-back" />
                <div className="battle-deck-card battle-deck-card-back" />
                <div className="battle-deck-card battle-deck-card-back" />
              </div>
              <p>{displayedStackCounts.opponent} cartes</p>
            </div>
          </article>
        </section>

        <footer className="battle-actions">
          <div className="battle-footer-actions">
            <button type="button" className="secondary-btn" onClick={handleRestart}>
              Nouvelle partie
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
