import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import dotenv from 'dotenv';
import { User } from '../models/index.js';
import { uploadOAuthProfileImage } from './multer.js';
import { Op } from 'sequelize';
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({
          where: { [Op.or]: [{ email }, { google_id: profile.id }] }
        });

        let profileImageUrl = null;
        if (profile.photos && profile.photos.length > 0) {
          profileImageUrl = await uploadOAuthProfileImage(profile.photos[0].value, email);
        }

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            google_id: profile.id,
            profile_image: profileImageUrl || "/default-avatar.png",
            role: 'jobseeker',
            is_verified: true
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        console.log("Facebook profile:", profile);

        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Facebook account has no email"), null);

        // Look for existing user
        let user = await User.findOne({
          where: { [Op.or]: [{ email }, { facebook_id: profile.id }] },
        });

        let profileImageUrl = null;
        if (profile.photos && profile.photos.length > 0) {
          profileImageUrl = await uploadOAuthProfileImage(profile.photos[0].value, email);
        }

        if (!user) {
          // New Facebook user
          user = await User.create({
            name: profile.name.givenName + " " + profile.name.familyName,
            email,
            facebook_id: profile.id,
            profile_image: profileImageUrl || "/default-avatar.png",
            role: "jobseeker",
            is_verified: true,
          });
        } else if (!user.facebook_id) {
          // Existing user logs in with Facebook
          user.facebook_id = profile.id;
          await user.save();
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.user_id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
