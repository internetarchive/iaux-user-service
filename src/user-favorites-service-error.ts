// eslint-disable-next-line no-shadow
export enum UserFavoritesServiceErrorType {
  userNotLoggedIn = 'UserFavoritesService.userNotLoggedIn',
  networkError = 'UserFavoritesService.networkError',
  decodingError = 'UserFavoritesService.decodingError',
}

export class UserFavoritesServiceError extends Error {
  type: UserFavoritesServiceErrorType;

  constructor(type: UserFavoritesServiceErrorType, message?: string) {
    super(message);
    this.name = type;
    this.type = type;
  }
}