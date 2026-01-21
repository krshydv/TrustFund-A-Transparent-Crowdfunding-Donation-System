const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected for Seeding'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

// 1. Default Categories (NOW WITH SLUGS)
const categories = [
  { 
    _id: '650c1f1e1c9d440000000000', 
    name: 'Medical', 
    slug: 'medical',  // <-- This was missing
    description: 'Health and medical emergencies', 
    icon: 'heart' 
  },
  { 
    _id: '650c1f1e1c9d440000000001', 
    name: 'Education', 
    slug: 'education', // <-- This was missing
    description: 'Schools, tuition, and supplies', 
    icon: 'book' 
  },
  { 
    _id: '650c1f1e1c9d440000000002', 
    name: 'Environment', 
    slug: 'environment', // <-- This was missing
    description: 'Earthquakes, floods, and nature', 
    icon: 'tree' 
  },
  { 
    _id: '650c1f1e1c9d440000000003', 
    name: 'Animals', 
    slug: 'animals', // <-- This was missing
    description: 'Animal shelters and rescue', 
    icon: 'paw' 
  },
  { 
    _id: '650c1f1e1c9d440000000004', 
    name: 'Children', 
    slug: 'children', // <-- This was missing
    description: 'Orphanages and child welfare', 
    icon: 'child' 
  }
];

// 2. Default Admin User
const adminUser = {
  firstName: 'Admin',
  lastName: 'User',
  email: process.env.ADMIN_EMAIL || 'admin@trustfund.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  role: 'admin',
  isVerified: true,
  phoneNumber: '9999999999'
};

const importData = async () => {
  try {
    // Clear existing data
    await Category.deleteMany();
    // Only delete admin user to avoid wiping your test account
    await User.deleteMany({ email: adminUser.email }); 

    console.log('🗑️  Old Data Cleared...');

    // Import Categories
    await Category.insertMany(categories);
    console.log('✅ Categories Imported!');

    // Import Admin
    await User.create(adminUser);
    console.log(`✅ Admin User Created: ${adminUser.email}`);

    console.log('🏁 Seeding Complete!');
    process.exit();
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
};

importData();