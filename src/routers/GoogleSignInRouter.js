// @flow
import { Request } from 'express';
import AppDevRouter from '../utils/AppDevRouter';

import appDevUtils from '../utils/appDevUtils';

class GoogleSignInRouter extends AppDevRouter {
  constructor () {
    super('POST');
  }

  getPath (): string {
    return '/users/google/sign_in/';
  }

  async content (req: Request) {
    // Google OAuth code for token-swap
    const code = req.query.code;
    const form = {
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    };
    const uri = `/oauth2/v4/token?${appDevUtils.encodeUrlParams(form)}`;

    // Make request and await on it
    const googleResponse = await appDevUtils.googleAxios.post(uri);
    // Respond with results
    return googleResponse.data;
  }
}

export default new GoogleSignInRouter().router;
