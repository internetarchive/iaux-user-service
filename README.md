[![Build Status](https://github.com/internetarchive/iaux-user-service/actions/workflows/ci.yml/badge.svg?branch=main)) [![codecov](https://codecov.io/gh/internetarchive/iaux-user-service/branch/master/graph/badge.svg)](https://codecov.io/gh/internetarchive/iaux-user-service)

# IAUX User Service

This is a Typescript library to interact with the Internet Archive's User Service.

## Usage

```js
import { UserService } from '@internetarchive/user-service';

// instantiate a UserService object
const userService = new UserService();

// get the result
const result = await userService.getLoggedInUser();

// if the user is logged in, the User object will be in `result.success`
const user = result.success;
if (user) {
  console.debug(
    'User:', user.username, user.itemname, user.screenanme, user.privs
  )
  return;
}

// if the user is not logged in or you an error occurred,
// you'll get a `result.error` and can inspect `result.error.type`:
switch (result.error?.type) {
  case UserServiceErrorType.userNotLoggedIn:
    console.info('User not logged in');
    break;
  case UserServiceErrorType.networkError:
    console.error('There was a network error fetching the user');
    break;
  case UserServiceErrorType.decodingError:
    console.error('There was an error decoding the user service response');
    break;
  default:
    console.error('An unknown error occurred fetching the user');
}
```

## Advanced Usage

### Caching
You can pass in a cache handler that implements `UserServiceCacheInterface` and the results will be cached:

```js
import { LocalCache } from '@internetarchive/local-cache';

const cache = new LocalCache();
const service = new UserService({
  cache,
  cacheTTL: 15 * 60 // seconds, optional
})
const result = await service.getLoggedInUser();
// subsequent calls will be cached
```

## Local Demo with `web-dev-server`
```bash
yarn start
```
To run a local development server that serves the basic demo located in `demo/index.html`

## Testing with Web Test Runner
To run the suite of Web Test Runner tests, run
```bash
yarn run test
```

To run the tests in watch mode (for &lt;abbr title=&#34;test driven development&#34;&gt;TDD&lt;/abbr&gt;, for example), run

```bash
yarn run test:watch
```

## Linting with ESLint, Prettier, and Types
To scan the project for linting errors, run
```bash
yarn run lint
```

You can lint with ESLint and Prettier individually as well
```bash
yarn run lint:eslint
```
```bash
yarn run lint:prettier
```

To automatically fix many linting errors, run
```bash
yarn run format
```

You can format using ESLint and Prettier individually as well
```bash
yarn run format:eslint
```
```bash
yarn run format:prettier
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.
