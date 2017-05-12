import React from 'react';
import GoogleLogin from 'react-google-login';

import { signIn } from '../../utils/requests';

require('../../stylesheets/login/Login.scss');

class Login extends React.Component {
  handleSuccess (idToken) {
    signIn(idToken, (response) => {}, (error) => {
      this.handleFailure(error);
    });
  }

  handleFailure (error) {
    console.log(error);
  }

  render () {
    return (
      <div className='login-page'>
        <h1>CliquePod</h1>
        <GoogleLogin
          className='google-login-btn'
          clientId='198217256369-7c2t4igthjeathod9trgn5fk0jeqb0jd.apps.googleusercontent.com'
          onSuccess={(r) => this.handleSuccess(r.tokenId)}
          onFailure={(r) => this.handleFailure(r.error)}>
          <div className='google-login-icon'>
            <i className='fa fa-google fa-2x' aria-hidden='true' />
          </div>
          <div className='google-login-text'>
            <span>Login with Google</span>
          </div>
        </GoogleLogin>
      </div>
    );
  }
}

export default Login;
