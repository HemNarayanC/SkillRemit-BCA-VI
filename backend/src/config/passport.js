import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { User } from '../models/index.js';
import { uploadGoogleProfileImage } from './multer.js';
import { Op } from 'sequelize';
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({
          where: { [Op.or]: [{ email }, { google_id: profile.id }] }
        });

        let profileImageUrl = null;
        if (profile.photos && profile.photos.length > 0) {
          profileImageUrl = await uploadGoogleProfileImage(profile.photos[0].value, email);
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
