import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (user) => {
  const payload = {
    user_id: user.user_id,
    role: user.role
  };

  // Include identifiers only if they exist
  if (user.email) payload.email = user.email;
  if (user.phone) payload.phone = user.phone;

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

  return token;
};
