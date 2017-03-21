import {AsyncBucket} from 'couchbase';
import * as Promise from 'bluebird';
import * as util from 'util';

import {couchbaseClient} from '../db/couchbaseClient'
import {UserSchema, User, UserClass, Class, ClassSchema} from '../db/schema';
import * as constants from '../helpers/constants';

/**
 * Utility class for use static functions related to querying and updating classes.
 */
export class ClassHelper {

  /**
   * Increments the current courseId counter.
   * @param bucket: <BucketAsync> the classes bucket.
   * @return Promise<number> the number of the next courseId.
   */
  public static incrementCourseIdCounter(bucket: AsyncBucket): Promise<number> {
    return bucket.counterAsync(constants.COURSE_ID_COUNTER, 1, { initial: 1 })
      .then((result) => result.value);
  }

  /**
   * Converts a ClassSchema to a Class.
   * @param classesBucket: AsyncBucket the bucket for classes.
   * @param classSchema: ClassSchema the class to convert.
   * @return Promise<Class> the serialized class, as a promise
   */
  public static serializeClass(classSchema: ClassSchema): Promise<Class> {
    return Promise.resolve({
      courseId: classSchema.courseId,
      courseNumber: classSchema.courseNumber,
      courseName: classSchema.courseName,
      course: classSchema.course,
      semester: classSchema.semester,
      professors: classSchema.professors
    });
  }

  /**
   * Converts a ClassSchema to a Class.
   * @param classesBucket: AsyncBucket the bucket for classes.
   * @param c: Class serialized class who's full information we're fetching.
   * @return Promise<ClassSchema> the deserialized class, as a promise
   */
  public static deserializeClass(
    bucket: AsyncBucket, c: Class): Promise<ClassSchema> {
    return bucket.getAsync(util.format(constants.CLASSES_BUCKET_KEY, c.courseId))
      .then((result) => {
        return result.value;
      })
  }

  /**
   * Converts a Class object to a UserClass object.
   * @param c: Class the class we are converting.
   * @param isProf: Whether the user is a professor of this class.
   * @return Promise<UserClass> the UserClass as a Promise.
   */
  public static getUserClass(c: Class, isProf: boolean): Promise<UserClass> {
    let userClass: UserClass = {
      courseId: c.courseId,
      courseNumber: c.courseNumber,
      courseName: c.courseName,
      course: c.course,
      semester: c.semester,
      professors: c.professors,
      isProf: isProf,
    }
    // Determine whether or not to add students to the object.
    if (!isProf) return Promise.resolve(userClass);
    return Promise.using(couchbaseClient.openAsyncBucket(constants.CLASSES_BUCKET), (bucket) => {
      return ClassHelper.deserializeClass(bucket, c).then((classSchema) => {
        userClass.students = classSchema.students;
        return userClass;
      });
    })
  }

}
