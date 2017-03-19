import {AsyncBucket} from 'couchbase';
import * as Promise from 'bluebird';
import * as util from 'util';

import * as constants from './constants';
import {couchbaseClient} from '../db/couchbaseClient';
import {UserSchema, User, Class} from '../db/schema';

/**
 * Utility class for use static functions related to querying and updating users.
 */
export class UserHelper {

  /**
   * Translates a UserSchema into a User object that can be stored in the session.
   */
  public static serializeUser(user: UserSchema): Promise<User> {
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
    console.log(util.format('Fetching data for user %s', netid))
    return bucket.getAsync(util.format(constants.USERS_BUCKET_KEY, netid))
      .then((deserializedUser) => {
        return deserializedUser.value;
      });
  }

  public static joinClass(bucket: AsyncBucket, netid: string, c: Class): Promise<any> {
    // Get the user with the given netid.
    console.log(util.format('User %s joining class %s', netid, c));
    return UserHelper.getUser(bucket, netid).then((user: UserSchema) => {
      user.classes.push(c);
      // Add the new class and re-upsert him.
      return bucket.upsertAsync(util.format(constants.USERS_BUCKET_KEY, netid), user);
    })
  }

}
