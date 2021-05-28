/* eslint-disable camelcase */
import { UserResponse } from './response';
import { UserImageInfo, UserImageInfoInterface } from './user-image-info';

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

  /**
   * Info about the user's profile picture
   */
  image_info: UserImageInfoInterface;
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

  /** @inheritdoc */
  image_info: UserImageInfoInterface;

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
      image_info: UserImageInfo.fromResponse(userResponse.image_info),
    });
  }

  constructor(options: {
    username: string;
    itemname: string;
    screenname: string;
    privs: string[];
    image_info: UserImageInfoInterface;
  }) {
    this.username = options.username;
    this.itemname = options.itemname;
    this.screenname = options.screenname;
    this.privs = options.privs;
    this.image_info = options.image_info;

    const { itemname } = options;
    this.userid = itemname.startsWith('@') ? itemname.substring(1) : itemname;
  }
}
