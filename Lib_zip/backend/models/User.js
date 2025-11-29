/**
 * E:\Codes\LibRepo\Mern\backend\models\User.js
 *
 * User model compatible with existing DB documents (uses passwordHash field).
 * This is the same model we discussed earlier but placed at the exact path.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, enum: ['student','librarian','admin','accountant','supplier'], default: 'student' },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  hireDate: { type: Date },
  salary: { type: Number },
  course: { type: String },
  enrollmentDate: { type: Date },
  accountStatus: { type: String, default: 'active' },
  maxBooks: { type: Number, default: 2 },
  authProviders: { type: mongoose.Schema.Types.Mixed, default: null },
  refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],
  notes: { type: String, default: null }
}, { timestamps: true });

userSchema.virtual('password')
  .set(function(plain) {
    this._password = plain;
    this.passwordHash = plain;
  })
  .get(function() {
    return this._password;
  });

userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('passwordHash')) return next();
    const current = this.passwordHash || '';
    if (typeof current === 'string' && current.startsWith('$2')) {
      return next();
    }
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashed = await bcrypt.hash(current, salt);
    this.passwordHash = hashed;
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = function(plain) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
