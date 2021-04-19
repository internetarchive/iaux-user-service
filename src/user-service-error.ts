// eslint-disable-next-line no-shadow
export enum UserServiceErrorType {
  userNotLoggedIn = 'UserService.userNotLoggedIn',
  networkError = 'UserService.networkError',
  decodingError = 'UserService.decodingError',
}

export class UserServiceError extends Error {
  type: UserServiceErrorType;

  details?: any;

  constructor(type: UserServiceErrorType, message?: string, details?: any) {
    super(message);
    this.name = type;
    this.type = type;
    this.details = details;
  }
}
