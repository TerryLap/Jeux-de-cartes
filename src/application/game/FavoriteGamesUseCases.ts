import { GameId } from '../../domain/games/GameCatalog';
import { LocalStorageFavoriteGamesRepository } from '../../infrastructure/game/LocalStorageFavoriteGamesRepository';

const repository = new LocalStorageFavoriteGamesRepository();

export function loadFavoriteGames(playerName: string): GameId[] {
  return repository.load(playerName);
}

export function toggleFavoriteGame(playerName: string, gameId: GameId): GameId[] {
  const currentFavorites = repository.load(playerName);
  const nextFavorites = currentFavorites.includes(gameId)
    ? currentFavorites.filter((favoriteGameId) => favoriteGameId !== gameId)
    : [...currentFavorites, gameId];

  repository.save(playerName, nextFavorites);
  return nextFavorites;
}

export function clearFavoriteGames(playerName: string): void {
  repository.clear(playerName);
}
