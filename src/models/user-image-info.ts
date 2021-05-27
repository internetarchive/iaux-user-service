import { NumberParser } from '@internetarchive/field-parsers';
import { UserImageInfoResponse } from './response';

export interface UserImageInfoInterface {
  /**
   * The image filename
   */
  name?: string;

  /**
   * The image source, ie `original` or `derivative`
   */
  source?: string;

  /**
   * The last modified epoch
   */
  mtime?: number;

  /**
   * The file size
   */
  size?: number;

  /**
   * The md5 hash
   */
  md5?: string;

  /**
   * The image crc32
   */
  crc32?: string;

  /**
   * The image sha1
   */
  sha1?: string;

  /**
   * The image format. Will likely be "Item Image"
   */
  format?: string;

  /**
   * The image rotation
   */
  rotation?: number;
}

export class UserImageInfo implements UserImageInfoInterface {
  /** @inheritdoc */
  name?: string;

  /** @inheritdoc */
  source?: string;

  /** @inheritdoc */
  mtime?: number;

  /** @inheritdoc */
  size?: number;

  /** @inheritdoc */
  md5?: string;

  /** @inheritdoc */
  crc32?: string;

  /** @inheritdoc */
  sha1?: string;

  /** @inheritdoc */
  format?: string;

  /** @inheritdoc */
  rotation?: number;

  static fromResponse(userResponse: UserImageInfoResponse): UserImageInfo {
    const numberParser = NumberParser.shared;
    return new UserImageInfo({
      name: userResponse.name,
      source: userResponse.source,
      mtime: userResponse.mtime
        ? numberParser.parseValue(userResponse.mtime)
        : undefined,
      size: userResponse.size
        ? numberParser.parseValue(userResponse.size)
        : undefined,
      md5: userResponse.md5,
      crc32: userResponse.crc32,
      sha1: userResponse.sha1,
      format: userResponse.format,
      rotation: userResponse.rotation
        ? numberParser.parseValue(userResponse.rotation)
        : undefined,
    });
  }

  constructor(options: {
    name?: string;
    source?: string;
    mtime?: number;
    size?: number;
    md5?: string;
    crc32?: string;
    sha1?: string;
    format?: string;
    rotation?: number;
  }) {
    this.name = options.name;
    this.source = options.source;
    this.mtime = options.mtime;
    this.size = options.size;
    this.md5 = options.md5;
    this.crc32 = options.crc32;
    this.sha1 = options.sha1;
    this.format = options.format;
    this.rotation = options.rotation;
  }
}
