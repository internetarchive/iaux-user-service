import { MediaType } from "@internetarchive/field-parsers";

export interface UserFavoriteInterface {
  userid: string;
  kind: 'favorite';
  listname: string;
  identifier: string;
  updatedate: string;
  media: string;
  title: string;
  comments: string;
  mediatype: MediaType | 'search';
  media2: string;
}

export interface UserFavoritesResponse {
  favorites: UserFavoriteInterface[];
}

export interface UserFavoritesInterface {
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
   * list of favorites
   */
  favorites: UserFavoriteInterface[];
}

export class UserFavorites implements UserFavoritesInterface {
  /** @inheritdoc */
  itemname: string;

  /** @inheritdoc */
  userid: string;

  /** @inheritdoc */
  favorites: UserFavoriteInterface[];

  constructor(options: {
    userid: string;
    itemname: string;
    favorites: UserFavoriteInterface[];
  }) {
    this.userid = options.userid;
    this.itemname = options.itemname;
    this.favorites = options.favorites || [];
  }
}
