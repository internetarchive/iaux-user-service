import { User } from '../src/models/user';

export function getMockApiResponseFromString(body = '', status = 200) {
  return new window.Response(body, {
    status,
    headers: { 'Content-type': 'application/json' },
  });
}

export function getMockApiResponseFromObject(body = {}, status = 200) {
  return getMockApiResponseFromString(JSON.stringify(body), status);
}

export const mockUser = new User({
  username: 'foo@bar.com',
  itemname: '@fooey-mcbarrison',
  screenname: 'Foo-Bar',
  privs: ['/'],
});

export function getSuccessResponse() {
  return getMockApiResponseFromObject({
    success: true,
    value: mockUser,
  });
}

export function getFailureResponse() {
  return getMockApiResponseFromObject(
    {
      success: false,
      error: 'Authentication failed',
    },
    401
  );
}
