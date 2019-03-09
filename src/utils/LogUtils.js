// @flow
import util from 'util';

/**
 * Write object to console, if in production, condense message
 *
 * @param obj
 * @param error
 */
function log(obj: Object, error: ?boolean = false) {
  const options = {
    showHidden: false,
    depth: Infinity,
    colors: true,
    maxArrayLength: 10,
    breakLength: Infinity,
    compact: false,
  };

  if (process.env.NODE_ENV === 'production') {
    options.compact = true;
    options.colors = false;
  }

  if (error) {
    console.error(util.inspect(obj, options));
  } else {
    console.log(util.inspect(obj, options));
  }
}

/**
 * Log error using log()
 *
 * @param message, description of error
 * @param error, the error object
 * @param data, data such as parameters or an object that would help in debugging
 * @param disableConsoleOut, disable console.out in development env, for tests
 * @returns {*}
 */
function logErr(
  message: string,
  error: ?Object = {},
  data: ?Object = {},
  disableConsoleOut: ?boolean = false,
) {
  try { // try block because if the error logging has an error... ?
    if (!error) {
      return null;
    }

    const responseJSON = {
      data,
      error,
      message,
      time: Date.now(),
    };

    log(responseJSON, true);
    return responseJSON;
  } catch (e) {
    return error;
  }
}

export default {
  log,
  logErr,
};
