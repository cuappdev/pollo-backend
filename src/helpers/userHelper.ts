import {AsyncBucket} from 'couchbase';
import * as Promise from 'bluebird';
import * as util from 'util';

import {couchbaseClient} from '../db/couchbaseClient';
import * as constants from '../helpers/constants';
import {UserSchema, User} from '../db/schema';

/**
 * Utility class for use static functions related to querying and updating users.
 */
export class UserHelper {

  /**
   * Translates a UserSchema into a User object that can be stored in the session.
   */
  public static serializeUser(bucket: AsyncBucket, user: UserSchema): Promise<User> {
    return Promise.resolve({
      netid: user.netid,
      email: user.email,
      displayName: user.displayName,
      name: user.name
    });
  }

  /**
   * Specifies how to translate a cache'd User session object into the full object.
   */
  public static deserializeUser(bucket: AsyncBucket, user: User): Promise<UserSchema> {
    return UserHelper.getUser(bucket, user.netid);
  }

  /** Returns a UserSchema object from a netid. */
  public static getUser(bucket: AsyncBucket, netid: string) {
    return bucket.getAsync(util.format('netid:%s', netid))
      .then((deserializedUser: UserSchema) => {
        return deserializedUser;
      });
  }

  public static joinClass(userBucket: AsyncBucket, netid: string, courseId: number) {
    
  }
}
