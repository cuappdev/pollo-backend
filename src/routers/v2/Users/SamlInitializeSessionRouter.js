// @flow
import { Request } from 'express';
import passport from 'passport';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';

import type { APIUserSession } from '../APITypes';

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
      passport.authenticate('saml', { session: false }),
      (req, res) => {
        let session = JSON.stringify(req.user);
        res.send(`<!DOCTYPE html>
<html>
    <h1>:)</h1>
    <script>
        if (window.webkit) window.webkit.messageHandlers.sessionTokenHandler.postMessage(${session});
        else if (typeof Mobile !== 'undefined') Mobile.handleToken(JSON.stringify(${session}));
        else window.location = "http://localhost:3000";
    </script>
</html>
        `);
      },
    ];
  }

  async content(req: Request) {
    return req.user;
  }
}

export default new SamlInitializeSessionRouter().router;
