import { GameRuntime } from '../../domain/games/GameRuntime';
import { BattleGameState } from '../../game/engine';
import {
  clearBattleGame,
  createBattleGame,
  loadSavedBattleGame,
  playBattleTurn,
  saveBattleGame
} from './BattleUseCases';

export type BattleAction =
  | { type: 'play_next_round'; label: 'Jouer un tour' }
  | { type: 'restart'; label: 'Nouvelle partie' };

export const battleRuntime: GameRuntime<BattleGameState, BattleAction> = {
  id: 'battle',
  startGame: (playerName) => createBattleGame(playerName),
  loadGame: () => loadSavedBattleGame(),
  saveGame: (state) => saveBattleGame(state),
  clearGame: () => clearBattleGame(),
  getAvailableActions: (state) => {
    if (state.status === 'finished') {
      return [{ type: 'restart', label: 'Nouvelle partie' }];
    }

    return [
      { type: 'play_next_round', label: 'Jouer un tour' },
      { type: 'restart', label: 'Nouvelle partie' }
    ];
  },
  applyAction: (state, action) => {
    if (action.type === 'restart') {
      return createBattleGame(state.players[0]?.name ?? 'Invite');
    }

    return playBattleTurn(state);
  },
  getViewModel: (state) => ({
    title: 'Bataille',
    summary: state.lastRound?.summary ?? 'La pioche est melangee. Lance le premier pli pour commencer la partie.',
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name
    }))
  })
};
