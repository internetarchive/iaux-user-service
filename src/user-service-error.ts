export enum UserServiceErrorType {
  userNotLoggedIn = 'UserService.userNotLoggedIn',
  networkError = 'UserService.networkError',
  decodingError = 'UserService.decodingError',
}

export class UserServiceError extends Error {
  type: UserServiceErrorType;

  constructor(type: UserServiceErrorType, message?: string) {
    super(message);
    this.name = type;
    this.type = type;
  }
}
