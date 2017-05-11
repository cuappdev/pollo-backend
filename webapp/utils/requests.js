import axios from 'axios';
import { browserHistory } from 'react-router';

const API_ROUTE = '/api/v1';

const signIn = (idToken, onSuccess, onFailure) => {
  post('/auth/signin', { idToken: idToken }, (data) => {
    localStorage.setItem('name', data.displayName);
    localStorage.setItem('email', data.email);
    localStorage.setItem('netid', data.netid);
    browserHistory.push('/app');
    onSuccess(data);
  }, onFailure);
};

const getClasses = (onSuccess, onFailure) => {
  get('/classes/enrolled', {}, onSuccess, onFailure);
};

const get = (route, params, onSuccess, onFailure) => {
  axios.get(API_ROUTE + route, {
    params: params
  })
  .then((response) => onSuccess(response.data))
  .catch((error) => onFailure(error));
};

const post = (route, body, onSuccess, onFailure) => {
  axios.post(API_ROUTE + route, body)
  .then((response) => onSuccess(response.data))
  .catch(onFailure);
};

export { signIn, getClasses };
