// @flow
import { Request } from 'express';
import AppDevRouter from '../utils/AppDevRouter';
import SessionsRepo from '../repos/SessionsRepo';
import UsersRepo from '../repos/UsersRepo';
import constants from '../utils/constants';

import appDevUtils from '../utils/appDevUtils';

class GetMeRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/users/google_sign_in/';
  }

  async content (req: Request) {
    const accessToken = req.query.accessToken;
    const params = {
      access_token: accessToken,
      alt: 'json'
    };
    const uri = `/oauth2/v1/userinfo?${appDevUtils.encodeUrlParams(params)}`;

    // Grab JSON info about the user from Google
    const googleResponse = await appDevUtils.googleAxios.get(uri);
    const data = googleResponse.data;

    // Check if user exists, if not make a new one
    let user = await UsersRepo.getUserByGoogleId(data['id']);
    if (!user) {
      user = await UsersRepo.createUser({
        googleId: data['id'],
        netId: appDevUtils.netIdFromEmail(data['email']),
        firstName: data['given_name'],
        lastName: data['family_name'],
        email: data['email']
      });
    }

    // Create or update the session associated w/this user
    const session = await SessionsRepo.createOrUpdateSession(user);

    return {
      user: user,
      session: session
    };
  }
}

export default new GetMeRouter().router;
