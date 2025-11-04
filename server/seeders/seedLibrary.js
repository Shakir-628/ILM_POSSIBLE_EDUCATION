import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Book from '../models/Book.js';

dotenv.config();

// Sample books data
const sampleBooks = [
  {
    title: 'Introduction to Computer Science',
    author: 'Dr. Ahmed Hassan',
    isbn: '978-9692234567',
    publisher: 'Oxford University Press',
    category: 'Textbook',
    language: 'English',
    edition: '5th',
    publicationYear: 2023,
    numberOfPages: 450,
    price: 1500,
    totalCopies: 10,
    location: { shelf: 'A1', rack: 'R1', floor: '1st Floor' },
    description: 'Comprehensive guide to computer science fundamentals',
  },
  {
    title: 'Advanced Mathematics Grade 10',
    author: 'Prof. Sarah Khan',
    isbn: '978-9692234568',
    publisher: 'Punjab Textbook Board',
    category: 'Mathematics',
    language: 'English',
    edition: '3rd',
    publicationYear: 2024,
    numberOfPages: 380,
    price: 800,
    totalCopies: 25,
    location: { shelf: 'B2', rack: 'R3', floor: '1st Floor' },
    description: 'Mathematics textbook for SSC Part II',
  },
  {
    title: 'Pakistan Studies',
    author: 'Dr. Muhammad Ali',
    isbn: '978-9692234569',
    publisher: 'Caravan Book House',
    category: 'History',
    language: 'Urdu',
    edition: '2nd',
    publicationYear: 2023,
    numberOfPages: 320,
    price: 650,
    totalCopies: 30,
    location: { shelf: 'C1', rack: 'R2', floor: '2nd Floor' },
    description: 'Complete Pakistan Studies for O/A Levels',
  },
  {
    title: 'Physics Fundamentals',
    author: 'Dr. Fatima Ahmad',
    isbn: '978-9692234570',
    publisher: 'Ferozsons',
    category: 'Science',
    language: 'English',
    edition: '4th',
    publicationYear: 2024,
    numberOfPages: 420,
    price: 1200,
    totalCopies: 15,
    location: { shelf: 'A2', rack: 'R1', floor: '1st Floor' },
    description: 'Physics textbook with practical experiments',
  },
  {
    title: 'English Literature Collection',
    author: 'Various Authors',
    isbn: '978-9692234571',
    publisher: 'Oxford University Press',
    category: 'Literature',
    language: 'English',
    edition: '1st',
    publicationYear: 2023,
    numberOfPages: 560,
    price: 1800,
    totalCopies: 8,
    location: { shelf: 'D1', rack: 'R4', floor: '2nd Floor' },
    description: 'Collection of classic English literature',
  },
  {
    title: 'Biology for Class 9',
    author: 'Dr. Ayesha Siddiqui',
    isbn: '978-9692234572',
    publisher: 'Punjab Textbook Board',
    category: 'Science',
    language: 'English',
    edition: '2nd',
    publicationYear: 2024,
    numberOfPages: 340,
    price: 750,
    totalCopies: 35,
    location: { shelf: 'B1', rack: 'R2', floor: '1st Floor' },
    description: 'Biology textbook for SSC Part I',
  },
  {
    title: 'Islamic Studies',
    author: 'Maulana Abdul Rehman',
    isbn: '978-9692234573',
    publisher: 'Dar-ul-Ishaat',
    category: 'Reference',
    language: 'Urdu',
    edition: '6th',
    publicationYear: 2023,
    numberOfPages: 280,
    price: 500,
    totalCopies: 40,
    location: { shelf: 'E1', rack: 'R5', floor: '2nd Floor' },
    description: 'Islamic Studies for secondary classes',
  },
  {
    title: 'World History',
    author: 'Prof. Imran Malik',
    isbn: '978-9692234574',
    publisher: 'Oxford University Press',
    category: 'History',
    language: 'English',
    edition: '3rd',
    publicationYear: 2023,
    numberOfPages: 480,
    price: 1400,
    totalCopies: 12,
    location: { shelf: 'C2', rack: 'R3', floor: '2nd Floor' },
    description: 'Comprehensive world history',
  },
  {
    title: 'Chemistry Practical',
    author: 'Dr. Kashif Ahmed',
    isbn: '978-9692234575',
    publisher: 'Ferozsons',
    category: 'Science',
    language: 'English',
    edition: '2nd',
    publicationYear: 2024,
    numberOfPages: 220,
    price: 900,
    totalCopies: 20,
    location: { shelf: 'A3', rack: 'R1', floor: '1st Floor' },
    description: 'Chemistry practical and experiments guide',
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    publisher: 'Scribner',
    category: 'Fiction',
    language: 'English',
    edition: '1st',
    publicationYear: 1925,
    numberOfPages: 180,
    price: 600,
    totalCopies: 5,
    location: { shelf: 'D2', rack: 'R4', floor: '2nd Floor' },
    description: 'Classic American literature',
  },
];

const seedLibrary = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('🗑️  Clearing existing books...');
    await Book.deleteMany({});
    
    console.log('📚 Seeding library with sample books...');
    const books = await Book.insertMany(sampleBooks);
    
    console.log(`✅ Successfully added ${books.length} books to library!`);
    console.log('\n📖 Sample Books Added:');
    books.forEach(book => {
      console.log(`   - ${book.bookId}: ${book.title} by ${book.author}`);
    });
    
    console.log('\n🎉 Library seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding library:', error);
    process.exit(1);
  }
};

seedLibrary();

