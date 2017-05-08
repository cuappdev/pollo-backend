import axios from 'axios';

const API_ROUTE = '/api/v1';

const signIn = (idToken, onSuccess, onFailure) => {
  post('/auth/signin', { idToken: idToken }, onSuccess, onFailure);
};

const get = (route, params, onSuccess, onFailure) => {
  axios.get(API_ROUTE + route, {
    params: params
  })
  .then((response) => onSuccess(response))
  .catch((error) => onFailure(error));
};

const post = (route, body, onSuccess, onFailure) => {
  axios.post(API_ROUTE + route, body)
  .then(onSuccess)
  .catch(onFailure);
};

export { signIn };
