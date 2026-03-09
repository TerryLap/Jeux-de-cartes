export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export interface GameState {
  deck: Card[];
  discardPile: Card[];
}

export interface BattlePlayer {
  id: string;
  name: string;
  stack: Card[];
}

export interface BattleReveal {
  playerId: string;
  playerName: string;
  card: Card | null;
  faceDownCount: number;
  remainingCards: number;
}

export interface BattleRoundCard {
  playerId: string;
  playerName: string;
  card: Card;
  visibility: 'face_down' | 'face_up';
  battleLevel: number;
}

export interface BattleRoundResult {
  battleLevel: number;
  potCount: number;
  winnerId: string | null;
  winnerName: string | null;
  summary: string;
  reveals: BattleReveal[];
  wonCards: BattleRoundCard[];
}

export type BattleGameStatus = 'in_progress' | 'finished';

export interface BattleGameState {
  players: BattlePlayer[];
  round: number;
  status: BattleGameStatus;
  winnerId: string | null;
  lastRound: BattleRoundResult | null;
}

const BATTLE_RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14
};

export function createStandardDeck(): Card[] {
  const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  return suits.flatMap((suit) => ranks.map((rank) => ({ id: `${rank}-${suit}`, suit, rank })));
}

export function shuffleDeck(deck: Card[]): Card[] {
  const copy = [...deck];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function cloneCards(cards: Card[]): Card[] {
  return cards.map((card) => ({ ...card }));
}

function drawBattleCards(
  players: BattlePlayer[],
  count: number
): { nextPlayers: BattlePlayer[]; drawnCards: Card[][] } {
  const nextPlayers = players.map((player) => ({ ...player, stack: [...player.stack] }));
  const drawnCards = nextPlayers.map(() => [] as Card[]);

  for (let drawIndex = 0; drawIndex < count; drawIndex += 1) {
    nextPlayers.forEach((player, playerIndex) => {
      const drawnCard = player.stack.shift();
      if (drawnCard) {
        drawnCards[playerIndex].push(drawnCard);
      }
    });
  }

  return { nextPlayers, drawnCards };
}

function getActivePlayers(players: BattlePlayer[]): BattlePlayer[] {
  return players.filter((player) => player.stack.length > 0);
}

function getBattleWinner(
  revealedCards: { player: BattlePlayer; card: Card }[]
): { winnerId: string | null; winnerName: string | null; tiedPlayers: BattlePlayer[] } {
  if (revealedCards.length === 0) {
    return { winnerId: null, winnerName: null, tiedPlayers: [] };
  }

  let highestValue = -1;
  let currentLeaders: { player: BattlePlayer; card: Card }[] = [];

  revealedCards.forEach((entry) => {
    const currentValue = BATTLE_RANK_VALUES[entry.card.rank];
    if (currentValue > highestValue) {
      highestValue = currentValue;
      currentLeaders = [entry];
      return;
    }

    if (currentValue === highestValue) {
      currentLeaders.push(entry);
    }
  });

  if (currentLeaders.length === 1) {
    return {
      winnerId: currentLeaders[0].player.id,
      winnerName: currentLeaders[0].player.name,
      tiedPlayers: []
    };
  }

  return {
    winnerId: null,
    winnerName: null,
    tiedPlayers: currentLeaders.map((entry) => entry.player)
  };
}

function buildRoundSummary(round: BattleRoundResult): string {
  if (!round.winnerName) {
    return 'Egalite sans gagnant. Tous les joueurs ont epuise leurs cartes.';
  }

  if (round.battleLevel > 0) {
    return `${round.winnerName} remporte la bataille et gagne ${round.potCount} cartes.`;
  }

  return `${round.winnerName} gagne le pli et recupere ${round.potCount} cartes.`;
}

export function startBattleGame(playerNames: [string, string], deck?: Card[]): BattleGameState {
  const shuffledDeck = deck ? cloneCards(deck) : shuffleDeck(createStandardDeck());
  const players: BattlePlayer[] = playerNames.map((name, playerIndex) => ({
    id: `player-${playerIndex + 1}`,
    name,
    stack: []
  }));

  shuffledDeck.forEach((card, cardIndex) => {
    players[cardIndex % players.length].stack.push(card);
  });

  return {
    players,
    round: 0,
    status: 'in_progress',
    winnerId: null,
    lastRound: null
  };
}

export function playBattleRound(state: BattleGameState): BattleGameState {
  if (state.status === 'finished') {
    return state;
  }

  let players = state.players.map((player) => ({ ...player, stack: [...player.stack] }));
  const pot: Card[] = [];
  const wonCards: BattleRoundCard[] = [];
  const revealTracker = new Map<string, BattleReveal>();
  let battleLevel = 0;

  players.forEach((player) => {
    revealTracker.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      card: null,
      faceDownCount: 0,
      remainingCards: player.stack.length
    });
  });

  while (true) {
    const duelists = getActivePlayers(players);
    if (duelists.length <= 1) {
      break;
    }

    if (battleLevel > 0) {
      const faceDownDraw = drawBattleCards(players, 1);
      players = faceDownDraw.nextPlayers;
      faceDownDraw.drawnCards.forEach((cards, playerIndex) => {
        const hiddenCard = cards[0];
        if (!hiddenCard) {
          return;
        }

        pot.push(hiddenCard);
        const player = players[playerIndex];
        wonCards.push({
          playerId: player.id,
          playerName: player.name,
          card: hiddenCard,
          visibility: 'face_down',
          battleLevel
        });
        const trackedReveal = revealTracker.get(player.id);
        if (trackedReveal) {
          trackedReveal.faceDownCount += 1;
          trackedReveal.remainingCards = player.stack.length;
        }
      });
    }

    const faceUpDraw = drawBattleCards(players, 1);
    players = faceUpDraw.nextPlayers;

    const revealedCards = players
      .map((player, playerIndex) => {
        const revealedCard = faceUpDraw.drawnCards[playerIndex][0] ?? null;
        const trackedReveal = revealTracker.get(player.id);

        if (trackedReveal) {
          trackedReveal.card = revealedCard;
          trackedReveal.remainingCards = player.stack.length;
        }

        if (revealedCard) {
          pot.push(revealedCard);
          wonCards.push({
            playerId: player.id,
            playerName: player.name,
            card: revealedCard,
            visibility: 'face_up',
            battleLevel
          });
          return { player, card: revealedCard };
        }

        return null;
      })
      .filter((entry): entry is { player: BattlePlayer; card: Card } => entry !== null);

    const outcome = getBattleWinner(revealedCards);
    if (outcome.winnerId) {
      players = players.map((player) =>
        player.id === outcome.winnerId ? { ...player, stack: [...player.stack, ...pot] } : player
      );

      const lastRound: BattleRoundResult = {
        battleLevel,
        potCount: pot.length,
        winnerId: outcome.winnerId,
        winnerName: outcome.winnerName,
        summary: '',
        reveals: players.map((player) => {
          const trackedReveal = revealTracker.get(player.id);
          return trackedReveal ?? {
            playerId: player.id,
            playerName: player.name,
            card: null,
            faceDownCount: 0,
            remainingCards: player.stack.length
          };
        }),
        wonCards
      };

      lastRound.summary = buildRoundSummary(lastRound);
      return finalizeBattleState(state, players, lastRound);
    }

    const tiedPlayers = new Set(outcome.tiedPlayers.map((player) => player.id));
    players = players.filter((player) => tiedPlayers.has(player.id) || player.stack.length > 0);
    battleLevel += 1;
  }

  const lastStanding = getActivePlayers(players)[0] ?? null;
  const lastRound: BattleRoundResult = {
    battleLevel,
    potCount: pot.length,
    winnerId: lastStanding?.id ?? null,
    winnerName: lastStanding?.name ?? null,
    summary: '',
    reveals: players.map((player) => {
      const trackedReveal = revealTracker.get(player.id);
      return trackedReveal ?? {
        playerId: player.id,
        playerName: player.name,
        card: null,
        faceDownCount: 0,
        remainingCards: player.stack.length
      };
    }),
    wonCards
  };

  lastRound.summary = buildRoundSummary(lastRound);
  return finalizeBattleState(state, players, lastRound);
}

function finalizeBattleState(
  previousState: BattleGameState,
  players: BattlePlayer[],
  lastRound: BattleRoundResult
): BattleGameState {
  const playersStillInGame = getActivePlayers(players);
  const winner = playersStillInGame.length === 1 ? playersStillInGame[0] : null;
  const isFinished = playersStillInGame.length <= 1;

  return {
    players,
    round: previousState.round + 1,
    status: isFinished ? 'finished' : 'in_progress',
    winnerId: winner?.id ?? null,
    lastRound
  };
}
