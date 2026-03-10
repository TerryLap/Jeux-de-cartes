import { GameId } from '../../domain/games/GameCatalog';

const STORAGE_KEY = 'jdc.favoriteGames';

type FavoriteGamesMap = Record<string, GameId[]>;

export class LocalStorageFavoriteGamesRepository {
  load(playerName: string): GameId[] {
    const allFavorites = this.loadAll();
    const favorites = allFavorites[playerName];
    if (!Array.isArray(favorites)) {
      return [];
    }

    return favorites.filter((gameId): gameId is GameId => typeof gameId === 'string');
  }

  save(playerName: string, gameIds: GameId[]): void {
    const allFavorites = this.loadAll();
    allFavorites[playerName] = [...new Set(gameIds)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFavorites));
  }

  clear(playerName: string): void {
    const allFavorites = this.loadAll();
    delete allFavorites[playerName];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFavorites));
  }

  private loadAll(): FavoriteGamesMap {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as FavoriteGamesMap;
      return typeof parsed === 'object' && parsed ? parsed : {};
    } catch {
      return {};
    }
  }
}
