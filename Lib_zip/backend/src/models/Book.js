const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  authors: [String],
  isbn: { type: String, index: true, unique: true, sparse: true },
  publisher: String,
  year: Number,
  category: String,
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  lowStockThreshold: { type: Number, default: 2 },
  createdAt: { type: Date, default: Date.now },
  // optional fields: coverUrl, description
});

module.exports = mongoose.model('Book', bookSchema);
