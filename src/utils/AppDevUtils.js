// @flow
// General utility functions / Objects helpful in a JS setting across
// all AppDev projects

/**
 * Check if a string is an AppDev-formatted URL. An AppDev formatted URL is
 * either just a '/', or begins and ends with a `/`, and must have some
 * characters in between.
 */
const tryCheckAppDevURL = (path: string) => {
  if (path !== '/' && path.length < 2) {
    throw new Error('Invalid path');
  } else if (path[0] !== '/') {
    throw new Error('Path must start with a \'/\'');
  } else if (path[path.length - 1] !== '/') {
    throw new Error('Path must end with a \'/\'');
  }
};

/**
 * Extracts netid from email
 * @function
 * @param {string} email - Email to extract netid from
 * @return {string} Netid from email
 */
const netIDFromEmail = (email: string): string => email.substring(0, email.indexOf('@'));

/**
 * Generates random alphanumeric string
 * @function
 * @param {number} length - Desired length of random code
 * @return {string} Randomly generated code
 */
const randomCode = (length: number): string => {
  // Don't allow 0, O, and I to avoid confusion
  const allowedChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  while (result.length < length) {
    result += allowedChars[Math.floor(Math.random() * allowedChars.length)];
  }
  return result;
};

const isDevelopment = process.env.NODE_ENV === 'development';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  netIDFromEmail,
  randomCode,
  tryCheckAppDevURL,
  isDevelopment,
  isProduction
};
