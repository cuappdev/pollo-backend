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

  /**
   * Initialize the IndexRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  public createClass(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
      return res.status(401).send(constants.UNAUTHORIZED_MESSAGE);
    }
    let allFields = true;
    ["courseNumber", "semester", "course", "courseName", "professorNetids"].forEach((field) => {
      if (!(field in req.body)) allFields = false;
    });
    if (!allFields) {
      return res.status(400).send(constants.MALFORMED_MESSAGE);
    }
    // All fields have been provided, and user is authenticated. Proceed to create class
    Promise.using(couchbaseClient.openAsyncBucket(constants.USERS_BUCKET),
      couchbaseClient.openAsyncBucket(constants.CLASSES_BUCKET),
      (usersBucket, classesBucket) => {
        // Grab all involved professor user objects involved.
        let professorsAsync = Promise.map(req.body.professorNetids, (netid: string) => {
          return UserHelper.getUser(usersBucket, netid)
        }).map((professor: schema.UserSchema) => {
          return UserHelper.serializeUser(usersBucket, professor);
        });
        professorsAsync.error((err) => {
          res.status(400).send('One or more provided netids don\'t have accounts');
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
              .then(() => { return newClass });
          }).then((newClass) => {
            // Add the new class to each professor's list of classes.
            return Promise.each(req.body.professorNetids, (netid: string) => {
              return UserHelper.joinClass(usersBucket, netid, newClass.courseId)
            }).then(() => { return newClass })
          });
      }).then((newClass) => {
        return res.json({
          courseId: newClass.courseId
        });
      }).error((err) => res.status(500).send(err))
  }

  public getAllClasses(req: Request, res: Response, next: NextFunction) {
    let query = N1qlQuery.fromString(
      ' SELECT courseId, courseNumber, courseName, course, semester, professors' +
      ' FROM classes'
    );
    Promise.using(couchbaseClient.openAsyncBucket(constants.CLASSES_BUCKET),
    (classesBucket): Promise<schema.Class[]> => {
      return classesBucket.queryAsync(query);
    }).then((classes) => {
      return res.json(classes);
    });
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this.router.post('/', this.createClass);
    this.router.get('/', this.getAllClasses);
  }

}

// Create the IndexRouter, and export its configured Express.Router
const classesRouter = new ClassesRouter();

export default classesRouter.router;
