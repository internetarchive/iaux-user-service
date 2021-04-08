export interface User {
  /**
   * The user's email address
   */
  username: string;

  /**
   * The user's item identifier
   *
   * eg. `@foo-user`
   */
  itemname: string;

  /**
   * The user's screen name, typically used for display purposes
   *
   * eg. `Foo-User`
   */
  screenname: string;

  /**
   * Array of privileges for the user
   */
  privs: string[];
}

export interface UserServiceResponse {
  /**
   * Was the request successful?
   */
  success: boolean;

  /**
   * If the request was successful, this will populate with a User object
   */
  value?: User;

  /**
   * If the request was not successful, this will contain the error message
   */
  error?: string;
}
