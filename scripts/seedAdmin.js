require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@resellhub.com';
const ADMIN_PASSWORD = 'admin123';

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

  if (existing) {
    existing.role = 'admin';
    existing.password = hashedPassword;
    existing.name = existing.name || 'Admin';
    await existing.save();
    console.log('Admin account updated.');
  } else {
    await User.create({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Admin account created.');
  }

  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
