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
  public static deserializeClass(bucket: AsyncBucket, c: Class): Promise<ClassSchema> {
    return ClassHelper.getClass(bucket, c.courseId);
  }

  /**
   * Gets a ClassSchema from a courseId.
   * @param classesBucket: AsyncBucket the bucket for classes.
   * @param courseId: number the id of the course.
   * @return Promise<ClassSchema> the deserialized class, as a promise
   */
  public static getClass(
    bucket: AsyncBucket, courseId: number): Promise<ClassSchema> {
    return bucket.getAsync(util.format(constants.CLASSES_BUCKET_KEY, courseId))
      .then((result) => {
        return result.value;
      });
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

  /**
   * Adds a user to a classes roster. If isProf, adds him/her as a professor.
   * This only adds a user to a classes roster, it does not add the class to
   * the user's class list. See userHelper for that.
   * @param bucket: AsyncBucket The classes bucket.
   * @param user: User The user to add to the class.
   * @param courseId: number The class to add.
   * @param isProf: boolean whether the user is to be added as a professor.
   * @return ClassSchema the class with the updated user.
   */
  public static addToClass(classesBucket: AsyncBucket, user: User,
    courseId: number, isProf: boolean): Promise<ClassSchema> {
    return ClassHelper.getClass(classesBucket, courseId).then((c) => {
      if (isProf) c.professors.push(user);
      else c.students.push(user);
      return classesBucket.upsertAsync(
        util.format(constants.CLASSES_BUCKET_KEY, courseId), c)
        .then(() => c);
    });
  }

}
