import Book from '../models/Book.js';
import BookIssue from '../models/BookIssue.js';
import Student from '../models/Student.js';

// Get all books
export const getAllBooks = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { bookId: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await Book.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
};

// Get book by ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('addedBy', 'name');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
};

// Create book
export const createBook = async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      addedBy: req.user.id,
      availableCopies: req.body.totalCopies || 1,
    };

    const book = new Book(bookData);
    await book.save();

    res.status(201).json({ message: 'Book added successfully', data: book });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Error creating book', error: error.message });
  }
};

// Update book
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book updated successfully', data: book });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
};

// Delete book
export const deleteBook = async (req, res) => {
  try {
    // Check if book has active issues
    const activeIssues = await BookIssue.countDocuments({
      book: req.params.id,
      status: { $in: ['Issued', 'Overdue'] },
    });

    if (activeIssues > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete book. It has active issues. Please return all copies first.' 
      });
    }

    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
};

// Issue book to student
export const issueBook = async (req, res) => {
  try {
    const { bookId, studentId, dueDate, notes } = req.body;

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'No copies available for this book' });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student already has this book
    const existingIssue = await BookIssue.findOne({
      book: bookId,
      student: studentId,
      status: { $in: ['Issued', 'Overdue'] },
    });

    if (existingIssue) {
      return res.status(400).json({ message: 'Student already has this book' });
    }

    // Check student's book limit (max 3 books)
    const studentBooks = await BookIssue.countDocuments({
      student: studentId,
      status: { $in: ['Issued', 'Overdue'] },
    });

    if (studentBooks >= 3) {
      return res.status(400).json({ message: 'Student has reached maximum book limit (3 books)' });
    }

    // Create book issue
    const bookIssue = new BookIssue({
      book: bookId,
      student: studentId,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days default
      notes,
      issuedBy: req.user.id,
      condition: {
        atIssue: book.condition || 'Good',
      },
    });

    await bookIssue.save();

    // Update book availability
    book.issuedCopies += 1;
    book.availableCopies -= 1;
    book.lastIssuedDate = new Date();
    await book.save();

    const populatedIssue = await BookIssue.findById(bookIssue._id)
      .populate('book', 'title author bookId')
      .populate('student', 'firstName lastName studentId rollNumber')
      .populate('issuedBy', 'name');

    res.status(201).json({ 
      message: 'Book issued successfully', 
      data: populatedIssue 
    });
  } catch (error) {
    console.error('Error issuing book:', error);
    res.status(500).json({ message: 'Error issuing book', error: error.message });
  }
};

// Return book
export const returnBook = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { condition, notes } = req.body;

    const bookIssue = await BookIssue.findById(issueId)
      .populate('book');

    if (!bookIssue) {
      return res.status(404).json({ message: 'Book issue record not found' });
    }

    if (bookIssue.status === 'Returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    // Update issue record
    bookIssue.actualReturnDate = new Date();
    bookIssue.status = 'Returned';
    bookIssue.returnedBy = req.user.id;
    bookIssue.condition.atReturn = condition || 'Good';
    if (notes) bookIssue.notes = notes;

    // Calculate fine if overdue
    bookIssue.calculateFine();

    await bookIssue.save();

    // Update book availability
    const book = await Book.findById(bookIssue.book._id);
    book.issuedCopies -= 1;
    book.availableCopies += 1;

    // Update book condition if damaged
    if (condition === 'Damaged' || condition === 'Poor') {
      book.condition = condition;
      if (condition === 'Damaged') {
        book.status = 'Damaged';
      }
    }

    await book.save();

    const populatedIssue = await BookIssue.findById(bookIssue._id)
      .populate('book', 'title author bookId')
      .populate('student', 'firstName lastName studentId')
      .populate('returnedBy', 'name');

    res.json({ 
      message: bookIssue.fine.amount > 0 
        ? `Book returned. Fine: PKR ${bookIssue.fine.amount}` 
        : 'Book returned successfully',
      data: populatedIssue,
      fine: bookIssue.fine,
    });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: 'Error returning book', error: error.message });
  }
};

// Get all book issues
export const getAllIssues = async (req, res) => {
  try {
    const { status, studentId, bookId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (studentId) query.student = studentId;
    if (bookId) query.book = bookId;

    const issues = await BookIssue.find(query)
      .populate('book', 'title author bookId coverImage')
      .populate('student', 'firstName lastName studentId rollNumber grade section photo')
      .populate('issuedBy', 'name')
      .populate('returnedBy', 'name')
      .sort({ issueDate: -1 });

    // Calculate fines for overdue books
    for (let issue of issues) {
      if (issue.status === 'Issued' || issue.status === 'Overdue') {
        issue.calculateFine();
        if (issue.isModified()) {
          await issue.save();
        }
      }
    }

    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Error fetching issues', error: error.message });
  }
};

// Get student's borrowed books
export const getStudentBooks = async (req, res) => {
  try {
    const { studentId } = req.params;

    const issues = await BookIssue.find({
      student: studentId,
      status: { $in: ['Issued', 'Overdue'] },
    })
      .populate('book', 'title author bookId coverImage')
      .populate('issuedBy', 'name')
      .sort({ issueDate: -1 });

    // Calculate current fines
    for (let issue of issues) {
      issue.calculateFine();
      if (issue.isModified()) {
        await issue.save();
      }
    }

    res.json(issues);
  } catch (error) {
    console.error('Error fetching student books:', error);
    res.status(500).json({ message: 'Error fetching student books', error: error.message });
  }
};

// Get overdue books
export const getOverdueBooks = async (req, res) => {
  try {
    const overdueIssues = await BookIssue.find({
      status: 'Overdue',
    })
      .populate('book', 'title author bookId')
      .populate('student', 'firstName lastName studentId email phone grade section')
      .populate('issuedBy', 'name')
      .sort({ dueDate: 1 });

    // Update fines
    for (let issue of overdueIssues) {
      issue.calculateFine();
      await issue.save();
    }

    res.json(overdueIssues);
  } catch (error) {
    console.error('Error fetching overdue books:', error);
    res.status(500).json({ message: 'Error fetching overdue books', error: error.message });
  }
};

// Renew book
export const renewBook = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { newDueDate } = req.body;

    const bookIssue = await BookIssue.findById(issueId);

    if (!bookIssue) {
      return res.status(404).json({ message: 'Book issue not found' });
    }

    if (bookIssue.status !== 'Issued') {
      return res.status(400).json({ message: 'Only issued books can be renewed' });
    }

    if (bookIssue.renewalCount >= 2) {
      return res.status(400).json({ message: 'Maximum renewal limit reached (2 times)' });
    }

    // Add to renewal history
    bookIssue.renewalHistory.push({
      date: new Date(),
      newDueDate: newDueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      renewedBy: req.user.id,
    });

    bookIssue.dueDate = newDueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    bookIssue.renewalCount += 1;
    await bookIssue.save();

    const populatedIssue = await BookIssue.findById(bookIssue._id)
      .populate('book', 'title author')
      .populate('student', 'firstName lastName studentId');

    res.json({ message: 'Book renewed successfully', data: populatedIssue });
  } catch (error) {
    console.error('Error renewing book:', error);
    res.status(500).json({ message: 'Error renewing book', error: error.message });
  }
};

// Pay fine
export const payFine = async (req, res) => {
  try {
    const { issueId } = req.params;

    const bookIssue = await BookIssue.findById(issueId);

    if (!bookIssue) {
      return res.status(404).json({ message: 'Book issue not found' });
    }

    if (bookIssue.fine.paid) {
      return res.status(400).json({ message: 'Fine already paid' });
    }

    bookIssue.fine.paid = true;
    bookIssue.fine.paidDate = new Date();
    await bookIssue.save();

    res.json({ message: 'Fine paid successfully', data: bookIssue });
  } catch (error) {
    console.error('Error paying fine:', error);
    res.status(500).json({ message: 'Error paying fine', error: error.message });
  }
};

// Get library statistics
export const getLibraryStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ status: 'Available' });
    const issuedBooks = await BookIssue.countDocuments({ status: { $in: ['Issued', 'Overdue'] } });
    const overdueBooks = await BookIssue.countDocuments({ status: 'Overdue' });
    
    const totalFines = await BookIssue.aggregate([
      { $match: { 'fine.paid': false, 'fine.amount': { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$fine.amount' } } },
    ]);

    const categoryStats = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const popularBooks = await BookIssue.aggregate([
      { $group: { _id: '$book', issueCount: { $sum: 1 } } },
      { $sort: { issueCount: -1 } },
      { $limit: 10 },
    ]);

    const populatedPopularBooks = await Book.populate(popularBooks, {
      path: '_id',
      select: 'title author bookId',
    });

    res.json({
      totalBooks,
      availableBooks,
      issuedBooks,
      overdueBooks,
      totalFines: totalFines[0]?.total || 0,
      categoryStats,
      popularBooks: populatedPopularBooks,
    });
  } catch (error) {
    console.error('Error fetching library stats:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

// Get book history
export const getBookHistory = async (req, res) => {
  try {
    const { bookId } = req.params;

    const history = await BookIssue.find({ book: bookId })
      .populate('student', 'firstName lastName studentId grade section')
      .populate('issuedBy', 'name')
      .populate('returnedBy', 'name')
      .sort({ issueDate: -1 });

    res.json(history);
  } catch (error) {
    console.error('Error fetching book history:', error);
    res.status(500).json({ message: 'Error fetching book history', error: error.message });
  }
};

// Search books
export const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const books = await Book.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { isbn: { $regex: q, $options: 'i' } },
        { bookId: { $regex: q, $options: 'i' } },
      ],
      status: 'Available',
    }).limit(20);

    res.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ message: 'Error searching books', error: error.message });
  }
};

