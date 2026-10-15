'use strict';

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    const googleId = profile.id;
    const email = profile.emails[0].value;
    let user = users.find((candidate) => candidate.googleId === googleId);
    if (user) return done(null, user);
    user = users.find((candidate) => candidate.email === email);
    if (user) {
      if (!profile._json.email_verified) return done(null, false);
      user.googleId = googleId;
      return done(null, user);
    }
    const newUser = { id: nextId(), googleId, email, name: profile.displayName, role: 'member' };
    users.push(newUser);
    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
    callbackURL: '/auth/google/callback',
  },
  verifyCallback,
));

module.exports = { passport, verifyCallback };
