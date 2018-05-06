const post = (path, body, token) => {
  return {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token },
    url: 'http://localhost:3000/api/v2' + path,
    body: body,
    json: true
  };
};

const put = (path, body, token) => {
  return {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + token },
    uri: 'http://localhost:3000/api/v2' + path,
    body: body,
    json: true
  };
};

const get = (path, token) => {
  return {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
    uri: 'http://localhost:3000/api/v2' + path,
    json: true
  };
};

const del = (path, token) => {
  return {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token },
    uri: 'http://localhost:3000/api/v2' + path,
    json: true
  };
};

module.exports = { post, put, get, del };
