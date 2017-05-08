import React from 'react';
import GoogleLogin from 'react-google-login';

import { signIn } from '../../utils/requests';

class Login extends React.Component {
  handleSuccess (r) {
    const idToken = r.tokenId;
    signIn(idToken);
  }

  handleFailure (r) {
    console.log(r.error);
  }

  render () {
    return (
      <div>
        <h1>Login</h1>
        <GoogleLogin
          clientId='198217256369-7c2t4igthjeathod9trgn5fk0jeqb0jd.apps.googleusercontent.com'
          onSuccess={(r) => this.handleSuccess(r)}
          onFailure={(r) => this.handleFailure(r)}
        />
      </div>
    );
  }
}

export default Login;
