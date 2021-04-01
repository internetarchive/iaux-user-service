import 'cookie-store';
import { LocalCacheInterface } from '@internetarchive/local-cache';
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

export class UserService implements UserServiceInterface {
  private userServiceEndpoint: string;

  private localCache?: LocalCacheInterface;

  private readonly USER_INFO_KEY = 'loggedInUserInfo';

  constructor(options?: {
    userServiceEndpoint?: string;
    localCache?: LocalCacheInterface;
    cacheTTL?: number;
  }) {
    this.userServiceEndpoint =
      options?.userServiceEndpoint ??
      'https://archive.org/services/user.php?op=whoami';
    this.localCache = options?.localCache;
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
    return this.localCache?.get(this.USER_INFO_KEY);
  }

  private async persistUser(user: User): Promise<void> {
    await this.localCache?.set({
      key: this.USER_INFO_KEY,
      value: user,
      ttl: 60 * 1000,
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
