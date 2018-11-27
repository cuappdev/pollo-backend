// @flow
// General utility functions / Objects helpful in a JS setting across
// all AppDev projects
import axios from 'axios';

const googleAxios = axios.create({
    baseURL: 'https://www.googleapis.com',
    timeout: 5000,
});

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
const randomCode = (length: number): string => Math.round(((36 ** (length + 1)) - Math.random()
    * (36 ** length))).toString(36).slice(1).toUpperCase();

export default {
    googleAxios,
    netIDFromEmail,
    randomCode,
};
