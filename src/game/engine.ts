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

export interface BattleSetup {
  players: Card[][];
  drawPile: Card[];
}

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

export function setupBattleGame(playerCount: number): BattleSetup {
  if (playerCount < 2 || playerCount > 4) {
    throw new Error('La bataille supporte entre 2 et 4 joueurs.');
  }

  const shuffledDeck = shuffleDeck(createStandardDeck());
  const cardsPerPlayer = Math.floor(shuffledDeck.length / playerCount);
  const players = Array.from({ length: playerCount }, () => [] as Card[]);
  const dealtCards = cardsPerPlayer * playerCount;

  for (let cardIndex = 0; cardIndex < dealtCards; cardIndex += 1) {
    const playerIndex = cardIndex % playerCount;
    players[playerIndex].push(shuffledDeck[cardIndex]);
  }

  return {
    players,
    drawPile: shuffledDeck.slice(dealtCards)
  };
}
