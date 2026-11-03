const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User model — used for the portfolio owner / blog authors.
 * Passwords are NEVER stored in plain text: they are hashed with bcrypt
 * in a pre-save hook and verified with bcrypt.compare() on login.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [40, 'Username cannot exceed 40 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // never returned by default
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    headline: {
      type: String,
      default: '',
      maxlength: [120, 'Headline cannot exceed 120 characters'],
    },
    skills: {
      type: [String],
      default: [],
    },
    social: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Hash the password whenever it is created or changed.
// NOTE: with Mongoose 8+/9 an async hook must NOT declare a `next` parameter —
// returning a promise is what tells Mongoose the hook has finished.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance helper used by the login controller.
userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Remove the hashed password from any serialized user object.
userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
