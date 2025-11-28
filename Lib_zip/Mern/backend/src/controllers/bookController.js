const Book = require('../models/Book');

// create book (admin/manager)
exports.addBook = async (req, res, next) => {
  try {
    const b = await Book.create(req.body);
    res.status(201).json(b);
  } catch (err) { next(err); }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    const q = {};
    if (req.query.q) {
      q.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { authors: { $regex: req.query.q, $options: 'i' } },
        { isbn: { $regex: req.query.q, $options: 'i' } },
      ];
    }
    const books = await Book.find(q).lean();
    res.json(books);
  } catch (err) { next(err); }
};

exports.getBookById = async (req, res, next) => {
  try {
    const b = await Book.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Book not found' });
    res.json(b);
  } catch (err) { next(err); }
};

// update stock when delivered or changed
exports.updateBook = async (req, res, next) => {
  try {
    const b = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(b);
  } catch (err) { next(err); }
};
