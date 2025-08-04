// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true, trim: true },
  lastname: { type: String, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  dp: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add 2dsphere index for location queries
userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);

// --- UserData Schema ---
const userDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  height_cm: { type: Number },
  weight_kg: { type: Number },
  fitness_goal: { type: String, enum: ['muscle_gain', 'fat_loss', 'endurance', 'general_fitness'] },
  experience_level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  // Add any other specific user data fields here
}, { timestamps: true });

const UserData = mongoose.model('UserData', userDataSchema);

module.exports = { User, UserData };