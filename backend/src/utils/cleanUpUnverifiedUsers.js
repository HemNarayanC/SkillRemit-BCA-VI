import User from '../models/index.js';
import OTPVerification from '../models/OTPVerification.js';
import { Op } from 'sequelize';

export const cleanUpUnverifiedUsers = async () => {
  try {
    const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Find all unverified users created before 24 hours
    const usersToDelete = await User.findAll({
      where: {
        is_verified: false,
        created_at: { [Op.lt]: expiredDate }
      }
    });

    for (const user of usersToDelete) {
      await OTPVerification.destroy({ where: { user_id: user.user_id } });
      await user.destroy();
      console.log(`Deleted unverified user: ${user.email}`);
    }
  } catch (err) {
    console.error("Error cleaning up unverified users:", err);
  }
};
