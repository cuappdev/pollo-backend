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

/** Custom type for question types */
export type QuestionType = 'MULTIPLE_CHOICE' | 'FREE_RESPONSE'

/**
* constants for question types
* @constant
* @enum {string}
*/
const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  FREE_RESPONSE: 'FREE_RESPONSE',
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

export default {
  REQUEST_TYPES,
  QUESTION_TYPES,
  USER_TYPES,
};
