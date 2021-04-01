import { expect } from '@open-wc/testing';
import Sinon, { SinonStub } from 'sinon';
import { UserService } from '../src/user-service';

const sandbox = Sinon.createSandbox();
let fetchStub: SinonStub | undefined;
let cookieStoreStub: SinonStub | undefined;

function mockApiResponse(body = {}, status = 200) {
  return new window.Response(JSON.stringify(body), {
    status,
    headers: { 'Content-type': 'application/json' },
  });
}

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
      fetchStub?.returns(
        mockApiResponse({
          success: true,
          value: {
            username: 'foo@bar.com',
            itemname: '@fooey-mcbarrison',
            screenname: 'Foo-Bar',
            privs: ['/'],
          },
        })
      );

      const userService = new UserService();
      const userInfo = await userService.getLoggedInUser();
      expect(userInfo?.screenname).to.equal('Foo-Bar');
    });

    it('returns null if user does not have IA cookies', async () => {
      cookieStoreStub?.returns(undefined); // return no cookie
      fetchStub?.returns(
        mockApiResponse({
          success: true,
          value: {
            username: 'foo@bar.com',
            itemname: '@fooey-mcbarrison',
            screenname: 'Foo-Bar',
            privs: ['/'],
          },
        })
      );

      const userService = new UserService();
      const userInfo = await userService.getLoggedInUser();
      expect(userInfo).to.equal(null);
    });

    it('returns null if authentication error', async () => {
      cookieStoreStub?.returns('fake-ia-cookie'); // return fake ia cookie
      // cookie may have expired
      fetchStub?.returns(
        mockApiResponse(
          {
            success: false,
            error: 'Authentication failed',
          },
          401
        )
      );

      const userService = new UserService();
      const userInfo = await userService.getLoggedInUser();
      expect(userInfo).to.equal(null);
    });
  });
});
