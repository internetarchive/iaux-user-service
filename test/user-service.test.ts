import { LocalCache } from '@internetarchive/local-cache';
import { expect } from '@open-wc/testing';
import Sinon, { SinonStub } from 'sinon';
import { UserService } from '../src/user-service';
import { UserServiceErrorType } from '../src/user-service-error';
import {
  getFailureResponse,
  getSuccessResponse,
  mockUser,
  getMockApiResponseFromString,
} from './mock-responses';

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

  describe('configuration', () => {
    it('uses the default endpoint', async () => {
      cookieStoreStub?.returns('cookie-exists-foo'); // return anything to simulate cookies
      fetchStub?.returns(getSuccessResponse());

      const userService = new UserService();
      await userService.getLoggedInUser();
      expect(
        fetchStub?.calledWith('https://archive.org/services/user.php?op=whoami')
      ).to.be.true;
    });

    it('can customize the endpoint', async () => {
      cookieStoreStub?.returns('cookie-exists-foo');
      fetchStub?.returns(getSuccessResponse());

      const userService = new UserService({
        userServiceEndpoint: 'https://foo.org/user',
      });
      await userService.getLoggedInUser();
      expect(fetchStub?.calledWith('https://foo.org/user')).to.be.true;
    });
  });

  describe('getCurrentUserInfo', () => {
    it('can fetch logged in user info', async () => {
      cookieStoreStub?.returns('cookie-exists-foo'); // return anything to simulate cookies
      fetchStub?.returns(getSuccessResponse());

      const userService = new UserService();
      const result = await userService.getLoggedInUser();
      expect(result.success?.screenname).to.equal('Foo-Bar');
    });

    it('returns UserServiceErrorType.userNotLoggedIn if user does not have IA cookies', async () => {
      cookieStoreStub?.returns(undefined); // return no cookie
      fetchStub?.returns(getSuccessResponse());

      const userService = new UserService();
      const result = await userService.getLoggedInUser();
      expect(result.success).to.equal(undefined);
      expect(result.error?.type).to.equal(UserServiceErrorType.userNotLoggedIn);
    });

    it('returns UserServiceErrorType.userNotLoggedIn if authentication error', async () => {
      cookieStoreStub?.returns('fake-ia-cookie'); // return fake ia cookie
      // cookie may have expired
      fetchStub?.returns(getFailureResponse());

      const userService = new UserService();
      const result = await userService.getLoggedInUser();
      expect(result.success).to.equal(undefined);
      expect(result.error?.type).to.equal(UserServiceErrorType.userNotLoggedIn);
    });

    it('returns UserServiceErrorType.networkError if there is a network failure', async () => {
      cookieStoreStub?.returns('fake-ia-cookie');
      fetchStub?.rejects();

      const userService = new UserService();
      const result = await userService.getLoggedInUser();
      expect(result.success).to.equal(undefined);
      expect(result.error?.type).to.equal(UserServiceErrorType.networkError);
    });

    it('returns UserServiceErrorType.networkError with proper message', async () => {
      cookieStoreStub?.returns('fake-ia-cookie');
      fetchStub?.rejects(new Error('oh dear'));

      const userService = new UserService();
      const result = await userService.getLoggedInUser();
      expect(result.success).to.equal(undefined);
      expect(result.error?.type).to.equal(UserServiceErrorType.networkError);
      expect(result.error?.message).to.equal('oh dear');
    });

    it('returns UserServiceErrorType.decodingError if the decoding fails', async () => {
      cookieStoreStub?.returns('cookie-exists-foo');
      const response = getMockApiResponseFromString('blah blah blah');
      fetchStub?.returns(response);

      const userService = new UserService();
      const result = await userService.getLoggedInUser();
      expect(result.success).to.equal(undefined);
      expect(result.error?.type).to.equal(UserServiceErrorType.decodingError);
    });

    it('chains concurrent requests into a single fetch', async () => {
      cookieStoreStub?.returns('fake-ia-cookie');
      fetchStub?.returns(getSuccessResponse());

      const cache = new LocalCache({ namespace: 'boop' });
      const userService = new UserService({
        cache,
        userCacheKey: 'foo-cache',
      });

      const results = await Promise.all([
        userService.getLoggedInUser(),
        userService.getLoggedInUser(),
        userService.getLoggedInUser(),
        userService.getLoggedInUser(),
      ]);

      // 4 concurrent requests will only make a single fetch
      expect(fetchStub?.callCount).to.equal(1);

      // validate all of the results got populated properly
      expect(results[0].success?.screenname).to.equal('Foo-Bar');
      expect(results[1].success?.screenname).to.equal('Foo-Bar');
      expect(results[2].success?.screenname).to.equal('Foo-Bar');
      expect(results[3].success?.screenname).to.equal('Foo-Bar');

      cache.delete('foo-cache');
    });

    it('allows new requests after concurrent requests are completed', async () => {
      cookieStoreStub?.returns('fake-ia-cookie');
      fetchStub?.returns(getSuccessResponse());

      // don't use the cache so we can verify fetch behavior
      const userService = new UserService();

      await Promise.all([
        userService.getLoggedInUser(),
        userService.getLoggedInUser(),
        userService.getLoggedInUser(),
        userService.getLoggedInUser(),
      ]);
      expect(fetchStub?.callCount).to.equal(1);

      // after the concurrent requests finish, since we don't have a cache,
      // another fetch gets made
      await userService.getLoggedInUser();
      expect(fetchStub?.callCount).to.equal(2);
    });
  });

  describe('caching', () => {
    it('does not use cache if one not passed in', async () => {
      cookieStoreStub?.returns('fake-ia-cookie');
      fetchStub?.returns(getSuccessResponse());
      const userService = new UserService({
        userCacheKey: 'foo-cache',
      });
      await userService.getLoggedInUser();
      expect(fetchStub?.callCount).to.equal(1);
      fetchStub?.returns(getSuccessResponse());
      await userService.getLoggedInUser();
      expect(fetchStub?.callCount).to.equal(2);
    });

    it('can cache the user object in localCache', async () => {
      cookieStoreStub?.returns('fake-ia-cookie');
      fetchStub?.returns(getSuccessResponse());

      const cache = new LocalCache({ namespace: 'boop' });
      const userService = new UserService({
        cache,
        userCacheKey: 'foo-cache',
      });
      await userService.getLoggedInUser();
      const cachedResult = await cache.get('foo-cache');
      expect(cachedResult).to.deep.equal(mockUser);
      cache.delete('foo-cache');
    });

    it('returns a cached user', async () => {
      cookieStoreStub?.returns('fake-ia-cookie');
      fetchStub?.returns(getSuccessResponse());

      const cache = new LocalCache({ namespace: 'boop' });
      const userService = new UserService({
        cache,
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
