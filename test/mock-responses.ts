import { User } from '../src/models/user';

function mockApiResponse(body = {}, status = 200) {
  return new window.Response(JSON.stringify(body), {
    status,
    headers: { 'Content-type': 'application/json' },
  });
}

export const mockUser = new User({
  username: 'foo@bar.com',
  itemname: '@fooey-mcbarrison',
  screenname: 'Foo-Bar',
  privs: ['/'],
});

export function getSuccessResponse() {
  return mockApiResponse({
    success: true,
    value: mockUser,
  });
}

export function getFailureResponse() {
  return mockApiResponse(
    {
      success: false,
      error: 'Authentication failed',
    },
    401
  );
}
