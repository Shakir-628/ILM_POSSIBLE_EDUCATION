import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Subject from '../models/Subject.js';
import Class from '../models/Class.js';

dotenv.config();

const seedSubjectsAndClasses = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    console.log('📝 Seeding subjects and classes...');

    // Sample subjects
    const subjects = [
      {
        subjectName: 'Mathematics',
        subjectCode: 'MATH001',
        description: 'Core Mathematics',
        type: 'core',
        status: 'active',
      },
      {
        subjectName: 'English',
        subjectCode: 'ENG001',
        description: 'English Language and Literature',
        type: 'core',
        status: 'active',
      },
      {
        subjectName: 'Science',
        subjectCode: 'SCI001',
        description: 'General Science',
        type: 'core',
        status: 'active',
      },
      {
        subjectName: 'Social Studies',
        subjectCode: 'SS001',
        description: 'History, Geography, Civics',
        type: 'core',
        status: 'active',
      },
      {
        subjectName: 'Hindi',
        subjectCode: 'HIN001',
        description: 'Hindi Language',
        type: 'core',
        status: 'active',
      },
      {
        subjectName: 'Computer Science',
        subjectCode: 'CS001',
        description: 'Computer Science and Programming',
        type: 'elective',
        status: 'active',
      },
    ];

    // Sample classes
    const classes = [
      {
        className: 'Class 10',
        grade: '10',
        section: 'A',
        capacity: 30,
        academicYear: '2025-2026',
        status: 'active',
      },
      {
        className: 'Class 10 B',
        grade: '10',
        section: 'B',
        capacity: 30,
        academicYear: '2025-2026',
        status: 'active',
      },
      {
        className: 'Class 9',
        grade: '9',
        section: 'A',
        capacity: 35,
        academicYear: '2025-2026',
        status: 'active',
      },
      {
        className: 'Class 9 B',
        grade: '9',
        section: 'B',
        capacity: 35,
        academicYear: '2025-2026',
        status: 'active',
      },
      {
        className: 'Class 8',
        grade: '8',
        section: 'A',
        capacity: 40,
        academicYear: '2025-2026',
        status: 'active',
      },
    ];

    // Delete existing data (optional - remove if you want to keep existing)
    await Subject.deleteMany({});
    await Class.deleteMany({});
    console.log('🗑️  Cleared existing subjects and classes');

    // Insert subjects
    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`✅ Created ${createdSubjects.length} subjects`);
    createdSubjects.forEach((s) => {
      console.log(`   - ${s.subjectName} (${s.subjectCode})`);
    });

    // Insert classes
    const createdClasses = await Class.insertMany(classes);
    console.log(`✅ Created ${createdClasses.length} classes`);
    createdClasses.forEach((c) => {
      console.log(`   - ${c.className}`);
    });

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 You can now create exams with:');
    console.log('   Subject: "Mathematics", "English", "Science", "Social Studies", "Hindi", "Computer Science"');
    console.log('   Class: "Class 10", "Class 10 B", "Class 9", "Class 9 B", "Class 8"');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedSubjectsAndClasses();
