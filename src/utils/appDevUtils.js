// @flow
// General utility functions / Objects helpful in a JS setting across
// all AppDev projects
import axios from 'axios';

const encodeUrlParams = (params: { [string]: any }): string => Object.keys(params).map((k: string) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');

const googleAxios = axios.create({
  baseURL: 'https://www.googleapis.com',
  timeout: 5000
});

const insertIntoMySQLStatement = (
  tableName: string,
  fields: Object
): string => {
  const columns = `(${Object.keys(fields).join(', ')})`;
  const valuesStr = Object.keys(fields).map((k) => {
    const value = fields[k];
    return typeof value === 'string'
      ? `'${fields[k]}'`
      : `${fields[k]}`;
  }).join(', ');
  const values = `(${valuesStr})`;
  return `INSERT INTO ${tableName} ${columns} VALUES ${values};`;
};

const netIdFromEmail = (email: string): string => email.substring(0, email.indexOf('@'));

const randomCode = (length: number): string => {
  const code = Math.round(((36 ** (length + 1)) - Math.random()
    * (36 ** length))).toString(36).slice(1).toUpperCase();
  return code;
};

export default {
  encodeUrlParams,
  googleAxios,
  insertIntoMySQLStatement,
  netIdFromEmail,
  randomCode
};
