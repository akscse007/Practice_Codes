const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const User = require('../models/User');
const calcFine = require('../utils/calcFine');
const Fine = require('../models/Fine');

exports.issueBook = async (req, res, next) => {
  try {
    const { studentId, bookId, days=14 } = req.body;
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) return res.status(400).json({ message: 'Book unavailable' });

    // check borrow limits (example: 2)
    const student = await User.findById(studentId).populate('activeBorrows');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (student.borrowedCount >= 2) return res.status(400).json({ message: 'Borrow limit reached' });

    const dueAt = new Date(Date.now() + days*24*60*60*1000);
    const borrow = await Borrow.create({ student: studentId, book: bookId, dueAt });

    book.availableCopies -= 1;
    await book.save();

    student.borrowedCount += 1;
    student.activeBorrows.push(borrow._id);
    await student.save();

    res.status(201).json(borrow);
  } catch (err) { next(err); }
};

exports.returnBook = async (req, res, next) => {
  try {
    const { borrowId } = req.params;
    const borrow = await Borrow.findById(borrowId).populate('book student');
    if (!borrow) return res.status(404).json({ message: 'Borrow not found' });
    if (borrow.returnedAt) return res.status(400).json({ message: 'Already returned' });

    borrow.returnedAt = new Date();
    borrow.status = 'returned';
    await borrow.save();

    // update book
    const book = await Book.findById(borrow.book._id);
    book.availableCopies += 1;
    await book.save();

    // update student
    const student = await User.findById(borrow.student._id);
    student.borrowedCount = Math.max(0, student.borrowedCount - 1);
    student.activeBorrows = student.activeBorrows.filter(id => id.toString() !== borrow._id.toString());
    await student.save();

    // calculate fine if overdue
    const amount = calcFine(borrow.dueAt, borrow.returnedAt, 10); // rate configurable
    if (amount > 0) {
      const fine = await Fine.create({ borrow: borrow._id, student: student._id, amount });
      return res.json({ borrow, fine });
    }

    res.json({ borrow, fine: null });
  } catch (err) { next(err); }
};

exports.getBorrowHistory = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user._id;
    const records = await Borrow.find({ student: studentId }).populate('book').sort('-issuedAt');
    res.json(records);
  } catch (err) { next(err); }
};
