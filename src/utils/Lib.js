// @flow
import {
  NextFunction,
  Response,
  Request,
} from 'express';
import profanity from 'profanity-util';
import AppDevResponse from './AppDevResponse';
import LogUtils from './LogUtils';
import UserSessionsRepo from '../repos/UserSessionsRepo';

import type { Coord } from '../models/Group';

/**
 * Removes element from array on predicate
 * @function
 * @param {Array<T>} arr - Array to remove elements
 * @param {(param: T, num: number) => boolean} pred - Predicate to determine which elements
 * to remove
 */
function remove<T>(arr: Array<T>, pred: (param: T, num: number) => boolean) {
  for (let i = arr.length - 1; i > -1; i -= 1) {
    if (pred(arr[i], i)) {
      arr.splice(i, 1);
    }
  }
}

/**
 * Makes sure all requests are authenticated
 * @function
 * @param {Request} req - Request object to check
 * @param {Response} res - Response object
 * @param {NextFunction} next - Next function
 */
async function ensureAuthenticated(req: Request, res: Response,
  next: NextFunction) {
  const header = req.get('Authorization');
  if (!header) {
    res.send(
      new AppDevResponse(
        false,
        { errors: ['Authorization header missing'] },
      ),
    );
    return next(true);
  }
  const bearerToken = header.replace('Bearer ', '').trim();
  if (!bearerToken) {
    res.send(
      new AppDevResponse(
        false,
        { errors: ['Invalid authorization header'] },
      ),
    );
    return next(true);
  }

  if (!await UserSessionsRepo.verifySession(bearerToken)) {
    res.status(401).send(
      new AppDevResponse(
        false,
        { errors: ['Invalid session token'] },
      ),
    );
    return next(true);
  }
  const user = await UserSessionsRepo.getUserFromToken(bearerToken);
  req.user = user;
  return next();
}

/**
 * Updates session
 * @function
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {NextFunction} next - Next function
 */
async function updateSession(req: Request, res: Response, next: NextFunction) {
  const header = req.get('Authorization');
  if (!header) {
    res.send(
      new AppDevResponse(
        false,
        { errors: ['Authorization header missing'] },
      ),
    );
    return next(true);
  }
  const bearerToken = header.replace('Bearer ', '').trim();
  if (!bearerToken) {
    res.send(
      new AppDevResponse(
        false,
        { errors: ['Invalid authorization header'] },
      ),
    );
    return next(true);
  }
  const session = await UserSessionsRepo.updateSession(bearerToken);
  if (!session) {
    res.send(
      new AppDevResponse(
        false,
        { errors: ['Invalid refresh token'] },
      ),
    );
    return next(true);
  }
  req.session = session;
  return next();
}

/**
 * Filters bad words
 * @function
 * @param {string} str - String to filter
 * @return {Array<String>} - Array of bad words contained in string
 */
const filterProfanity = (str: string): Array<String> => profanity.check(str); // => [ 'badword1', 'badword2']

/**
 * Checks if the new location is within 300 meters of the
 * old location using Haversine's formula
 */
const isWithin300m = (userCoords: Coord, groupCoords: Coord): boolean => {
  const lat2 = userCoords.lat;
  const lat1 = groupCoords.lat;
  const long2 = userCoords.long;
  const long1 = groupCoords.long;
  if (lat2 && lat1 && long2 && long1) {
    const p = Math.PI / 180;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p) / 2 + c(lat1 * p) * c(lat2 * p) * (1 - c((long2 - long1) * p)) / 2;
    const d = 1000 * 12742 * Math.asin(Math.sqrt(a)); // distance between userCoords and groupCoords in meters
    return d <= 300;
  }
  throw LogUtils.logErr('Cannot perform arithmetic on undefined coordinates');
};

export default {
  remove,
  ensureAuthenticated,
  filterProfanity,
  updateSession,
  isWithin300m,
};
