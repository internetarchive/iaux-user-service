import { UserResponse } from './response';

export interface UserInterface {
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
   * A common use of the itemname is to remove the leading `@`,
   * which is referred to as the userid.
   *
   * This field is auto-generated when instantiating a User object.
   *
   * eg. `foo-user`
   */
  userid: string;

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

export class User implements UserInterface {
  /** @inheritdoc */
  username: string;

  /** @inheritdoc */
  itemname: string;

  /** @inheritdoc */
  userid: string;

  /** @inheritdoc */
  screenname: string;

  /** @inheritdoc */
  privs: string[];

  /**
   * Construct a UserModelInterface object from a UserResponse
   *
   * @static
   * @param {UserResponse} userResponse
   * @returns {UserInterface}
   * @memberof User
   */
  static fromUserResponse(userResponse: UserResponse): UserInterface {
    return new User({
      username: userResponse.username,
      itemname: userResponse.itemname,
      screenname: userResponse.screenname,
      privs: userResponse.privs,
    });
  }

  constructor(options: {
    username: string;
    itemname: string;
    screenname: string;
    privs: string[];
  }) {
    this.username = options.username;
    this.itemname = options.itemname;
    this.screenname = options.screenname;
    this.privs = options.privs;

    const { itemname } = options;
    this.userid = itemname.startsWith('@') ? itemname.substring(1) : itemname;
  }
}
