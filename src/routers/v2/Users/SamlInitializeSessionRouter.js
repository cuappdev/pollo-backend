// @flow
import passport from 'passport';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';

import type { APIUserSession } from '../APITypes';
import UserSessionsRepo from '../../../repos/UserSessionsRepo';

class SamlInitializeSessionRouter extends AppDevRouter<APIUserSession> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    // Provider param selects SAML identity provider (ex: cornell).
    // Providers specified in utils/configurePassport.js
    return '/auth/saml/:provider/';
  }

  middleware() {
    return [
      passport.authenticate('saml'),
      async (req, res) => {
        const session = JSON.stringify((await UserSessionsRepo.createOrUpdateSession(req.user)).serialize());
        res.send(`<!DOCTYPE html>
<html>
    <h1>:)</h1>
    <script>
        if (window.webkit) window.webkit.messageHandlers.sessionTokenHandler.postMessage(${session});
        else if (typeof Mobile !== 'undefined') Mobile.handleToken(JSON.stringify(${session}));
        else window.location = ${process.env.LOGIN_REDiRECT};
    </script>
</html>
        `);
      },
    ];
  }
}

export default new SamlInitializeSessionRouter().router;
