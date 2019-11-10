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
* constants for poll states
* @constant
* @enum {string}
*/
const POLL_STATES = {
  LIVE: 'live',
  ENDED: 'ended',
  SHARED: 'shared',
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
export type PollState = 'live' | 'ended' | 'shared'

export default {
  POLL_STATES,
  REQUEST_TYPES,
  USER_TYPES,
};
