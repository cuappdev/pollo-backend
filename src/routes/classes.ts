import {N1qlQuery} from 'couchbase';
import {Router, Request, Response, NextFunction} from 'express';
import * as Promise from 'bluebird';
import * as util from 'util';

import {couchbaseClient} from '../db/couchbaseClient';
import * as constants from '../helpers/constants';
import * as schema from '../db/schema';

import {UserHelper} from '../helpers/userHelper';
import {ClassHelper} from '../helpers/classHelper';

export class ClassesRouter {
  router: Router

  constructor() {
    this.router = Router();
    this.init();
  }

  public createClass(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: constants.UNAUTHORIZED_MESSAGE });
    }
    let allFields = true;
    ["courseNumber", "semester", "course", "courseName", "professorNetids"].forEach((field) => {
      if (!(field in req.body)) allFields = false;
    });
    if (!allFields) {
      return res.status(400).json({ message: constants.MALFORMED_MESSAGE });
    }
    // All fields have been provided, and user is authenticated. Proceed to create class
    Promise.using(couchbaseClient.openAsyncBucket(constants.USERS_BUCKET),
      couchbaseClient.openAsyncBucket(constants.CLASSES_BUCKET),
      (usersBucket, classesBucket) => {
        // Grab all involved professor user objects involved.
        let professorsAsync;
        if (!Array.isArray(req.body.professorNetids)) {
          req.body.professorNetids = [req.body.professorNetids];
        }
        professorsAsync = Promise.map(req.body.professorNetids, (netid: string) => {
          return UserHelper.getUser(usersBucket, netid)
        }).map((professor: schema.UserSchema) => {
          return UserHelper.serializeUser(professor);
        });
        professorsAsync.error((err) => {
          res.status(404).json({ message: 'One or more provided netids don\'t have accounts' });
          throw err;
        });

        // Get a classId and await professors query.
        return Promise.join(professorsAsync,
          ClassHelper.incrementCourseIdCounter(classesBucket),
          (professors, courseId) => {
            // Create the class.
            let newClass: schema.ClassSchema = {
              courseId: courseId,
              professors: professors,
              students: [],
              lectures: [],
              courseNumber: req.body.courseNumber,
              semester: req.body.semester,
              course: req.body.course,
              courseName: req.body.courseName
            }
            // Upsert the class to Couchbase.
            return classesBucket.upsertAsync(util.format(constants.CLASSES_BUCKET_KEY, courseId), newClass)
              .then(() => {
                return ClassHelper.serializeClass(newClass);
              });
          }).then((newClass) => {
            // Add the new class to each professor's list of classes.
            return Promise.each(req.body.professorNetids, (netid: string) => {
              return UserHelper.addClass(usersBucket, netid, newClass, true)
            }).then(() => { return newClass })
          });
      }).then((newClass) => {
        return res.json({
          courseId: newClass.courseId
        });
      }).error((err) => res.status(500).json({ message: 'Encountered an internal server error' }));
  }

  public getAllClasses(req: Request, res: Response, next: NextFunction) {
    let query = N1qlQuery.fromString(
      ' SELECT courseId, courseNumber, courseName, course, semester, professors' +
      ' FROM classes' +
      ' WHERE courseId IS NOT MISSING'
    );
    Promise.using(couchbaseClient.openAsyncBucket(constants.CLASSES_BUCKET),
      (classesBucket): Promise<schema.Class[]> => {
        return classesBucket.queryAsync(query);
      }).then((classes) => {
        return res.json(classes);
      });
  }

  public getMyClasses(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: constants.UNAUTHORIZED_MESSAGE });
    }
    // List of classes is stored in the deserialized user object, so we don't
    // need to make a query.
    let user: schema.UserSchema = req.user;
    // Map each class in studentClasses to a UserClass object.
    let studentClassesAsync = Promise.map(user.studentClasses, (c) => {
      return ClassHelper.getUserClass(c, false);
    });
    let professorClassesAsync = Promise.map(user.professorClasses, (c) => {
      return ClassHelper.getUserClass(c, true);
    });
    return Promise.join(studentClassesAsync, professorClassesAsync,
      (studentClasses, professorClasses) => {
        let allClasses = studentClasses.concat(professorClasses);
        return res.json(allClasses);
      });
  }

  /** Endpoint for a student to join a class */
  public joinClass(req: Request, res: Response, next: NextFunction) {
    Promise.using(couchbaseClient.openAsyncBucket(constants.USERS_BUCKET),
      couchbaseClient.openAsyncBucket(constants.CLASSES_BUCKET),
      (usersBucket, classesBucket) => {
        // Get the class that we're adding.
        let classSchemaAsync = ClassHelper.getClass(classesBucket, req.params.courseId);
        // Add user to class roster.
        let addToClassAsync = Promise.join(classSchemaAsync, UserHelper.serializeUser(req.user), (c, user) => {
          c.students.push(user);
          return classesBucket.upsertAsync(
            util.format(constants.CLASSES_BUCKET_KEY, c.courseId), c);
        });
        // Add class to student's class list.
        let addClassAsync = classSchemaAsync.then(ClassHelper.serializeClass).then((c) => {
          let user: schema.UserSchema = req.user;
          user.studentClasses.push(c)
          return classesBucket.upsertAsync(
            util.format(constants.USERS_BUCKET_KEY, user.netid), user);
        });
        return Promise.join(addToClassAsync, addClassAsync, () => { });
      }).then(() => {
        res.json({ message: "success" });
      }, () => {
        res.status(404).json({ message: "failure" });
      });
  }

  init() {
    this.router.post('/', this.createClass);
    this.router.get('/', this.getAllClasses);
    this.router.get('/enrolled', this.getMyClasses);
    this.router.put('/join/:courseId', this.joinClass);
  }

}

// Create the IndexRouter, and export its configured Express.Router
const classesRouter = new ClassesRouter();

export default classesRouter.router;
