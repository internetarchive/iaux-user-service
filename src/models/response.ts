export interface UserResponse {
  username: string;
  itemname: string;
  screenname: string;
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
  value?: UserResponse;

  /**
   * If the request was not successful, this will contain the error message
   */
  error?: string;
}
