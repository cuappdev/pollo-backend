var formurlencoded = require('form-urlencoded');

const post = (path, body) => {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    uri: 'http://localhost:3000/api/v1' + path,
    body: formurlencoded(body)
  };
};

const put = (path, body) => {
  return {
    method: 'PUT',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    uri: 'http://localhost:3000/api/v1' + path,
    body: formurlencoded(body)
  };
};

const get = (path) => {
  return {
    method: 'GET',
    uri: 'http://localhost:3000/api/v1' + path
  };
};

const del = (path) => {
  return {
    method: 'DELETE',
    uri: 'http://localhost:3000/api/v1' + path
  };
};

module.exports = { post, put, get, del };
