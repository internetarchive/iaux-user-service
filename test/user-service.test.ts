import { LocalCache } from '@internetarchive/local-cache';
import { expect } from '@open-wc/testing';
import Sinon, { SinonStub } from 'sinon';
import { UserService } from '../src/user-service';
import { getFailureResponse, getSuccessResponse } from './mock-responses';

const sandbox = Sinon.createSandbox();
let fetchStub: SinonStub | undefined;
let cookieStoreStub: SinonStub | undefined;

describe('UserService', () => {
  beforeEach(() => {
    fetchStub = sandbox.stub(window, 'fetch');
    cookieStoreStub = sandbox.stub(window.cookieStore, 'get');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getCurrentUserInfo', () => {
    it('can fetch logged in user info', async () => {
      cookieStoreStub?.returns('cookie-exists-foo'); // return anything to simulate cookies
      fetchStub?.returns(getSuccessResponse());

      const userService = new UserService();
      const user = await userService.getLoggedInUser();
      expect(user?.screenname).to.equal('Foo-Bar');
    });

    it('returns null if user does not have IA cookies', async () => {
      cookieStoreStub?.returns(undefined); // return no cookie
      fetchStub?.returns(getSuccessResponse());

      const userService = new UserService();
      const user = await userService.getLoggedInUser();
      expect(user).to.equal(null);
    });

    it('returns null if authentication error', async () => {
      cookieStoreStub?.returns('fake-ia-cookie'); // return fake ia cookie
      // cookie may have expired
      fetchStub?.returns(getFailureResponse());

      const userService = new UserService();
      const user = await userService.getLoggedInUser();
      expect(user).to.equal(null);
    });

    it('can cache the user object in localCache', async () => {
      cookieStoreStub?.returns('fake-ia-cookie'); // return fake ia cookie
      // cookie may have expired
      fetchStub?.returns(getSuccessResponse());

      const cache = new LocalCache({ namespace: 'boop' });
      const userService = new UserService({
        localCache: cache,
        userCacheKey: 'foo-cache',
      });
      const user = await userService.getLoggedInUser();
      expect(user?.username).to.equal('foo@bar.com');
      const cachedResult = await cache.get('foo-cache');
      expect(cachedResult).to.not.equal(undefined);
      cache.delete('foo-cache');
    });

    it('returns a cached user', async () => {
      cookieStoreStub?.returns('fake-ia-cookie'); // return fake ia cookie
      // cookie may have expired
      fetchStub?.returns(getSuccessResponse());

      const cache = new LocalCache({ namespace: 'boop' });
      const userService = new UserService({
        localCache: cache,
        userCacheKey: 'foo-cache',
      });
      await userService.getLoggedInUser();
      expect(fetchStub?.callCount).to.equal(1);
      await userService.getLoggedInUser();
      expect(fetchStub?.callCount).to.equal(1);
      cache.delete('foo-cache');
    });
  });
});
