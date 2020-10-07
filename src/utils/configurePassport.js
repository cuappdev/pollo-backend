import { Strategy as BearerStrategy } from 'passport-http-bearer';
import MultiSamlStrategy from 'passport-saml/multiSamlStrategy';
import UserSessionsRepo from '../repos/UserSessionsRepo';
import UsersRepo from '../repos/UsersRepo';

export default (passport) => {
  passport.serializeUser(async (user, done) => {
    done(null, user.uuid || await UserSessionsRepo.getUserFromToken(user.sessionToken));
  });

  passport.deserializeUser(async (uuid, done) => {
    console.log(uuid);
    done(null, await UsersRepo.getUserByID(uuid));
  });

  passport.use(new BearerStrategy(
    (token, cb) => UserSessionsRepo.getUserFromToken(token).then(user => (user ? cb(null, user) : cb(null, false))),
  ));

  passport.use(new MultiSamlStrategy(
    {
      passReqToCallback: true,
      getSamlOptions: (req, done) => { // Chooses saml identity provider based on URL params.
        if (req.params.provider === 'cornell') {
          done(null, {
            path: '/api/v2/auth/saml/cornell/',
            protocol: 'https://',
            entryPoint: 'https://shibidp-test.cit.cornell.edu/idp/profile/SAML2/Redirect/SSO',
            issuer: 'pollo-saml',
          });
        } else done(new Error('Invalid saml provider'));
      },
    },
    async (req, profile, done) => {
      // const uid = profile['urn:oid:0.9.2342.19200300.100.1.1'];
      const givenName = profile['urn:oid:2.5.4.42'];
      const surname = profile['urn:oid:2.5.4.4'];
      const email = profile['urn:oid:0.9.2342.19200300.100.1.3'];

      const session = await UserSessionsRepo
        .createUserAndInitializeSession(givenName, surname, email);

      return done(null, session);
    },
  ));
};
