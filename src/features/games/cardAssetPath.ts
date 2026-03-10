import { Card } from '../../game/engine';

function toAssetRank(rank: Card['rank']): string {
  return rank;
}

function toAssetSuit(suit: Card['suit']): 'c' | 'd' | 'h' | 's' {
  switch (suit) {
    case 'clubs':
      return 'c';
    case 'diamonds':
      return 'd';
    case 'hearts':
      return 'h';
    case 'spades':
      return 's';
  }
}

export function getCardAssetPath(card: Card): string {
  return `/cards/${toAssetRank(card.rank)}${toAssetSuit(card.suit)}.png`;
}
