const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Donation = require('../models/Donation');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch(err => console.error(err));

const recalc = async () => {
  try {
    console.log('🔧 Fixing Donation Statuses...');
    // 1. Ensure all donations count as 'completed'
    await Donation.updateMany({}, { $set: { status: 'completed' } });

    console.log('🔄 Recalculating User Totals...');
    const users = await User.find({});

    for (let user of users) {
      // 2. Calculate Totals
      const donations = await Donation.find({ donor: user._id });
      const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
      const count = donations.length;

      // 3. FIX BAD DATA (The solution to your error)
      // If names are missing, give placeholders
      if (!user.firstName) user.firstName = "Unknown";
      if (!user.lastName) user.lastName = "User";
      
      // If role is invalid (e.g. 'donor'), force it to 'user'
      if (user.role !== 'admin' && user.role !== 'user') {
        console.log(`⚠️ Fixing invalid role '${user.role}' for ${user.email}`);
        user.role = 'user';
      }

      // 4. Update Stats
      user.totalDonated = totalAmount;
      user.donationCount = count;

      // 5. FORCE SAVE (Skip validation to prevent crashes)
      await user.save({ validateBeforeSave: false });
      
      if (totalAmount > 0) {
        console.log(`👤 ${user.email}: Synced -> ₹${totalAmount} (${count} donations)`);
      }
    }

    console.log('✨ All Profiles Synced & Fixed!');
    process.exit();
  } catch (error) {
    console.error('❌ Script Failed:', error);
    process.exit(1);
  }
};

recalc();