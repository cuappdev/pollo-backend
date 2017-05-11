import React from 'react';
import GoogleLogin from 'react-google-login';

import { signIn } from '../../utils/requests';

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
      <div>
        <h1>Login</h1>
        <GoogleLogin
          clientId='198217256369-7c2t4igthjeathod9trgn5fk0jeqb0jd.apps.googleusercontent.com'
          onSuccess={(r) => this.handleSuccess(r.tokenId)}
          onFailure={(r) => this.handleFailure(r.error)}
        />
      </div>
    );
  }
}

export default Login;
