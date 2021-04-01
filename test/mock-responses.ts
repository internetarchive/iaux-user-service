function mockApiResponse(body = {}, status = 200) {
  return new window.Response(JSON.stringify(body), {
    status,
    headers: { 'Content-type': 'application/json' },
  });
}

export function getSuccessResponse() {
  return mockApiResponse({
    success: true,
    value: {
      username: 'foo@bar.com',
      itemname: '@fooey-mcbarrison',
      screenname: 'Foo-Bar',
      privs: ['/'],
    },
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
