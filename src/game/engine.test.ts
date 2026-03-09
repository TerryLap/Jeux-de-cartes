import { describe, expect, it } from 'vitest';
import { BattleGameState, Card, createStandardDeck, playBattleRound, startBattleGame } from './engine';

function createCard(rank: Card['rank'], suit: Card['suit']): Card {
  return {
    id: `${rank}-${suit}`,
    rank,
    suit
  };
}

function createBattleState(playerOneCards: Card[], playerTwoCards: Card[]): BattleGameState {
  return {
    players: [
      { id: 'player-1', name: 'Alice', stack: playerOneCards },
      { id: 'player-2', name: 'Bot Marcel', stack: playerTwoCards }
    ],
    round: 0,
    status: 'in_progress',
    winnerId: null,
    lastRound: null
  };
}

describe('battle engine', () => {
  it('creates a standard deck of 52 unique cards', () => {
    const deck = createStandardDeck();

    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((card) => card.id)).size).toBe(52);
  });

  it('deals a provided deck equally between the two players', () => {
    const deck = [
      createCard('A', 'spades'),
      createCard('K', 'hearts'),
      createCard('Q', 'clubs'),
      createCard('J', 'diamonds')
    ];

    const state = startBattleGame(['Alice', 'Bot Marcel'], deck);

    expect(state.players[0].stack).toEqual([deck[0], deck[2]]);
    expect(state.players[1].stack).toEqual([deck[1], deck[3]]);
    expect(state.round).toBe(0);
    expect(state.status).toBe('in_progress');
  });

  it('resolves a simple round and assigns the pot to the higher card', () => {
    const state = createBattleState([createCard('A', 'spades')], [createCard('K', 'hearts')]);

    const nextState = playBattleRound(state);

    expect(nextState.status).toBe('finished');
    expect(nextState.winnerId).toBe('player-1');
    expect(nextState.players[0].stack).toHaveLength(2);
    expect(nextState.players[1].stack).toHaveLength(0);
    expect(nextState.lastRound?.potCount).toBe(2);
    expect(nextState.lastRound?.winnerName).toBe('Alice');
    expect(nextState.lastRound?.wonCards).toHaveLength(2);
    expect(nextState.lastRound?.wonCards.map((entry) => entry.visibility)).toEqual(['face_up', 'face_up']);
  });

  it('resolves a battle after a tie and collects all exposed cards', () => {
    const state = createBattleState(
      [createCard('5', 'spades'), createCard('2', 'clubs'), createCard('A', 'hearts')],
      [createCard('5', 'hearts'), createCard('3', 'diamonds'), createCard('K', 'clubs')]
    );

    const nextState = playBattleRound(state);

    expect(nextState.status).toBe('finished');
    expect(nextState.winnerId).toBe('player-1');
    expect(nextState.players[0].stack).toHaveLength(6);
    expect(nextState.players[1].stack).toHaveLength(0);
    expect(nextState.lastRound?.battleLevel).toBe(1);
    expect(nextState.lastRound?.potCount).toBe(6);
    expect(nextState.lastRound?.summary).toContain('remporte la bataille');
    expect(nextState.lastRound?.wonCards).toHaveLength(6);
    expect(nextState.lastRound?.wonCards.map((entry) => entry.visibility)).toEqual([
      'face_up',
      'face_up',
      'face_down',
      'face_down',
      'face_up',
      'face_up'
    ]);
  });

  it('leaves a finished game unchanged', () => {
    const state = createBattleState([createCard('A', 'spades')], []);
    state.status = 'finished';
    state.winnerId = 'player-1';

    const nextState = playBattleRound(state);

    expect(nextState).toEqual(state);
  });
});
