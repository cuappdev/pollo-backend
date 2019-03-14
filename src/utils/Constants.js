// flow

/** Custom type for http request types */
export type RequestType = 'POST' | 'GET' | 'DELETE' | 'PUT';

/**
 * constants for request types
 * @constant
 * @enum {string}
 */
const REQUEST_TYPES = {
  POST: 'POST',
  GET: 'GET',
  DELETE: 'DELETE',
  PUT: 'PUT',
};

/**
* constants for question types
* @constant
* @enum {string}
*/
const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multipleChoice',
  FREE_RESPONSE: 'freeResponse',
};

/**
* constants for user types
* @constant
* @enum {string}
*/
const USER_TYPES = {
  ADMIN: 'admin',
  MEMBER: 'member',
};

/** Custom types for Poll type */
export type PollState = "live" | "ended" | "shared"
export type PollType = "multipleChoice" | "freeResponse"

export default {
  REQUEST_TYPES,
  QUESTION_TYPES,
  USER_TYPES,
};
