const post = (path, body, token) => ({
    body,
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    url: `http://localhost:3000/api/v2${path}`,
    json: true,
});

const put = (path, body, token) => ({
    body,
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    uri: `http://localhost:3000/api/v2${path}`,
    json: true,
});

const get = (path, token) => ({
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    uri: `http://localhost:3000/api/v2${path}`,
    json: true,
});

const del = (path, token) => ({
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    uri: `http://localhost:3000/api/v2${path}`,
    json: true,
});

module.exports = {
    post, put, get, del,
};
