import {AsyncBucket} from 'couchbase';
import * as Promise from 'bluebird';
import * as util from 'util';

import * as constants from '../helpers/constants';
import {UserSchema, User, Class, ClassSchema} from '../db/schema';

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
    return bucket.counterAsync(constants.COURSE_ID_COUNTER, 1, { initial: 1 });
  }

  /**
   * Converts a ClassSchema to a Class.
   * @param classesBucket: AsyncBucket the bucket for classes.
   * @param classSchema: ClassSchema the class to convert.
   * @return Promise<Class> the serialized class, as a promise
   */
  public static serializeClass(
    bucket: AsyncBucket, classSchema: ClassSchema): Promise<Class> {
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
   * @param c: serialized class who's full information we're fetching.
   * @return Promise<ClassSchema> the deserialized class, as a promise
   */
  public static deserializeClass(
    bucket: AsyncBucket, c: Class): Promise<ClassSchema> {
      return bucket.getAsync(util.format(constants.CLASSES_BUCKET_KEY, c.courseId))
  }

}
