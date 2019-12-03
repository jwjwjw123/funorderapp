const LocalStrategy = require('passport-local').Strategy;
const authenticateUser = require('../services/user.service').authenticateUser;

modules.exports = function (passport) {
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    (email, password, done) => {
      authenticateUser([email, password])
        .then(result => {
          if (result) {
            return done(null, result);
          }
          done(null, false);
        })
    }
  ));
}