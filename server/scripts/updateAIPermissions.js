import dotenv from 'dotenv';
import RolePermission from '../models/RolePermission.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const updateAIPermissions = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    console.log('📝 Ensuring AI Exams module exists for relevant roles...');

    const aiModuleFull = {
      moduleName: 'AI Exams',
      enabled: true,
      submodules: [
        { name: 'Create Exam', enabled: true },
        { name: 'Manage Exams', enabled: true },
        { name: 'View Results', enabled: true },
        { name: 'Generate Questions', enabled: true },
        { name: 'Take Exam', enabled: true },
      ],
    };

    const aiModuleStudent = {
      moduleName: 'AI Exams',
      enabled: true,
      submodules: [
        { name: 'Take Exam', enabled: true },
        { name: 'View Results', enabled: true },
      ],
    };

    // Superadmin
    await RolePermission.findOneAndUpdate(
      { role: 'superadmin' },
      { $addToSet: { modules: aiModuleFull } }
    );
    console.log('✅ Superadmin updated');

    // Admin
    await RolePermission.findOneAndUpdate(
      { role: 'admin' },
      { $addToSet: { modules: aiModuleFull } }
    );
    console.log('✅ Admin updated');

    // Teacher
    await RolePermission.findOneAndUpdate(
      { role: 'teacher' },
      { $addToSet: { modules: aiModuleFull } }
    );
    console.log('✅ Teacher updated');

    // Student (limited)
    await RolePermission.findOneAndUpdate(
      { role: 'student' },
      { $addToSet: { modules: aiModuleStudent } }
    );
    console.log('✅ Student updated');

    console.log('\n🎉 AI Exams module ensured for roles.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating AI Exams permissions:', error);
    process.exit(1);
  }
};

updateAIPermissions();
