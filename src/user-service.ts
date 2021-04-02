import 'cookie-store';
import { User, UserServiceResponse } from './models';

export interface UserServiceInterface {
  /**
   * Return the current user info or null if no current user
   *
   * @returns {Promise<User> | null}
   * @memberof UserServiceInterface
   */
  getLoggedInUser(): Promise<User | null>;
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
  async getLoggedInUser(): Promise<User | null> {
    const hasCookies = await this.hasArchiveOrgLoggedInCookies();
    if (!hasCookies) return null;

    const persistedUser = await this.getPersistedUser();
    if (persistedUser) return persistedUser;
    const response = await fetch(this.userServiceEndpoint, {
      credentials: 'include',
    });
    const result = (await response.json()) as UserServiceResponse;
    if (!result.success || !result.value) return null;
    const user = result.value;
    await this.persistUser(user);
    return user;
  }

  private async getPersistedUser(): Promise<User | null> {
    return this.cache?.get(this.userCacheKey);
  }

  private async persistUser(user: User): Promise<void> {
    await this.cache?.set({
      key: this.userCacheKey,
      value: user,
      ttl: this.cacheTTL, // if set, otherwise will default to the localCache default
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private async hasArchiveOrgLoggedInCookies(): Promise<boolean> {
    const sigCookiePromise = window.cookieStore.get('logged-in-sig');
    const userCookiePromise = window.cookieStore.get('logged-in-user');
    const results = await Promise.all([sigCookiePromise, userCookiePromise]);
    const hasBothCookies = results[0] !== undefined && results[1] !== undefined;
    return hasBothCookies;
  }
}
