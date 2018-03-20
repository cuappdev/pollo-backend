var formurlencoded = require('form-urlencoded');

const post = (path, body, token) => {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + token},
    uri: 'http://localhost:3000/api/v1' + path,
    body: formurlencoded(body)
  };
};

const put = (path, body, token) => {
  return {
    method: 'PUT',
    headers: { 'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + token },
    uri: 'http://localhost:3000/api/v1' + path,
    body: formurlencoded(body)
  };
};

const get = (path, token) => {
  return {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
    uri: 'http://localhost:3000/api/v1' + path
  };
};

const del = (path, token) => {
  return {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token },
    uri: 'http://localhost:3000/api/v1' + path
  };
};

module.exports = { post, put, get, del };
