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

const listUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('\n❌ No users found in database\n');
      process.exit(0);
    }

    console.log('\n📋 LIST OF ALL USERS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    users.forEach((user, index) => {
      const roleIcon = {
        superadmin: '👑',
        admin: '🔑',
        teacher: '👨‍🏫',
        student: '🎓',
      }[user.role] || '👤';
      
      const statusIcon = user.isActive ? '✅' : '❌';
      
      console.log(`\n${index + 1}. ${roleIcon} ${user.name}`);
      console.log(`   📧 Email:  ${user.email}`);
      console.log(`   🎭 Role:   ${user.role.toUpperCase()}`);
      console.log(`   ${statusIcon} Status: ${user.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Total Users: ${users.length}`);
    console.log(`👑 SuperAdmins: ${users.filter(u => u.role === 'superadmin').length}`);
    console.log(`🔑 Admins:      ${users.filter(u => u.role === 'admin').length}`);
    console.log(`👨‍🏫 Teachers:    ${users.filter(u => u.role === 'teacher').length}`);
    console.log(`🎓 Students:    ${users.filter(u => u.role === 'student').length}\n`);

    console.log('💡 To promote a user to SuperAdmin:');
    console.log('   npm run create-superadmin <email>\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

listUsers();

