import { Strategy as BearerStrategy } from 'passport-http-bearer';
import MultiSamlStrategy from 'passport-saml/multiSamlStrategy';
import UserSessionsRepo from '../repos/UserSessionsRepo';
import UsersRepo from '../repos/UsersRepo';

export default (passport) => {
  passport.serializeUser(async (user, done) => {
    done(null, user.uuid);
  });

  passport.deserializeUser(async (uuid, done) => {
    const user = await UsersRepo.getUserByID(uuid);
    done(null, user);
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
            protocol: 'http://',
            entryPoint: 'https://shibidp-test.cit.cornell.edu/idp/profile/SAML2/Redirect/SSO',
            issuer: 'pollo-saml',
          });
        } else done(new Error('Invalid saml provider'));
      },
    },
    async (req, profile, done) => {
      const givenName = profile['urn:oid:2.5.4.42'];
      const surname = profile['urn:oid:2.5.4.4'];
      const email = profile['urn:oid:0.9.2342.19200300.100.1.3'];

      let user = await UsersRepo.getUserByEmail(email);
      if (user === null || user === undefined) user = UsersRepo.createUserWithFields(givenName, surname, email);

      return done(null, user);
    },
  ));
};
