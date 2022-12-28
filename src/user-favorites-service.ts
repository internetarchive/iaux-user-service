import { Result } from "@internetarchive/result-type";
import { UserFavoritesResponse } from "./models/response";
import { UserFavorites, UserFavoritesInterface } from "./models/user-favorites";
import { UserFavoritesServiceError, UserFavoritesServiceErrorType } from "./user-favorites-service-error";
import { UserServiceCacheInterface } from "./user-service";


export interface UserFavoritesServiceInterface {
  /**
   * Return the current user info or null if no current user
   */
  fetchUserFavorites(): Promise<Result<UserFavoritesInterface, UserFavoritesServiceError>>;

  /** */
}

/**
 * An interface for a cache to conform to for caching User Favorites info
 */
export interface UserFavoritesServiceCacheInterface {
  set(options: { key: string; value: string[]; ttl?: number }): Promise<void>;

  get(key: string): Promise<any>;
}

export class UserFavoritesService implements UserFavoritesServiceInterface {
  private userServiceEndpoint: string;

  private cache?: UserServiceCacheInterface;

  private userCacheKey;

  private cacheTTL?: number;

  constructor(options?: {
    userServiceEndpoint?: string;
    cache?: UserServiceCacheInterface;
    cacheTTL?: number;
    userCacheKey?: string;
  }) {
    this.userServiceEndpoint =
      options?.userServiceEndpoint ??
      `https://archive.org/bookmarks.php`;
    this.cache = options?.cache;
    this.cacheTTL = options?.cacheTTL;
    this.userCacheKey = options?.userCacheKey ?? 'loggedInUserFavorites';
  }


  async fetchUserFavorites(): Promise<Result<UserFavoritesInterface, UserFavoritesServiceError>> {
    let response: Response;
    try {
      response = await fetch(`${this.userServiceEndpoint}?output=json`, {
        credentials: 'include',
      });
    } catch (err) {
      return {
        error: new UserFavoritesServiceError(
          UserFavoritesServiceErrorType.networkError,
          (err as Error).message
        ),
      };
    }

    let result: UserFavoritesResponse;
    try {
      result = (await response.json()) as UserFavoritesResponse;
    } catch (err) {
      return {
        error: new UserFavoritesServiceError(
          UserFavoritesServiceErrorType.decodingError,
          (err as Error).message
        ),
      };
    }

    // TODO: handle errors
    // if (!result.success || !result.value) {
    //   return {
    //     error: new UserFavoritesServiceError(
    //       UserFavoritesServiceErrorType.userNotLoggedIn,
    //       result.error
    //     ),
    //   };
    // }

    // const userFavorites =  new UserFavorites({
    //   favorites: result      
    // });
    // await this.persistUser(userFavorites);
    // return { success: userFavorites };

    
  }

  private async getPersistedUser(): Promise<UserFavoritesResponse | null> {
    return this.cache?.get(this.userCacheKey);
  }

  private async persistUser(userFavorites: UserFavoritesResponse): Promise<void> {
    await this.cache?.set({
      key: this.userCacheKey,
      value: userFavorites,
      ttl: this.cacheTTL, // if set, otherwise will default to the localCache default
    });
  }
}
