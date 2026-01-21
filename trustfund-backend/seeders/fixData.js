const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Donation = require('../models/Donation');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ DB Connected for Cleanup'))
  .catch(err => console.error(err));

const fixData = async () => {
  try {
    console.log('🧹 Starting Cleanup...');

    // 1. Fix "undefined undefined" names
    const badNames = await Donation.find({ donorName: { $regex: /undefined/i } });
    console.log(`Found ${badNames.length} records with 'undefined' names.`);

    for (let donation of badNames) {
      // Try to find real user name
      const user = await User.findById(donation.donor);
      if (user) {
        donation.donorName = `${user.firstName} ${user.lastName}`;
      } else {
        donation.donorName = "Valued Donor";
      }
      await donation.save();
    }

    // 2. Fix Missing/Null names
    const nullNames = await Donation.updateMany(
      { $or: [{ donorName: null }, { donorName: "" }] },
      { $set: { donorName: "Anonymous Supporter" } }
    );
    console.log(`Fixed ${nullNames.modifiedCount} records with missing names.`);

    console.log('✨ Database Cleaned! Refresh your dashboard.');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixData();