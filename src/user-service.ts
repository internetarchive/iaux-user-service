import cookie from 'cookiejs';
import { Result } from '@internetarchive/result-type';
import { UserResponse, UserServiceResponse } from './models/response';
import { User } from './models/user';
import type { UserInterface } from './models/user';
import { UserServiceError, UserServiceErrorType } from './user-service-error';

export interface UserServiceInterface {
  /**
   * Return the current user info or null if no current user
   *
   * @returns {Promise<Result<UserInterface, UserServiceError>>}
   * @memberof UserServiceInterface
   */
  getLoggedInUser(): Promise<Result<UserInterface, UserServiceError>>;
}

/**
 * An interface for a cache to conform to for caching User info
 *
 * @export
 * @interface UserServiceCacheInterface
 */
export interface UserServiceCacheInterface {
  set(options: { key: string; value: any; ttl?: number }): Promise<void>;

  get(key: string): Promise<any>;
}

export class UserService implements UserServiceInterface {
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
      'https://archive.org/services/user.php?op=whoami';
    this.cache = options?.cache;
    this.cacheTTL = options?.cacheTTL;
    this.userCacheKey = options?.userCacheKey ?? 'loggedInUserInfo';
  }

  /** @inheritdoc */
  async getLoggedInUser(): Promise<Result<UserInterface, UserServiceError>> {
    // if the user doesn't have IA cookies, just return a `userNotLoggedIn` error
    const cookieUserInfo = await this.loggedInCookies();
    const hasCookies =
      cookieUserInfo.loggedInUsername !== false &&
      cookieUserInfo.loggedInSignature !== false;
    if (!hasCookies)
      return {
        error: new UserServiceError(UserServiceErrorType.userNotLoggedIn),
      };

    // check for cached user
    const persistedUser = await this.getPersistedUser();
    if (persistedUser) {
      const user = User.fromUserResponse(persistedUser);
      const nameMatches = cookieUserInfo.loggedInUsername === user.username;
      // verify that the cached used matches the user in the cookie
      if (nameMatches) {
        return { success: user };
      }
    }

    // if another fetch is in progress, chain this request to it
    if (this.fetchPromise) {
      this.fetchPromise = this.fetchPromise.then(response => {
        return response;
      });
      return this.fetchPromise;
    }

    // assign the fetch promise so chaining starts
    this.fetchPromise = this.fetchUser();
    // fetch the result
    const result = await this.fetchPromise;
    // reset it so subsequent requests go through normal flow
    this.fetchPromise = undefined;
    return result;
  }

  private fetchPromise?: Promise<Result<UserInterface, UserServiceError>>;

  private async fetchUser(): Promise<Result<UserInterface, UserServiceError>> {
    let response: Response;
    try {
      response = await fetch(this.userServiceEndpoint, {
        credentials: 'include',
      });
    } catch (err) {
      return {
        error: new UserServiceError(
          UserServiceErrorType.networkError,
          err.message
        ),
      };
    }

    let result: UserServiceResponse;
    try {
      result = (await response.json()) as UserServiceResponse;
    } catch (err) {
      return {
        error: new UserServiceError(
          UserServiceErrorType.decodingError,
          err.message
        ),
      };
    }

    if (!result.success || !result.value) {
      return {
        error: new UserServiceError(
          UserServiceErrorType.userNotLoggedIn,
          result.error
        ),
      };
    }

    const userResponse = result.value;
    const user = User.fromUserResponse(userResponse);
    await this.persistUser(userResponse);
    return { success: user };
  }

  private async getPersistedUser(): Promise<UserResponse | null> {
    const persistedUser = await this.cache?.get(this.userCacheKey);
    return persistedUser;
  }

  private async persistUser(user: UserResponse): Promise<void> {
    await this.cache?.set({
      key: this.userCacheKey,
      value: user,
      ttl: this.cacheTTL, // if set, otherwise will default to the localCache default
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private async loggedInCookies(): Promise<{
    loggedInUsername: string | boolean;
    loggedInSignature: string | boolean;
  }> {
    return {
      loggedInUsername: cookie.get('logged-in-user'),
      loggedInSignature: cookie.get('logged-in-sig'),
    };
  }
}
