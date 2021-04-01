export interface User {
  username: string;
  itemname: string;
  screenname: string;
  privs: string[];
}

export interface UserServiceResponse {
  success: boolean;
  value?: User;
  error?: string;
}
