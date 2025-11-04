import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check for email from command line argument
    const email = process.argv[2];

    if (!email) {
      console.log('\n❌ Please provide an email address');
      console.log('Usage: npm run create-superadmin <email>');
      console.log('Example: npm run create-superadmin admin@school.com\n');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`\n❌ User with email "${email}" not found`);
      console.log('Please register this user first, then run this script\n');
      process.exit(1);
    }

    // Check if already superadmin
    if (user.role === 'superadmin') {
      console.log(`\n✅ User "${user.name}" (${user.email}) is already a SuperAdmin!\n`);
      process.exit(0);
    }

    // Update to superadmin
    const oldRole = user.role;
    user.role = 'superadmin';
    await user.save();

    console.log('\n🎉 SUCCESS! User promoted to SuperAdmin:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:    ${user.email}`);
    console.log(`👤 Name:     ${user.name}`);
    console.log(`🔄 Old Role: ${oldRole}`);
    console.log(`✨ New Role: ${user.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Please logout and login again to see System Logs menu\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();

